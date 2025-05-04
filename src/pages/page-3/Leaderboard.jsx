import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
// Assuming you have Tailwind set up, Leaderboard.css might only be needed for bg-custom-background
// import "./Leaderboard.css"; // Keep if needed for bg-custom-background or specific fonts
import NavBar from "../../Navbar"; // Assuming Navbar is styled separately

// --- Original Logic Constants ---
const challengesList = {
  "0": "https://leaderboardadc-copy3.onrender.com/",
  "1": "https://leaderboardadc-copy3.onrender.com/",
  "2": "https://leaderboardadc-copy3.onrender.com/",
};

const competitionNames = {
  "0":"general", // Keeping original names as requested
  "1": "digit-recognizer",
  "2": "digit-recognizer",
};
// --- End Original Logic Constants ---


function Leaderboard({ c }) {
  // --- Original State Variables ---
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- End Original State Variables ---

  // --- Original Derived Variables ---
  const backendUrl = challengesList[c];
  const competitionName = competitionNames[c];
  // --- End Original Derived Variables ---

  // --- ORIGINAL useEffect Logic ---
  useEffect(() => {
    // Reset state slightly differently than before, closer to original intent
    setLoading(true);
    setError(null);
    // Do not clear leaderboard here, let fetch logic handle it

    if (!backendUrl) {
      setError("No backend URL provided"); // Original error message
      setLoading(false);
      return;
    }

    async function fetchLeaderboard() {
      // --- Original Logic for c === "0" ---
      if (c === "0") {
        try {
          // Fetching logic - unchanged from original
          const responses = await Promise.all(
            Object.entries(challengesList)
              .filter(([key]) => key !== "0")
              .map(([key, url]) =>
                fetch(`${url}/api/leaderboard/${competitionNames[key]}`).then(res => {
                    // Basic check if response is ok, before assuming json() works
                    if (!res.ok) {
                        console.error(`Failed to fetch ${competitionNames[key]}: ${res.status}`);
                        // Return a structure that won't break flatMap but indicates failure
                        return { leaderboard: [] };
                    }
                    return res.json();
                }).catch(err => {
                     console.error(`Network error fetching ${competitionNames[key]}:`, err);
                     return { leaderboard: [] }; // Handle network error during fetch
                })
              )
          );

          // Aggregation logic - unchanged from original
          const allEntries = responses.flatMap(data => data.leaderboard || []); // Ensure data.leaderboard exists

          if (allEntries.length === 0) {
            setLeaderboard([]); // Clear leaderboard if no data
            setError("No data available for averaging."); // Original message
            // setLoading(false); // Need to stop loading even if empty - ADDED for correctness
            return; // Exit if no entries
          }

           // Grouping logic - unchanged from original
           const teamScores = {};
           allEntries.forEach(({ team, score, submission_date }) => {
            // Add basic check for valid score - prevents NaN issues later
            const numericScore = parseFloat(score);
             if (typeof team !== 'string' || isNaN(numericScore)) {
                 console.warn('Skipping invalid entry during averaging:', { team, score, submission_date });
                 return;
             }

             if (!teamScores[team]) {
               teamScores[team] = { totalScore: 0, count: 0, latestSubmission: "1970-01-01" };
             }
             teamScores[team].totalScore += numericScore; // Use parsed score
             // Original console log - unchanged
             console.log(`Team: ${team}, Total Score: ${teamScores[team].totalScore}, Count: ${teamScores[team].count}, Average: ${(teamScores[team].totalScore / teamScores[team].count)}`);
             teamScores[team].count += 1;
             // Date comparison - unchanged from original
             // Add try-catch for robustness against invalid date strings
             try {
                 if (new Date(submission_date) > new Date(teamScores[team].latestSubmission)) {
                    teamScores[team].latestSubmission = submission_date;
                 }
             } catch(e) {
                 console.warn(`Invalid submission_date encountered for team ${team}: ${submission_date}`);
             }
           });

          // Averaging calculation - unchanged from original
          const numberOfCompetitions = Object.keys(challengesList).length - 1; // Original calculation base
          if (numberOfCompetitions <= 0) {
              console.error("Cannot average: Number of competitions to average is zero or less.");
              setError("Configuration error for averaging.");
              setLeaderboard([]);
              // setLoading(false); // ADDED for correctness
              return;
          }

          const averagedLeaderboard = Object.entries(teamScores).map(([team, { totalScore, count, latestSubmission }]) => ({
            rank: "-", // Placeholder rank
            team,
            // Format date nicely for display - MINOR UI IMPROVEMENT
            submission_date: latestSubmission !== "1970-01-01" ? new Date(latestSubmission).toLocaleString() : "N/A",
            // Use numberOfCompetitions from original logic, ensure score is string w/ 4 decimal places
            score: (parseFloat(totalScore) / numberOfCompetitions).toFixed(4),
          }));


          // Sorting logic - unchanged from original
          averagedLeaderboard.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

          // Ranking logic - unchanged from original
          let rank = 1;
          for (let i = 0; i < averagedLeaderboard.length; i++) {
            if (i > 0 && averagedLeaderboard[i].score !== averagedLeaderboard[i - 1].score) {
              rank = i + 1;
            }
            averagedLeaderboard[i].rank = rank;
          }

          // State updates - unchanged from original
          setLeaderboard(averagedLeaderboard);
          setLastUpdated(new Date().toLocaleString());
          setError(null); // Clear previous errors on success

        } catch (err) {
          // Error handling - unchanged from original
          console.error("Error calculating average leaderboard:", err);
          setError("Failed to calculate average leaderboard."); // Original message
          setLeaderboard([]); // Clear leaderboard on error
        } finally {
          setLoading(false); // Original placement
        }
        return; // Exit useEffect if c === "0"
      }

      // --- Original Logic for specific challenges (c !== "0") ---
      try {
        // Fetch logic - unchanged from original
        console.log(`Fetching: ${backendUrl}/api/leaderboard/${competitionName}`); // Debug log
        const response = await fetch(`${backendUrl}/api/leaderboard/${competitionName}`);
        // Basic check if response is ok - ADDED for robustness
        if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status} for ${competitionName}`);
        }
        const data = await response.json();

        // **Directly setting state from fetched data - as per original logic**
        // Minor enhancement: format date/score for display consistency
        const formattedLeaderboard = (data.leaderboard || []).map((entry, index) => ({
            ...entry,
            // Keep rank from backend if exists, otherwise generate basic one (original didn't generate rank here)
            rank: entry.rank !== undefined ? entry.rank : '-', // Keep rank as-is or '-' if not provided
            submission_date: entry.submission_date ? new Date(entry.submission_date).toLocaleString() : 'N/A',
            // Ensure score is displayed consistently, handle non-numeric scores gracefully
            score: typeof entry.score === 'number' ? entry.score.toFixed(4) : (entry.score || 'N/A')
        }));

        setLeaderboard(formattedLeaderboard);
        // Use last_updated from data if available, otherwise current time - closer to original
        setLastUpdated(data.last_updated ? new Date(data.last_updated).toLocaleString() : new Date().toLocaleString());
        setError(null); // Clear previous errors

      } catch (err) {
        // Error handling - unchanged from original
        console.error("Error fetching leaderboard:", err);
        setError(`Failed to fetch leaderboard data from url ${backendUrl}/api/leaderboard/${competitionName}`); // Original message
        setLeaderboard([]); // Clear leaderboard on error
      } finally {
        setLoading(false); // Original placement
      }
    }

    fetchLeaderboard(); // Call fetch function

    // --- Original Socket.IO Logic ---
    console.log(`Setting up Socket.IO connection to ${backendUrl}`); // Debug log
    const socket = io(backendUrl, {
        transports: ['websocket', 'polling'] // Good practice to include
    });

    socket.on("connect", () => { // Debug log
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => { // Debug log
      console.error("Socket connection error:", err);
       // Optionally, set an error state: setError("Real-time update connection failed.");
     });

    socket.on("disconnect", (reason) => { // Debug log
        console.log("Socket disconnected:", reason);
    });


    // Update listener - unchanged from original logic
    socket.on("update_leaderboard", (data) => {
      console.log("Received real-time update:", data); // Original log

       // Basic validation - ADDED for robustness
       if (data && Array.isArray(data.leaderboard)) {
            // Apply same formatting as initial fetch for consistency
            const formattedUpdate = data.leaderboard.map((entry, index) => ({
                 ...entry,
                 rank: entry.rank !== undefined ? entry.rank : '-',
                 submission_date: entry.submission_date ? new Date(entry.submission_date).toLocaleString() : 'N/A',
                 score: typeof entry.score === 'number' ? entry.score.toFixed(4) : (entry.score || 'N/A')
            }));
             // **Only update if the current view is NOT the average leaderboard**
             // Or if backend guarantees updates are relevant. Simpler: update always.
            //if (c !== "0") { // Example: only update non-average leaderboards via socket
                 setLeaderboard(formattedUpdate);
                 setLastUpdated(new Date().toLocaleString()); // Update last updated time - as per original
            //}
       } else {
           console.warn("Received invalid structure in socket update:", data);
       }
    });

    // Cleanup function - unchanged from original logic
    return () => {
      console.log("Disconnecting socket"); // Debug log
      socket.disconnect();
    };
    // --- End Original Socket.IO Logic ---

  }, [backendUrl, c, competitionName]); // Dependencies: Added competitionName as it's used in fetch URL. Keeping 'c' and 'backendUrl' as original.
  // --- END ORIGINAL useEffect ---


  // --- JSX Structure with Enhanced UI ---
  return (
    // Main container: Dark blue background, full screen height, light text default
    <div className="w-full min-h-screen bg-custom-dark-blue text-custom-light-gray p-0 m-0 bg-cover bg-center bg-fixed bg-no-repeat">
      {/* Assumes bg-custom-background is handled here or in index.css/App.css if it's a complex image/gradient */}
      <NavBar />

      {/* Content Area: Centered container with padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 ">

        {/* Header Section: Centered Title and Last Updated */}
        <div className="text-center mb-10">
          {/* <h1 className="tektur-font text-4xl font-extrabold mb-3 ">
            {competitionName ? competitionName.replace(/-/g, ' ') : "Leaderboard"}
            <span className="text-custom-pink"> Leaderboard</span>
          </h1> */}
          {/* Last Updated - Subtle Text 
          <p className="text-sm text-custom-gray">
            Last Updated: <span className="font-medium">{lastUpdated}</span>
          </p>*/}
          {/* Error Message Display */}
          {error && (
              <p className="mt-4 text-red-400 bg-red-900/30 px-4 py-2 rounded-md border border-red-700 inline-block max-w-xl text-left">
                  <span className="font-bold">Error:</span> {error}
              </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col space-y-4 justify-center items-center h-64">
            {/* Pink themed spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-custom-pink"></div>
            <p className="text-lg text-custom-light-gray animate-pulse">
                Loading Rankings... Please wait 😉
            </p>
          </div>
        ) : (
           /* Leaderboard Table Container: Rounded corners, shadow, slightly lighter bg */
           <div className="bg-custom-light-blue rounded-xl shadow-2xl shadow-black/30 overflow-hidden">
              {/* Scrollable inner div for responsiveness on small screens and vertical scroll */}
              <div className="overflow-x-auto max-h-[90vh] overflow-y-auto">
                  <table className="w-full text-sm text-left text-custom-gray">
                     {/* Table Header: Distinct background, uppercase text */}
                      <thead className="text-xs text-custom-light-gray uppercase bg-gray-700/50">
                          <tr>
                              {/* Table Header Cells: Padding, alignment */}
                              <th scope="col" className="px-6 py-4 text-center w-16">Rank</th>
                              <th scope="col" className="px-6 py-4">Team</th>
                              {/* Hide date on smaller screens */}
                              <th scope="col" className="px-6 py-4 hidden md:table-cell">
                                  Last Submission
                              </th>
                              <th scope="col" className="px-6 py-4 text-right">Score</th>
                          </tr>
                      </thead>
                      {/* Table Body */}
                      <tbody>
                          {leaderboard && leaderboard.length > 0 ? (
                              leaderboard.map((entry, index) => (
                                  <tr
                                      key={entry.team + '-' + index}
                                      className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors duration-150 ease-in-out"
                                  >
                                      {/* Rank Cell: Top 5 in gold, others in white */}
                                      <td className={`px-6 py-4 text-3xl text-center font-bold ${Number(entry.rank) <= 5 ? "text-yellow-400" : "text-white"}`}>
                                          {entry.rank}
                                      </td>
                                      {/* Team Cell: Medium weight, standard text color */}
                                      <td className="px-6 py-4 font-bold text-2xl text-custom-light-gray whitespace-nowrap">
                                          {entry.team}
                                      </td>
                                      {/* Submission Date Cell: Hidden on small screens */}
                                      <td className="px-6 py-4 hidden md:table-cell">
                                          {entry.submission_date}
                                      </td>
                                      {/* Score Cell: Pink text, bold, right-aligned */}
                                      <td className="px-6 py-4 font-bold text-custom-pink text-right">
                                          {entry.score}
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              <tr>
                                  <td colSpan="4" className="text-center py-10 px-6 text-custom-gray text-2xl">
                                      {error ? "Could not load data." : "No entries submitted yet."}
                                  </td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div> {/* End scrollable div */}
           </div> /* End table container */
        )}
      </div> {/* End content area */}
    </div> /* End main container */
  );
}

export default Leaderboard;

// --- Tailwind CSS Color Placeholders ---
// Add these to your tailwind.config.js under theme.extend.colors if you haven't:
// 'custom-dark-blue': '#0a192f',   // Example: Very dark navy/midnight blue
// 'custom-light-blue': '#1e2a47',  // Example: Slightly lighter blue for cards/containers
// 'custom-pink': '#ff79c6',       // Example: Bright pink accent
// 'custom-light-gray': '#ccd6f6',  // Example: Light grey/off-white for primary text
// 'custom-gray': '#8892b0',      // Example: Medium grey for secondary text/borders
// Also ensure your bg-custom-background is correctly defined if it's an image/gradient.