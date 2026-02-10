/**
 * Utility functions for the FutureCraft game
 */

import gameCluesData from "../../../data/gameClues.json";

/**
 * Interface for game clues
 */
export interface Clue {
  id: string;
  category:
    | "word"
    | "brand"
    | "geography"
    | "sport"
    | "film"
    | "saying"
    | "planet";
  emojiClue: string; // Emoji representation
  answer: string; // Correct answer
  hint: string; // Optional hint text
  difficulty: "easy" | "medium" | "hard" | "very hard";
}

/**
 * Game clues imported from configuration file
 */
export const gameClues: Clue[] = gameCluesData as Clue[];

/**
 * Get all available categories from the game clues
 * @returns Array of unique categories
 */
export const getAvailableCategories = (): Clue['category'][] => {
  const categories = new Set(gameClues.map(clue => clue.category));
  return Array.from(categories).sort();
};

/**
 * Filter clues by category
 * @param category The category to filter by, or 'random' for all clues
 * @param allClues Array of all available clues
 * @returns Filtered array of clues
 */
export const filterCluesByCategory = (
  category: CategoryFilter,
  allClues: Clue[] = gameClues
): Clue[] => {
  if (category === 'random') {
    return allClues;
  }
  return allClues.filter(clue => clue.category === category);
};
/**
 *
 Calculates the Levenshtein distance between two strings
 * Used for fuzzy matching to allow for minor spelling errors
 * 
 * @param a First string
 * @param b Second string
 * @returns The edit distance between the strings
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Validates a player's answer against the correct solution with fuzzy matching
 *
 * @param playerAnswer The answer provided by the player
 * @param correctAnswer The correct answer
 * @param threshold Maximum allowed edit distance (default: 2)
 * @returns Whether the answer is correct or close enough
 */
export const validateAnswer = (
  playerAnswer: string,
  correctAnswer: string,
  threshold = 2
): boolean => {
  // Normalize both strings for comparison
  const normalizedPlayerAnswer = playerAnswer.toLowerCase().trim();
  const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim();

  // Exact match
  if (normalizedPlayerAnswer === normalizedCorrectAnswer) {
    return true;
  }

  // Fuzzy match for longer answers (to allow for minor spelling errors)
  if (normalizedCorrectAnswer.length > 3) {
    const distance = levenshteinDistance(
      normalizedPlayerAnswer,
      normalizedCorrectAnswer
    );

    // Adjust threshold based on word length
    const adjustedThreshold = Math.min(
      threshold,
      Math.max(1, Math.floor(normalizedCorrectAnswer.length / 5))
    );

    return distance <= adjustedThreshold;
  }

  // For very short answers, require exact match
  return false;
};

/**
 * Type for category selection
 */
export type CategoryFilter = Clue['category'] | 'random';

/**
 * Interface for game state
 */
export interface GameState {
  currentClue: Clue | null;
  attempts: number;
  hintRevealed: boolean;
  score: number;
  startTime: number; // Timestamp when clue was presented
  guesses: string[]; // History of incorrect guesses
  feedback: {
    message: string;
    type: "success" | "error" | "info" | "none";
  };
  gameStatus: "ready" | "playing" | "completed";
  cluesCompleted: number;
  totalClues: number;
  timeUp: boolean; // Flag to indicate if time is up for the current clue
  selectedClues?: Clue[]; // The 5 unique clues selected for this game session
  usedQuestionIds: string[]; // Track which question IDs have been used to ensure uniqueness
  selectedCategory?: CategoryFilter; // The category filter selected for this game
}

/**
 * Select exactly 5 unique questions for a game session
 * @param category The category to filter by, or 'random' for all categories
 * @param allClues Array of all available clues
 * @returns Array of 5 unique clues for the game session
 */
export const selectUniqueQuestions = (
  category: CategoryFilter = 'random',
  allClues: Clue[] = gameClues
): Clue[] => {
  // Filter clues by category first
  const filteredClues = filterCluesByCategory(category, allClues);
  
  // Create a copy of the filtered clues array to avoid modifying the original
  const cluesCopy = [...filteredClues];

  // Shuffle the array using Fisher-Yates algorithm for better randomization
  for (let i = cluesCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cluesCopy[i], cluesCopy[j]] = [cluesCopy[j], cluesCopy[i]];
  }

  // Take exactly 5 unique questions or as many as available if less than 5
  const selectedClues = cluesCopy.slice(0, Math.min(5, cluesCopy.length));

  // If we have less than 5 clues available, log a warning
  if (selectedClues.length < 5) {
    const categoryText = category === 'random' ? 'all categories' : `${category} category`;
    console.warn(
      `Warning: Only ${selectedClues.length} unique clues available in ${categoryText}. Game will run with reduced clues.`
    );
  }

  return selectedClues;
};

