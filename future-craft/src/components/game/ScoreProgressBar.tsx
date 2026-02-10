"use client";

import React, { useState, useEffect } from "react";
import styles from "./GameComponents.module.css";

interface ScoreProgressBarProps {
  startTime: number;
  maxTime: number; // Maximum time in seconds before points stop decreasing
  difficulty: "easy" | "medium" | "hard" | "very hard";
  onTimeUp?: () => void; // Callback when time is up
  hintRevealed: boolean; // Whether a hint has been revealed
  attempts: number; // Number of incorrect attempts
}

/**
 * Component that displays a visual progress bar showing diminishing available points over time
 */
const ScoreProgressBar: React.FC<ScoreProgressBarProps> = ({
  startTime,
  maxTime,
  difficulty,
  onTimeUp,
  hintRevealed,
  attempts,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [remainingPercentage, setRemainingPercentage] = useState(100);

  // Calculate base points based on difficulty
  const getBasePoints = () => {
    switch (difficulty) {
      case "easy":
        return 100;
      case "medium":
        return 200;
      case "hard":
        return 300;
      default:
        return 100;
    }
  };

  // Calculate current available points
  const calculateCurrentPoints = () => {
    const basePoints = getBasePoints();

    // Time bonus (faster answers get more points)
    const timeElapsedSeconds = (Date.now() - startTime) / 1000;
    const timeBonus = Math.max(
      0,
      Math.floor(basePoints * (1 - timeElapsedSeconds / maxTime))
    );

    // Penalties for hints and incorrect attempts
    const hintPenalty = hintRevealed ? Math.floor(basePoints * 0.3) : 0; // 30% penalty for using hint
    const attemptPenalty = Math.floor(basePoints * 0.15 * attempts); // 15% penalty per attempt

    // Calculate final score
    const finalScore = Math.max(
      0,
      basePoints + timeBonus - hintPenalty - attemptPenalty
    );

    // Ensure a minimum of 30% of base points
    return Math.max(Math.round(basePoints * 0.3), finalScore);
  };

  useEffect(() => {
    // Update the progress bar every 100ms
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const percentage = Math.max(0, 100 - (elapsed / maxTime) * 100);

      setTimeElapsed(elapsed);
      setRemainingPercentage(percentage);

      // Stop the interval if we've reached the maximum time
      if (elapsed >= maxTime) {
        clearInterval(interval);
        if (onTimeUp) {
          onTimeUp();
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, maxTime, onTimeUp]);

  // Determine color based on remaining percentage
  const getBarColor = () => {
    if (remainingPercentage > 66) return "#4CAF50"; // Green
    if (remainingPercentage > 33) return "#FFC107"; // Yellow
    return "#F44336"; // Red
  };

  return (
    <div className={styles.scoreProgressContainer}>
      <div className={styles.scoreProgressInfo}>
        <span>Available Points: {calculateCurrentPoints()}</span>
        <span>
          {Math.min(maxTime, Math.max(0, Math.round(maxTime - timeElapsed)))}s
        </span>
      </div>
      <div className={styles.scoreProgressBar}>
        <div
          className={styles.scoreProgressFill}
          style={{
            width: `${remainingPercentage}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>
    </div>
  );
};

export default ScoreProgressBar;
