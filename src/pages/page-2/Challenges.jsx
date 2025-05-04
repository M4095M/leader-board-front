import React from "react";
import ChallengeCard from "../../ChallengeCard"; // Adjust path if needed
import NavBar from "../../Navbar";           // Adjust path if needed

function Challenges() {
  // Array of challenge data - Expanded to 4 items
  const challenges = [
    {
      id: 1, // Added unique ID for potentially better keys
      title: "ADC4.0 - Predict Away Wins",
      description:
        "Predict if the away team wins a football match based on pre-match stats. Analyse team form, player stats, and historical data.",
      weight: "Medium", // Using text descriptions might be clearer than kg
      challengeLink: "https://www.kaggle.com/t/f50c00eaf34148ad9a1db9c093683273",
      challengeNum: "1",
    },
    {
      id: 2,
      title: "ADC4.0 - Groundwater Level",
      description:
        "Classify groundwater levels (Very Low to Very High) using station data including location, water quality, and population.",
      weight: "Medium",
      challengeLink: "https://www.kaggle.com/t/c3290c6d0a844179a8d665e07562677d",
      challengeNum: "2",
    },
    // --- Added Placeholder Challenges ---
    {
      id: 3,
      title: "ADC4.0 - Image Classification",
      description:
        "Develop a model to classify images into predefined categories. Explore CNNs and data augmentation techniques.",
      weight: "High",
      challengeLink: "#", // Replace with actual link if available
      challengeNum: "3",
    },
    {
      id: 4,
      title: "ADC4.0 - Sentiment Analysis",
      description:
        "Build a classifier to determine the sentiment (positive, negative, neutral) expressed in text reviews or comments.",
      weight: "Low",
      challengeLink: "#", // Replace with actual link if available
      challengeNum: "4",
    },
    // Add more challenges here if needed...
  ];

  return (
    // Ensure bg-custom-background provides a nice contrast with pink cards
    <div className="w-full min-h-screen bg-custom-background bg-cover bg-center bg-fixed p-0 m-0 bg-no-repeat">
      <NavBar />
      {/* Adjust container padding and grid definition */}
      <div className="container mx-auto px-4 py-10">
        {/* Responsive Grid: 1 col default, 2 on md, 4 on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6">
          {challenges.map((challenge, index) => (
            <ChallengeCard
              // Use a unique ID for the key if available, otherwise index is okay
              key={challenge.id || index}
              title={challenge.title}
              description={challenge.description}
              weight={challenge.weight}
              challengeLink={challenge.challengeLink}
              challengeNum={challenge.challengeNum}
              // Pass index for animation delay calculation
              animationIndex={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Challenges;