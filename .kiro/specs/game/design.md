# Design Document for FutureCraft Game

## Overview

FutureCraft is a browser-based game designed to engage young people in problem-solving and pattern recognition skills without explicitly branding it as a "cyber" initiative. The game presents players with emoji-based clues that they must decipher to guess words, brands, landmarks, and other concepts. This design document outlines the technical approach for implementing the game based on the requirements.

### Key Design Goals

- Create an intuitive, visually appealing browser game
- Implement engaging gameplay mechanics that test problem-solving skills
- Design a flexible system that can be expanded with additional clues and features
- Ensure the game is accessible and easy to play for the target audience

## Architecture

The FutureCraft game will be implemented as a React component within the existing Next.js application. This approach allows us to:

1. Leverage the existing application infrastructure
2. Ensure consistent styling and user experience
3. Simplify deployment and maintenance

### High-Level Architecture

```
┌─────────────────────────────────────┐
│           Next.js App               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      FutureCraft Game       │    │
│  │                             │    │
│  │  ┌─────────┐  ┌─────────┐   │    │
│  │  │Game UI  │  │Game     │   │    │
│  │  │Component│  │Logic    │   │    │
│  │  └─────────┘  └─────────┘   │    │
│  │                             │    │
│  │  ┌─────────┐  ┌─────────┐   │    │
│  │  │Clue     │  │Scoring  │   │    │
│  │  │Database │  │System   │   │    │
│  │  └─────────┘  └─────────┘   │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

## Components and Interfaces

### 1. Game Container Component

The main container component that will be rendered within the existing application.

**Responsibilities:**

- Manage overall game state
- Handle routing between different game states (start, playing, end)
- Provide context for child components

### 2. Game Interface Component

The visual interface that players interact with.

**Responsibilities:**

- Render the game UI elements as specified in Requirement 1
- Handle user interactions
- Display clues, hints, and feedback

**UI Elements:**

- Clue display area (showing emoji clues)
- Answer input box
- Hint section (collapsible/revealable)
- Information section (collapsible)
- Score progress bar (showing diminishing available points over time)
- Settings section (placeholder for future implementation)
- Login section (placeholder for future implementation)

**Visual Design:**

- Green background for the game container
- Centered on screen
- Enhanced aesthetics with proper spacing, shadows, and visual hierarchy
- Rendered within the existing ResponsiveContainer component

### 3. Game Logic Component

Handles the core gameplay mechanics.

**Responsibilities:**

- Manage game flow
- Process player inputs
- Validate answers
- Track game progress

**Key Functions:**

- `startGame()`: Initialize a new game session with 5 unique questions
- `submitAnswer(answer)`: Process player's answer submission
- `revealHint()`: Show hint for current clue
- `calculateScore()`: Determine points based on performance
- `selectUniqueQuestions(count: number)`: Select a specified number of unique questions from the question database

### 4. Clue Database Component

Manages the collection of clues and answers.

**Responsibilities:**

- Store clue-answer pairs
- Provide random or sequential clues
- Track which clues have been used
- Ensure selection of exactly 5 unique questions per game session

**Data Categories:**

- Words
- Brands
- Landmarks
- Sports
- Films
- Sayings
- Planets

### 5. Scoring System Component

Handles point calculation and tracking.

**Responsibilities:**

- Calculate points based on performance metrics
- Track cumulative score
- Display visual progress bar showing diminishing available points over time
- Store high scores (future enhancement)

## Data Models

### Clue Model

```typescript
interface Clue {
  id: string;
  category:
    | "word"
    | "brand"
    | "landmark"
    | "sport"
    | "film"
    | "saying"
    | "planet";
  emojiClue: string; // Emoji representation
  answer: string; // Correct answer
  hint: string; // Optional hint text
  difficulty: "easy" | "medium" | "hard";
}
```

### Game State Model

```typescript
interface GameState {
  currentClue: Clue | null;
  attempts: number;
  hintRevealed: boolean;
  score: number;
  startTime: number; // Timestamp when clue was presented
  guesses: string[]; // History of incorrect guesses
  questionCount: number; // Track how many questions have been presented
  usedQuestionIds: string[]; // Track which question IDs have been used to ensure uniqueness
}
```

### Player Input Model

```typescript
interface PlayerInput {
  answer: string;
  timestamp: number;
}
```

### Score Calculation Model

```typescript
interface ScoreFactors {
  basePoints: number; // Base points for the clue
  timeBonus: number; // Bonus for quick answers
  hintPenalty: number; // Reduction if hint was used
  attemptPenalty: number; // Reduction based on incorrect attempts
}
```

## Error Handling

### Input Validation

- The game will implement fuzzy matching to allow for minor spelling errors in answers
- Input will be sanitized to prevent injection attacks
- Special characters will be handled appropriately

### Error States

1. **Invalid Input**: Display friendly error message for inputs that cannot be processed
2. **Server Connection Issues**: Implement offline mode with limited functionality
3. **Data Loading Failures**: Provide fallback clues if database cannot be accessed

## Testing Strategy

### Unit Testing

- Test individual components in isolation
- Verify game logic functions correctly
- Ensure scoring calculations are accurate

### Integration Testing

- Test interaction between components
- Verify data flow through the application
- Ensure state management works correctly

### User Acceptance Testing

- Test with representative users from target audience
- Gather feedback on usability and engagement
- Verify that the game meets the stakeholders' objectives

### Accessibility Testing

- Ensure the game is usable by players with different abilities
- Test keyboard navigation
- Verify color contrast meets accessibility standards

## Implementation Plan

### Phase 1: Core Game Mechanics

- Implement basic UI layout
- Create clue database with initial set of clues
- Implement answer validation and scoring

### Phase 2: Enhanced User Experience

- Improve visual design
- Add animations and feedback
- Implement hint system

### Phase 3: Additional Features

- Add user accounts (if required)
- Implement settings and customization
- Add analytics to track player performance

## Conclusion

This design provides a framework for implementing the FutureCraft game as specified in the requirements document. The modular approach allows for incremental development and future enhancements while ensuring that all current requirements are met.
