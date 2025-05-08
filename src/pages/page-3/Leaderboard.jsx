import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { io } from "socket.io-client";
import NavBar from "../../Navbar";

// --- ORGANIZER CONFIGURATION FOR SECRET CHALLENGE ---
const ACTIVATE_SECRET_CHALLENGE_5 = false; // Set to true to include Challenge 5 in averages
// ----------------------------------------------------

// --- NEW Centralized Challenge Data Structure ---
const challengesConfig = {
  "1": {
    id: "1",
    url: "https://leaderboardadc-copy3.onrender.com/", // Replace with actual URLs if different per challenge
    competitionName: "predict-away-wins", // Example: Replace with actual Kaggle competition slug or your API endpoint name
    weight: 0.25, // Example weight
    isActive: true, // Always active
    displayName: "digit-recognizer",
  },
  "2": {
    id: "2",
    url: "https://leaderboardadc-copy3.onrender.com/",
    competitionName: "digit-recognizerl",
    weight: 0.25,
    isActive: true,
    displayName: "Groundwater Level",
  },
  "3": {
    id: "3",
    url: "https://leaderboardadc-copy3.onrender.com/",
    competitionName: "digit-recognizer",
    weight: 0.30,
    isActive: true,
    displayName: "Image Classification",
  },
  "4": {
    id: "4",
    url: "https://leaderboardadc-copy3.onrender.com/",
    competitionName: "digit-recognizer",
    weight: 0.20,
    isActive: true,
    displayName: "Sentiment Analysis",
  },
  "5": { // The 5th (secret) challenge
    id: "5",
    url: "https://leaderboardadc-copy3.onrender.com/",
    competitionName: "digit-recognizer", // Example
    weight: 0.40, // Can have a different weight
    isActive: ACTIVATE_SECRET_CHALLENGE_5, // Controlled by the flag above
    displayName: "SECRET: Anomaly Detection",
  }
};
// --- End Centralized Challenge Data Structure ---


function Leaderboard({ c }) { // 'c' is the challenge ID string: "0" for general, "1", "2", etc. for specific
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derived variables using useMemo for efficiency
  const currentChallengeConfig = useMemo(() => {
    if (c === "0") { // General leaderboard
      return {
        id: "0",
        url: Object.values(challengesConfig).find(ch => ch.url)?.url || "https://leaderboardadc-copy3.onrender.com/", // Fallback or determine primary URL
        competitionName: "General Weighted Average",
        displayName: "Overall Leaderboard"
      };
    }
    return challengesConfig[c];
  }, [c]);

  const backendUrl = currentChallengeConfig?.url; // Base URL for socket connection, adjust if needed

  useEffect(() => {
    setLoading(true);
    setError(null);
    setLeaderboard([]); // Clear previous data

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
          const activeChallenges = Object.values(challengesConfig).filter(ch => ch.isActive);
          if (activeChallenges.length === 0) {
            setError("No active challenges configured for averaging.");
            setLeaderboard([]);
            setLoading(false);
            return;
          }

          const fetchPromises = activeChallenges.map(challenge =>
            fetch(`${challenge.url}/api/leaderboard/${challenge.competitionName}`)
              .then(res => {
                if (!res.ok) {
                  console.error(`Failed to fetch ${challenge.competitionName}: ${res.status}`);
                  return { challengeId: challenge.id, weight: challenge.weight, leaderboardData: { leaderboard: [] } }; // Include ID and weight
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
          // teamScores structure:
          // { teamName: { weightedScoreSum: 0, totalWeightApplicable: 0, latestSubmission: "1970-01-01", submissions: {} } }

          responses.forEach(response => {
            const { challengeId, weight, leaderboardData } = response;
            (leaderboardData.leaderboard || []).forEach(({ team, score, submission_date }) => {
              const numericScore = parseFloat(score);
              if (typeof team !== 'string' || isNaN(numericScore)) {
                console.warn('Skipping invalid entry during averaging:', { team, score, submission_date });
                return;
              }

              if (!teamScores[team]) {
                teamScores[team] = { weightedScoreSum: 0, totalWeightApplicable: 0, latestSubmission: "1970-01-01" };
              }

              teamScores[team].weightedScoreSum += numericScore * weight;
              teamScores[team].totalWeightApplicable += weight;

              try {
                if (new Date(submission_date) > new Date(teamScores[team].latestSubmission)) {
                  teamScores[team].latestSubmission = submission_date;
                }
              } catch (e) {
                console.warn(`Invalid submission_date for team ${team} in challenge ${challengeId}: ${submission_date}`);
              }
            });
          });

          if (Object.keys(teamScores).length === 0) {
             setError("No data available from any active challenge for averaging.");
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
                score: finalScore.toFixed(4), // Weighted average score
              };
            })
            .filter(entry => entry.score > 0 || entry.totalWeightApplicable > 0); // Optionally filter out teams with no scores if desired

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
        return; // Exit useEffect if c === "0"
      }

      // --- Logic for specific challenges (c !== "0") ---
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

    // --- Socket.IO Logic ---
    // Socket should connect to a relevant backend, potentially the primary one or specific one if c !== "0"
    // For simplicity, using the 'backendUrl' derived for the current view.
    // If general view (c==="0"), this might be a main URL.
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
      // This update logic might need to be smarter for c === "0".
      // If backend sends individual challenge update, client would need to re-fetch and re-calculate average.
      // For now, assuming the update is for the currently viewed leaderboard type.
      // If c === "0" and the backend sends a fully recalculated *weighted* leaderboard, this is fine.
      // If c !== "0" and backend sends an update for that specific challenge, this is fine.
      if (data && Array.isArray(data.leaderboard)) {
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
    // --- End Socket.IO Logic ---

  }, [c, currentChallengeConfig, backendUrl]); // Added currentChallengeConfig and backendUrl

  // --- JSX Structure ---
  return (
    <div className="w-full min-h-screen bg-custom-dark-blue text-custom-light-gray p-0 m-0 bg-cover bg-center bg-fixed bg-no-repeat">
      <NavBar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16"> {/* Added more padding top/bottom */}

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
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto"> {/* Adjusted max-h */}
              <table className="w-full text-sm text-left text-custom-gray">
                <thead className="text-xs text-custom-light-gray uppercase bg-gray-700/50 sticky top-0 z-10"> {/* Sticky header */}
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
                        key={entry.team + '-' + index + '-' + entry.rank} // More unique key
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