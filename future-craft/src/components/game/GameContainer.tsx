"use client";

import React, { useState, useEffect } from "react";
import styles from "./GameContainer.module.css";
import ClueDisplay from "./ClueDisplay";
import AnswerInput from "./AnswerInput";
import HintSection from "./HintSection";
import InfoSection from "./InfoSection";
import ScoreProgressBar from "./ScoreProgressBar";
import {
  GameState,
  gameClues,
  initializeGameState,
  processAnswer,
  revealHint,
  getNextClue,
  startNewGame,
  CategoryFilter,
  //calculateScore,
} from "./utils/gameUtils";
import { CategorySelector } from "./CategorySelector";

/**
 * Main container component for the FutureCraft game
 * Manages the overall game state and renders child components
 */
const GameContainer: React.FC = () => {
  // State for category selection
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('random');
  const [showCategorySelector, setShowCategorySelector] = useState(true);

  // Initialize game state using our new utility function
  const [gameState, setGameState] = useState<GameState>(
    initializeGameState('random', gameClues)
  );

  // State to track whether info section is shown
  const [showInfo, setShowInfo] = useState(false);

  // State to track score animation
  const [scoreChanged, setScoreChanged] = useState(false);
  const [prevScore, setPrevScore] = useState(0);

  /**
   * Initialize the game when component mounts
   */
  useEffect(() => {
    // Set the game to ready state when component mounts
    setGameState((prevState) => ({
      ...prevState,
      gameStatus: "ready",
    }));
  }, []);

  /**
   * Effect to handle score animation when score changes
   */
  useEffect(() => {
    // Check if score has changed
    if (gameState.score !== prevScore) {
      setScoreChanged(true);
      setPrevScore(gameState.score);

      // Reset the animation after it completes
      const timer = setTimeout(() => {
        setScoreChanged(false);
      }, 500); // Match the animation duration

      return () => clearTimeout(timer);
    }
  }, [gameState.score, prevScore]);

  /**
   * Handles answer submission and validation
   */
  const handleAnswerSubmit = (answer: string) => {
    if (!gameState.currentClue || answer.trim() === "") return;

    // Process the answer using our utility function
    const updatedState = processAnswer(gameState, answer);
    setGameState(updatedState);

    // Check if we need to move to the next clue
    const isCorrect = updatedState.feedback.type === "success";
    const maxAttemptsReached = updatedState.attempts >= 3;

    if (isCorrect || maxAttemptsReached) {
      // Wait a moment to show the feedback before moving to the next clue
      setTimeout(() => {
        // Get the next clue and update the game state
        const nextState = getNextClue(updatedState, gameClues);

        // Check if we've reached the end of the game
        if (nextState.gameStatus === "completed") {
          // Show game completion message
          setGameState({
            ...nextState,
            feedback: {
              message: `Game completed! Your final score is ${nextState.score}.`,
              type: "success",
            },
          });
        } else {
          // Show next clue message
          setGameState({
            ...nextState,
            feedback: {
              message: `Moving to question ${nextState.cluesCompleted + 1} of ${
                nextState.totalClues
              }`,
              type: "info",
            },
          });
        }
      }, 2000);
    }
  };

  /**
   * Handles hint reveal action
   */
  const handleRevealHint = () => {
    setGameState((prevState) => revealHint(prevState));
  };

  /**
   * Handles time-up event
   */
  const handleTimeUp = () => {
    if (!gameState.currentClue) return;

    setGameState((prevState) => ({
      ...prevState,
      timeUp: true,
      feedback: {
        message: `Time's up! The answer was "${prevState.currentClue?.answer}".`,
        type: "info",
      },
    }));
  };

  /**
   * Starts a new game with 5 unique questions
   */
  const handleStartNewGame = () => {
    // Use our new startNewGame function to initialize a game with 5 unique questions
    const newGameState = startNewGame(selectedCategory, gameClues);

    // Update the game state and hide category selector
    setGameState(newGameState);
    setShowCategorySelector(false);
  };

  /**
   * Handle category selection
   */
  const handleCategoryChange = (category: CategoryFilter) => {
    setSelectedCategory(category);
  };

  /**
   * Handle returning to category selection
   */
  const handleBackToCategories = () => {
    setShowCategorySelector(true);
    setGameState(initializeGameState('random', gameClues));
  };

  return (
    <div className={styles.gameWrapper}>
      <div className={styles.gameHeader}>
        <h1 className={styles.gameTitle}>FutureCraft</h1>
        {gameState.gameStatus !== "ready" &&
          gameState.gameStatus !== "completed" && (
            <div className={styles.scoreDisplay}>
              <div
                className={`${styles.scoreValue} ${
                  scoreChanged ? styles.scoreChanged : ""
                }`}
              >
                <span className={styles.scoreLabel}>Score:</span>{" "}
                {gameState.score}
              </div>
              <div className={styles.clueCounter}>
                Question: {gameState.cluesCompleted + 1}/{gameState.totalClues}
              </div>
            </div>
          )}
      </div>

      {/* Feedback message - only show when in playing state */}
      {gameState.feedback.message &&
        gameState.gameStatus !== "ready" &&
        gameState.gameStatus !== "completed" && (
          <div
            className={`${styles.feedback} ${styles[gameState.feedback.type]}`}
          >
            {gameState.feedback.message}
          </div>
        )}

      <div className={styles.gameMainContent}>
        {showCategorySelector ? (
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onStartGame={handleStartNewGame}
          />
        ) : gameState.gameStatus === "ready" ? (
          <div className={styles.gameStart}>
            <h2>Welcome to FutureCraft!</h2>
            <p>Test your problem-solving skills by deciphering emoji clues.</p>
            <p>
              You&apos;ll have 3 attempts for each clue and can use hints if you
              get stuck.
            </p>
            <button
              className={styles.startGameButton}
              onClick={handleStartNewGame}
            >
              Start Game
            </button>
          </div>
        ) : gameState.gameStatus === "completed" ? (
          <div className={styles.gameCompleted}>
            <h2>Game Completed!</h2>
            <div
              className={`${styles.scoreSummary} ${styles.fullWidthContainer}`}
            >
              <div className={styles.finalScore}>
                Your final score: <span>{gameState.score}</span>
              </div>
              <div className={styles.scoreBreakdown}>
                <p>
                  Questions completed: {gameState.totalClues}/
                  {gameState.totalClues}
                </p>
                <p>
                  Difficulty level:{" "}
                  {gameState.score > 2000
                    ? "Expert"
                    : gameState.score > 1000
                    ? "Advanced"
                    : "Beginner"}
                </p>
              </div>
            </div>
            <p className={styles.encouragement}>
              {gameState.score > 2000
                ? "Outstanding! You have excellent problem-solving skills!"
                : gameState.score > 1000
                ? "Great job! Your pattern recognition skills are impressive!"
                : "Good effort! Keep practicing to improve your score!"}
            </p>
            <div className={styles.gameEndButtons}>
              <button
                className={styles.newGameButton}
                onClick={handleStartNewGame}
              >
                Play Again ({selectedCategory === 'random' ? 'Random' : selectedCategory})
              </button>
              <button
                className={styles.changeCategoryButton}
                onClick={handleBackToCategories}
              >
                Change Category
              </button>
            </div>
          </div>
        ) : showInfo ? (
          <InfoSection />
        ) : (
          <div className={styles.gameContent}>
            <ClueDisplay clue={gameState.currentClue?.emojiClue || ""} />
            {gameState.currentClue && (
              <ScoreProgressBar
                startTime={gameState.startTime}
                maxTime={60} // 60 seconds before points stop decreasing
                difficulty={gameState.currentClue.difficulty}
                onTimeUp={handleTimeUp}
                hintRevealed={gameState.hintRevealed}
                attempts={gameState.attempts}
              />
            )}
            <AnswerInput
              onSubmit={handleAnswerSubmit}
              disabled={gameState.attempts >= 3}
              timeUp={gameState.timeUp}
              onNext={() => {
                const nextState = getNextClue(gameState, gameClues);
                setGameState(nextState);
              }}
            />
            <HintSection
              hint={gameState.currentClue?.hint || "No hint available"}
              onRevealHint={handleRevealHint}
              isRevealed={gameState.hintRevealed}
            />
          </div>
        )}
      </div>

      {/* Info button only shown during active gameplay */}
      {gameState.gameStatus !== "ready" &&
        gameState.gameStatus !== "completed" && (
          <div className={styles.infoButtonContainer}>
            <button
              className={styles.infoButton}
              onClick={() => setShowInfo(!showInfo)}
            >
              {showInfo ? "Back to Game" : "Show Game Info"}
            </button>
          </div>
        )}
    </div>
  );
};

export default GameContainer;