/**
 * Initialize a new game state
 * @param category The category to filter by, or 'random' for all categories
 * @param clues Array of all available clues
 * @returns A new GameState object with default values
 */
export const initializeGameState = (
  category: CategoryFilter = 'random',
  clues: Clue[] = gameClues
): GameState => {
  // Select exactly 5 unique questions for this game session
  const selectedClues = selectUniqueQuestions(category, clues);
  const totalClues = selectedClues.length; // Should be 5 unless we have fewer clues available

  return {
    currentClue: selectedClues[0] || null,
    attempts: 0,
    hintRevealed: false,
    score: 0,
    startTime: Date.now(),
    guesses: [],
    feedback: {
      message: "Guess the word(s) from the emoji clue!",
      type: "info",
    },
    gameStatus: "ready",
    cluesCompleted: 0,
    totalClues: totalClues,
    timeUp: false,
    selectedClues: selectedClues, // Store the selected clues for this game session
    usedQuestionIds: [], // Track which questions have been used
    selectedCategory: category, // Store the selected category
  };
};

/**
 * Calculate score based on speed, hint usage, and incorrect attempts
 * @param gameState Current game state
 * @returns The score for the current clue
 */
export const calculateScore = (gameState: GameState): number => {
  if (!gameState.currentClue) return 0;

  // Base points based on difficulty
  let basePoints = 0;
  switch (gameState.currentClue.difficulty) {
    case "easy":
      basePoints = 100;
      break;
    case "medium":
      basePoints = 200;
      break;
    case "hard":
      basePoints = 300;
      break;
    default:
      basePoints = 100;
  }

  // Time bonus (faster answers get more points)
  const timeElapsed = (Date.now() - gameState.startTime) / 1000; // in seconds
  const timeBonus = Math.max(
    0,
    Math.floor(basePoints * (1 - timeElapsed / 60))
  ); // Diminishes over 60 seconds

  // Penalties for hints and incorrect attempts
  const hintPenalty = gameState.hintRevealed ? Math.floor(basePoints * 0.3) : 0; // 30% penalty for using hint
  const attemptPenalty = Math.floor(basePoints * 0.15 * gameState.attempts); // 15% penalty per attempt

  // Calculate final score
  const finalScore = Math.max(
    0,
    basePoints + timeBonus - hintPenalty - attemptPenalty
  );

  return Math.round(finalScore);
};

/**
 * Get the next clue in the game
 * @param gameState Current game state
 * @param clues Array of all available clues (not used if selectedClues is available)
 * @returns Updated game state with the next clue
 */
export const getNextClue = (
  gameState: GameState,
  clues: Clue[] = gameClues
): GameState => {
  const nextClueIndex = gameState.cluesCompleted + 1;

  // Check if we've reached the end of the game
  if (nextClueIndex >= gameState.totalClues) {
    return {
      ...gameState,
      currentClue: null,
      gameStatus: "completed",
      feedback: {
        message: `Game completed! Your final score is ${gameState.score}.`,
        type: "success",
      },
    };
  }

  // Get the next clue from the pre-selected clues for this game session
  let nextClue: Clue | null = null;

  if (
    gameState.selectedClues &&
    gameState.selectedClues.length > nextClueIndex
  ) {
    // Use the pre-selected clues if available
    nextClue = gameState.selectedClues[nextClueIndex];
  } else {
    // Fallback to random selection if selectedClues is not available (should not happen)
    console.warn(
      "Selected clues not available, falling back to random selection"
    );
    const availableClues = clues.filter(
      (clue) => !gameState.usedQuestionIds.includes(clue.id)
    );
    if (availableClues.length > 0) {
      nextClue =
        availableClues[Math.floor(Math.random() * availableClues.length)];
    } else {
      // If all clues have been used, just pick a random one
      nextClue = clues[Math.floor(Math.random() * clues.length)];
    }
  }

  // Track this clue as used
  const usedQuestionIds = [...gameState.usedQuestionIds];
  if (nextClue) {
    usedQuestionIds.push(nextClue.id);
  }

  return {
    ...gameState,
    currentClue: nextClue,
    attempts: 0,
    hintRevealed: false,
    startTime: Date.now(),
    guesses: [],
    cluesCompleted: nextClueIndex,
    feedback: {
      message: "New clue! What does this emoji sequence represent?",
      type: "info",
    },
    gameStatus: "playing",
    timeUp: false,
    usedQuestionIds,
  };
};

