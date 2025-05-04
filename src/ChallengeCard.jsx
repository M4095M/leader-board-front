import React, { useState, useEffect } from 'react';

// Removed the Tag component as it's no longer needed for difficulty

function ChallengeCard({
  title,
  description,
  weight, // Weight prop will be displayed directly
  challengeLink,
  challengeNum,
  animationIndex = 0 // Default index to 0
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50); // Small delay before starting animation trigger

    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  // Calculate delay based on index
  const delayClass = `delay-[${animationIndex * 100}ms]`;

  return (
    <div
      className={`
        bg-gradient-to-br from-pink-600/10 to-pink-700 /* Pink/Purple Gradient Theme */
        rounded-xl shadow-xl overflow-hidden p-6
        text-white /* Light text for contrast */
        flex flex-col  justify-between /* Align content and button */
        transform transition-all duration-700 ease-out ${delayClass} /* Base transition and delay */
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} /* Slide-up & Fade-in effect */
      `}
    >
      {/* Card Content */}
      <div>
        {/* Top section with Title and Challenge Number */}
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <span className="text-sm font-mono bg-pink-800/70 px-2 py-0.5 rounded">#{challengeNum}</span>
        </div>

        {/* Description */}
        <p className="text-pink-100 text-sm mb-4 leading-relaxed">
            {description}
        </p>

        {/* Display Weight directly - NEW */}
        {weight && ( // Only display if weight prop is provided
            <p className="text-pink-200 text-xs font-medium mt-2">
                <span className="font-semibold">Weight:</span> {weight}
            </p>
        )}
        {/* REMOVED the Tag component usage here */}
      </div>

      {/* Action Button (Link to Challenge) */}
      <div className="mt-6 text-center ">
        <a
          href={challengeLink}
          target="_blank" // Open link in new tab
          rel="noopener noreferrer" // Security best practice
          className={`
            inline-block bg-pink-950 text-white
            font-semibold py-2 px-6 rounded-lg
            hover:bg-pink-100 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75
            transition duration-200 ease-in-out
            transform transition-all duration-500 ease-out delay-[${animationIndex * 100 + 200}ms] /* Button animation */
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} /* Button animation state */
          `}
          onClick={(e) => challengeLink === "#" && e.preventDefault()} // Disable link if placeholder
          aria-disabled={challengeLink === "#"}
        >
          {challengeLink === "#" ? "Coming Soon" : "View Challenge"}
        </a>
      </div>
    </div>
  );
}

export default ChallengeCard;