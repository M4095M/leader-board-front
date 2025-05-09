import React, { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import NavBar from "../../Navbar";

// --- ORGANIZER CONFIGURATION FOR SECRET CHALLENGE ---
const ACTIVATE_SECRET_CHALLENGE_5 = false; // Controls visibility for specific challenge views, but not averaging
// ----------------------------------------------------

// --- NEW Centralized Challenge Data Structure ---
const challengesConfig = {
  "1": {
    id: "1",
    url: "https://leader-board-back.onrender.com/",
    competitionName: "adc4-yassir",
    weight: 0.15,
    isActive: true,
    displayName: "adc4-yassir",
  },
  "2": {
    id: "2",
    url: "https://leader-board-back.onrender.com/",
    competitionName: "ADC-4-0-BNP-Paribas-El-Djazair",
    weight: 0.3,
    isActive: true,
    displayName: "ADC-4-0-BNP-Paribas-El-Djazair",
  },
  "3": {
    id: "3",
    url: "https://leader-board-back.onrender.com/",
    competitionName: "adc-4-0-social-o-scope",
    weight: 0.2,
    isActive: true,
    displayName: "adc-4-0-social-o-scope",
  },
  "4": {
    id: "4",
    url: "https://leader-board-back.onrender.com/",
    competitionName: "adc-4-0-gt",
    weight: 0.2,
    isActive: true,
    displayName: "adc-4-0-gt",
  },
  "5": {
    id: "5",
    url: "  ",
    competitionName: "adc-4-0-biopharm",
    weight: 0.15,
    isActive: ACTIVATE_SECRET_CHALLENGE_5, // Still used for specific challenge views (c === "5")
    displayName: "adc-4-0-biopharm",
  }
};
// --- End Centralized Challenge Data Structure ---

function Leaderboard({ c }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentChallengeConfig = useMemo(() => {
    if (c === "0") {
      return {
        id: "0",
        url: Object.values(challengesConfig).find(ch => ch.url)?.url || "https://leader-board-back.onrender.com/",
        competitionName: "General Weighted Average",
        displayName: "Overall Leaderboard"
      };
    }
    return challengesConfig[c];
  }, [c]);

  const backendUrl = currentChallengeConfig?.url;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setLeaderboard([]);

    if (!currentChallengeConfig) {
      setError(`Invalid challenge ID: ${c}`);
      setLoading(false);
      return;
    }
    if (c !== "0" && !backendUrl) {
      setError(`No backend URL configured for challenge ${c}`);
      setLoading(false);
      return;
    }

    async function fetchLeaderboard() {
      // --- Logic for General Weighted Average Leaderboard (c === "0") ---
      if (c === "0") {
        try {
          // Use all challenges for averaging, regardless of isActive
          const allChallenges = Object.values(challengesConfig);
          if (allChallenges.length === 0) {
            setError("No challenges configured for averaging.");
            setLeaderboard([]);
            setLoading(false);
            return;
          }

          // Normalize weights to ensure they sum to 1.0
          const totalWeight = allChallenges.reduce((sum, ch) => sum + ch.weight, 0);
          if (totalWeight === 0) {
            setError("Total weight of challenges is zero.");
            setLeaderboard([]);
            setLoading(false);
            return;
          }

          const fetchPromises = allChallenges.map(challenge =>
            fetch(`${challenge.url}/api/leaderboard/${challenge.competitionName}`)
              .then(res => {
                if (!res.ok) {
                  console.error(`Failed to fetch ${challenge.competitionName}: ${res.status}`);
                  return { challengeId: challenge.id, weight: challenge.weight, leaderboardData: { leaderboard: [] } };
                }
                return res.json().then(data => ({ challengeId: challenge.id, weight: challenge.weight, leaderboardData: data }));
              })
              .catch(err => {
                console.error(`Network error fetching ${challenge.competitionName}:`, err);
                return { challengeId: challenge.id, weight: challenge.weight, leaderboardData: { leaderboard: [] } };
              })
          );

          const responses = await Promise.all(fetchPromises);

          const teamScores = {};
          const allTeams = new Set();
          responses.forEach(response => {
            const { leaderboardData } = response;
            (leaderboardData.leaderboard || []).forEach(({ team }) => {
              if (typeof team === 'string') {
                allTeams.add(team);
              }
            });
          });

          allTeams.forEach(team => {
            teamScores[team] = { weightedScoreSum: 0, totalWeightApplicable: 0, latestSubmission: "1970-01-01" };
          });

          responses.forEach(response => {
            const { challengeId, weight, leaderboardData } = response;
            const normalizedWeight = weight / totalWeight; // Normalize weight
            const challengeTeams = new Set((leaderboardData.leaderboard || []).map(entry => entry.team));

            (leaderboardData.leaderboard || []).forEach(({ team, score, submission_date }) => {
              let numericScore = parseFloat(score);
              if (typeof team !== 'string' || isNaN(numericScore)) {
                console.warn('Skipping invalid entry during averaging:', { team, score, submission_date });
                return;
              }

              // Normalize RMSE for challenge 2
              if (challengeId === "2") {
                numericScore = 1 / (1 + numericScore);
              }

              teamScores[team].weightedScoreSum += numericScore * normalizedWeight;
              teamScores[team].totalWeightApplicable += normalizedWeight;

              try {
                if (new Date(submission_date) > new Date(teamScores[team].latestSubmission)) {
                  teamScores[team].latestSubmission = submission_date;
                }
              } catch (e) {
                console.warn(`Invalid submission_date for team ${team} in challenge ${challengeId}: ${submission_date}`);
              }
            });

            allTeams.forEach(team => {
              if (!challengeTeams.has(team)) {
                teamScores[team].weightedScoreSum += 0 * normalizedWeight; // Score of 0
                teamScores[team].totalWeightApplicable += normalizedWeight;
              }
            });
          });

          if (Object.keys(teamScores).length === 0) {
            setError("No teams found across any challenge.");
            setLeaderboard([]);
            setLoading(false);
            return;
          }

          const weightedLeaderboard = Object.entries(teamScores)
            .map(([team, { weightedScoreSum, totalWeightApplicable, latestSubmission }]) => {
              const finalScore = totalWeightApplicable > 0 ? weightedScoreSum / totalWeightApplicable : 0;
              return {
                rank: "-",
                team,
                submission_date: latestSubmission !== "1970-01-01" ? new Date(latestSubmission).toLocaleString() : "N/A",
                score: finalScore.toFixed(4),
              };
            })
            .filter(entry => entry.score > 0 || entry.totalWeightApplicable > 0);

          weightedLeaderboard.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

          let rank = 1;
          for (let i = 0; i < weightedLeaderboard.length; i++) {
            if (i > 0 && weightedLeaderboard[i].score !== weightedLeaderboard[i - 1].score) {
              rank = i + 1;
            }
            weightedLeaderboard[i].rank = rank;
          }

          setLeaderboard(weightedLeaderboard);
          setLastUpdated(new Date().toLocaleString());
          setError(null);

        } catch (err) {
          console.error("Error calculating weighted average leaderboard:", err);
          setError("Failed to calculate weighted average leaderboard.");
          setLeaderboard([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      // --- Logic for specific challenges (c !== "0") ---
      // Respect isActive for specific challenge views
      if (c !== "0" && !currentChallengeConfig.isActive) {
        setError(`Challenge ${currentChallengeConfig.displayName} is not active.`);
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching: ${currentChallengeConfig.url}/api/leaderboard/${currentChallengeConfig.competitionName}`);
        const response = await fetch(`${currentChallengeConfig.url}/api/leaderboard/${currentChallengeConfig.competitionName}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${currentChallengeConfig.competitionName}`);
        }
        const data = await response.json();

        const formattedLeaderboard = (data.leaderboard || []).map((entry) => ({
          ...entry,
          rank: entry.rank !== undefined ? entry.rank : '-',
          submission_date: entry.submission_date ? new Date(entry.submission_date).toLocaleString() : 'N/A',
          score: typeof entry.score === 'number' ? entry.score.toFixed(4) : (entry.score || 'N/A')
        }));

        setLeaderboard(formattedLeaderboard);
        setLastUpdated(data.last_updated ? new Date(data.last_updated).toLocaleString() : new Date().toLocaleString());
        setError(null);

      } catch (err) {
        console.error("Error fetching specific leaderboard:", err);
        setError(`Failed to fetch leaderboard for ${currentChallengeConfig.displayName}.`);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();

    if (!backendUrl) {
      console.warn("No backend URL for socket connection.");
      return;
    }

    console.log(`Setting up Socket.IO connection to ${backendUrl}`);
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("connect_error", (err) => console.error("Socket connection error:", err));
    socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

    socket.on("update_leaderboard", (data) => {
      console.log("Received real-time update:", data);
      if (c === "0" && data.competitionName) {
        // For general leaderboard, refetch and recalculate average on any challenge update
        fetchLeaderboard();
      } else if (data && Array.isArray(data.leaderboard)) {
        const formattedUpdate = data.leaderboard.map((entry) => ({
          ...entry,
          rank: entry.rank !== undefined ? entry.rank : '-',
          submission_date: entry.submission_date ? new Date(entry.submission_date).toLocaleString() : 'N/A',
          score: typeof entry.score === 'number' ? entry.score.toFixed(4) : (entry.score || 'N/A')
        }));
        setLeaderboard(formattedUpdate);
        setLastUpdated(new Date().toLocaleString());
      } else {
        console.warn("Received invalid structure in socket update:", data);
      }
    });

    return () => {
      console.log("Disconnecting socket");
      socket.disconnect();
    };
  }, [c, currentChallengeConfig, backendUrl]);

  return (
    <div className="w-full min-h-screen bg-custom-dark-blue text-custom-light-gray p-0 m-0 bg-cover bg-center bg-fixed bg-no-repeat">
      <NavBar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="text-center mb-10">
          {error && (
            <p className="mt-4 text-red-400 bg-red-900/30 px-4 py-2 rounded-md border border-red-700 inline-block max-w-xl text-left">
              <span className="font-bold">Error:</span> {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col space-y-4 justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-custom-pink"></div>
            <p className="text-lg text-custom-light-gray animate-pulse">
              Loading Rankings... Please wait 😉
            </p>
          </div>
        ) : (
          <div className="bg-custom-light-blue rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
              <table className="w-full text-sm text-left text-custom-gray">
                <thead className="text-xs text-custom-light-gray uppercase bg-gray-700/50 sticky top-0 z-10">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-center w-16 sm:w-20">Rank</th>
                    <th scope="col" className="px-6 py-4">Team</th>
                    <th scope="col" className="px-6 py-4 hidden md:table-cell">
                      Last Submission
                    </th>
                    <th scope="col" className="px-6 py-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard && leaderboard.length > 0 ? (
                    leaderboard.map((entry, index) => (
                      <tr
                        key={entry.team + '-' + index + '-' + entry.rank}
                        className="border-b border-gray-700 hover:bg-gray-600/30 transition-colors duration-150 ease-in-out"
                      >
                        <td className={`px-6 py-3 text-xl sm:text-2xl text-center font-bold ${Number(entry.rank) <= 3 ? "text-yellow-400" : (Number(entry.rank) <=10 ? "text-slate-300" : "text-white")}`}>
                          {entry.rank}
                        </td>
                        <td className="px-6 py-3 font-medium text-base sm:text-lg text-custom-light-gray whitespace-nowrap">
                          {entry.team}
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          {entry.submission_date}
                        </td>
                        <td className="px-6 py-3 font-bold text-base sm:text-lg text-custom-pink text-right">
                          {entry.score}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-10 px-6 text-custom-gray text-lg sm:text-xl">
                        {error ? "Could not load data." : "No entries submitted yet or data is being processed."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;

// Remember to define Tailwind CSS Color Placeholders in your tailwind.config.js
// 'custom-dark-blue': '#0a192f',
// 'custom-light-blue': '#1e2a47',
// 'custom-pink': '#ff79c6',
// 'custom-light-gray': '#ccd6f6',
// 'custom-gray': '#8892b0',