/**
 * Process a player's answer submission
 * @param gameState Current game state
 * @param answer Player's submitted answer
 * @returns Updated game state after processing the answer
 */
export const processAnswer = (
  gameState: GameState,
  answer: string
): GameState => {
  if (!gameState.currentClue || gameState.timeUp) {
    return gameState;
  }

  // Track the attempt
  const newAttempts = gameState.attempts + 1;
  const newGuesses = [...gameState.guesses, answer];

  // Validate the answer
  const isCorrect = validateAnswer(answer, gameState.currentClue.answer);

  if (isCorrect) {
    // Calculate score for this clue
    const clueScore = calculateScore(gameState);
    const newTotalScore = gameState.score + clueScore;

    // Track this question as used
    const usedQuestionIds = [...gameState.usedQuestionIds];
    if (
      gameState.currentClue &&
      !usedQuestionIds.includes(gameState.currentClue.id)
    ) {
      usedQuestionIds.push(gameState.currentClue.id);
    }

    return {
      ...gameState,
      attempts: newAttempts,
      guesses: newGuesses,
      score: newTotalScore,
      usedQuestionIds,
      feedback: {
        message: `Correct! The answer is "${gameState.currentClue.answer}". You earned ${clueScore} points!`,
        type: "success",
      },
    };
  } else {
    // Handle incorrect answer
    let feedbackMessage = "Incorrect. Try again!";
    let feedbackType: "error" | "info" = "error";

    // If max attempts reached (3), reveal the answer
    if (newAttempts >= 3) {
      feedbackMessage = `Maximum attempts reached. The answer was "${gameState.currentClue.answer}".`;
      feedbackType = "info";

      // Track this question as used even if the player didn't get it right
      const usedQuestionIds = [...gameState.usedQuestionIds];
      if (
        gameState.currentClue &&
        !usedQuestionIds.includes(gameState.currentClue.id)
      ) {
        usedQuestionIds.push(gameState.currentClue.id);
      }

      return {
        ...gameState,
        attempts: newAttempts,
        guesses: newGuesses,
        usedQuestionIds,
        feedback: {
          message: feedbackMessage,
          type: feedbackType,
        },
      };
    }

    return {
      ...gameState,
      attempts: newAttempts,
      guesses: newGuesses,
      feedback: {
        message: feedbackMessage,
        type: feedbackType,
      },
    };
  }
};

/**
 * Reveal a hint for the current clue
 * @param gameState Current game state
 * @returns Updated game state with hint revealed
 */
export const revealHint = (gameState: GameState): GameState => {
  return {
    ...gameState,
    hintRevealed: true,
    feedback: {
      message: "Hint revealed! This will affect your score.",
      type: "info",
    },
  };
};

/**
 * Start a new game with 5 unique questions
 * @param category The category to filter by, or 'random' for all categories
 * @param clues Array of all available clues
 * @returns A new GameState object initialized for gameplay
 */
export const startNewGame = (
  category: CategoryFilter = 'random',
  clues: Clue[] = gameClues
): GameState => {
  // Initialize a new game state with 5 unique questions
  const newGameState = initializeGameState(category, clues);

  // Create appropriate feedback message based on category
  const categoryText = category === 'random' ? 'mixed categories' : `${category} category`;
  const feedbackMessage = `Game started with ${categoryText}! Guess the word(s) from the emoji clue!`;

  // Set the first clue as the current clue and update game status to playing
  return {
    ...newGameState,
    gameStatus: "playing",
    feedback: {
      message: feedbackMessage,
      type: "info",
    },
    // If the current clue exists, add it to the used questions list
    usedQuestionIds: newGameState.currentClue
      ? [newGameState.currentClue.id]
      : [],
  };
};
