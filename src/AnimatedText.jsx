import { useState, useEffect } from "react";
import { Typewriter } from "react-simple-typewriter";
import { useNavigate } from "react-router-dom";

function AnimatedText() {
  // Renamed state for clarity: controls the visibility of the *entire card*
  const [isCardVisible, setIsCardVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Timer to make the card visible after typing finishes.
    // Estimate timing: "Welcome, Operator!" (18 chars) * 100ms/char + 1000ms delay = 2800ms
    // Add a small buffer. Adjust if typing speed/delay changes.
    const timer = setTimeout(() => {
      setIsCardVisible(true);
    }, 500); // Increased delay slightly

    return () => clearTimeout(timer);
  }, []); // Runs only once on mount

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      {/* Main Card Container: Apply transition and conditional visibility HERE */}
      <div
        className={`
          w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-2xl flex flex-col items-center
          bg-transparent shadow-[0_0_15px_2px_rgba(255,121,198,0.3)] /* Your background and subtle glow */

          /* --- Transition Classes --- */
          transition-all duration-1000 ease-out /* Controls fade/slide speed and easing */

          /* --- Conditional Visibility & Position --- */
          ${isCardVisible
            ? 'opacity-100 translate-y-0' // Final state: visible, normal position
            : 'opacity-0 translate-y-10' // Initial state: invisible, slightly down
          }
        `}
      >
        {/* Typing Effect: Content is now always inside the card, appears *with* the card */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 tektur-font text-white drop-shadow-lg leading-snug text-center">
          <Typewriter
            words={["Welcome, Operator!"]}
            loop={false} typeSpeed={100} deleteSpeed={50} delaySpeed={1000} cursor={true}
          />
        </h1>

        {/* Inner Content: Removed conditional opacity - appears with the card now */}
        <div className={`w-full flex flex-col items-center`}>
          {/* Second Text */}
          <h2 className="mt-2 text-xl sm:text-2xl font-light mb-10 text-blue-100 text-center">
            Are you ready to break free and rewrite the system?
          </h2>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row mt-6 space-y-4 sm:space-y-0 sm:space-x-8">
            <button
              className="glow-btn bg-pink-800 text-white px-8 py-3 sm:py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-pink-700 transition hover:scale-105"
              onClick={() => navigate("/challenges")}
            >
              Yes
            </button>
            <button
              className="glow-btn bg-blue-700 text-white px-8 py-3 sm:py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-pink-600 hover:scale-105 transition"
              onMouseEnter={(e) => { e.target.innerText = "Yes"; }}
              onMouseLeave={(e) => { e.target.innerText = "No"; }}
              onClick={() => navigate("/challenges")}
            >
              No
            </button>
          </div>
        </div>
      </div>

      {/* Custom styles - REMOVED glass-card as it's not used */}
      <style jsx>{`
        /* .glass-card { ... }  <- Removed */
        .glow-btn {
          box-shadow: 0 0 16px 2px #ff79c6, 0 2px 8px 0 #1e2a47; /* Kept original */
          /* Add transition for the glow itself if needed */
          transition: box-shadow 0.3s ease-in-out, background-color 0.3s ease, transform 0.2s ease;
        }
        .glow-btn:hover {
           box-shadow: 0 0 20px 4px rgba(255, 121, 198, 0.8), 0 3px 10px 0 #1e2a47; /* Enhanced hover glow */
        }
        .tektur-font {
          font-family: 'Tektur', Arial, sans-serif !important;
        }
      `}</style>
    </div>
  );
}

export default AnimatedText;