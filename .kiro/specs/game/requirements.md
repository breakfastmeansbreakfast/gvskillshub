# Requirements Document for FutureCraft Game

## Introduction

FutureCraft is a browser-based game designed to engage young people in problem-solving and pattern recognition skills. The game aims to identify young people from disadvantaged backgrounds who have interest and ability in cyber-related fields, without explicitly branding it as a "cyber" initiative. The game is accessible directly from the root URL of the website and features emoji-based puzzles that players must solve to earn points.

## Technologies

The implementation uses the following technologies:
- React for component structure
- Next.js as the framework
- TypeScript for type safety
- CSS Modules for styling
- Tailwind CSS for responsive design

## Project Stakeholders

- Cloud technology providers
- Local government authorities
- Regional development organizations
- Higher education institutions
- Further education colleges

## Objectives

1. Create a proof-of-concept browser game for a high-profile government launch event.
2. Showcase to government leaders and the cyber sector that gaming can effectively find and engage young people for cyber career opportunities.
3. Engage young people in problem-solving and pattern recognition skills without heavy "cyber" branding.

## Requirements

### Requirement 1: Game Interface

**User Story:** As a player, I want a simple, intuitive interface that allows me to play the game easily in a browser, so that I can focus on solving the puzzles without struggling with controls.

#### Acceptance Criteria

1. WHEN the game loads THEN the system SHALL display a welcome screen with game instructions and a start button.

2. WHEN the player clicks the start button THEN the system SHALL display a single screen with the following elements:
   - A clue display area showing emoji puzzles
   - An answer input box for submitting guesses
   - A revealable hint section
   - A score display showing current points
   - A game info button that shows/hides game rules

3. WHEN the game is in progress THEN the system SHALL display the current clue number and total clues.

4. WHEN the player interacts with any element THEN the system SHALL respond appropriately and update the interface.

5. WHEN the game completes THEN the system SHALL display a summary screen with final score and performance metrics.

6. IF the player views the game on any device THEN the system SHALL present the interface in a visually appealing container with a green background.

7. IF the game is displayed THEN the game container SHALL be centered on the screen.

8. IF the game is displayed THEN the game interface SHALL have improved aesthetics with proper spacing, shadows, and visual hierarchy.

9. IF the game is displayed THEN the game interface SHALL be rendered within the existing ResponsiveContainer component.

### Requirement 2: Gameplay Mechanics

**User Story:** As a player, I want to guess words based on emoji clues and receive points for correct answers, so that I can test my problem-solving skills and track my progress.

#### Acceptance Criteria

1. WHEN a new game starts THEN the system SHALL display a cryptic emoji clue.
2. WHEN the player submits a guess THEN the system SHALL evaluate it for correctness.
3. WHEN the player submits a correct answer THEN the system SHALL award points based on:
   - Speed of answer
   - Whether a hint was used
   - The number of incorrect guesses made.
4. WHEN the player makes three incorrect attempts THEN the system SHALL reveal the correct answer.
5. WHEN the time runs out for a clue THEN the system SHALL:
   - Reveal the correct answer
   - Disable the answer input
   - Show a "Next Clue" button instead of the submit button
6. WHEN the player completes a clue THEN the system SHALL present the next clue after a brief delay.
7. WHEN all 5 questions are completed THEN the system SHALL end the game and display the final score.

### Requirement 3: Input Methods

**User Story:** As a player, I want a simple and intuitive way to input my guess, so that I can interact with the game easily.

#### Acceptance Criteria

1. WHEN the player wants to input a guess THEN the system SHALL allow input via:
   - Typing in the text box using the physical keyboard
2. WHEN the player submits an answer THEN the system SHALL allow for an acceptable degree of error in spelling

### Requirement 4: Hint System

**User Story:** As a player, I want the option to reveal a hint if I'm stuck on a clue, so that I can progress in the game when challenged.

#### Acceptance Criteria

1. WHEN a new clue is presented THEN the system SHALL provide a hidden hint
2. WHEN the player chooses to reveal the hint THEN the system SHALL display it
3. WHEN the player uses a hint THEN the system SHALL reduce the potential points for that clue

### Requirement 5: Clue and Answer Database

**User Story:** As a game administrator, I want a diverse set of clues and answers to keep the game engaging.

#### Acceptance Criteria

1. WHEN the game starts THEN the system SHALL have a database of clues and answers including:
   - Words
   - Brands
   - Landmarks
   - Sports
   - Films
   - Sayings
   - Planets
2. WHEN displaying a clue THEN the system SHALL use emojis to represent the answer cryptically
3. WHEN selecting questions for a game session THEN the system SHALL ensure all questions are unique (no duplicates)
4. WHEN starting a new game THEN the system SHALL limit the game to exactly 5 questions per session

### Requirement 6: Scoring System

**User Story:** As a player, I want to earn points based on my performance to track my progress.

#### Acceptance Criteria

1. WHEN the player submits a correct answer THEN the system SHALL calculate points based on:
   - Speed of answer
   - Use of hints
   - Number of incorrect guesses
2. WHEN the game ends THEN the system SHALL display the total score
3. WHEN the game ends THEN the system SHALL display a performance assessment based on the final score
4. WHEN a clue is displayed THEN the system SHALL show a visual progress bar that decreases over time, indicating the diminishing available points for that clue
5. WHEN a hint is revealed THEN the system SHALL immediately update the progress bar to reflect the 30% point reduction
6. WHEN an incorrect attempt is made THEN the system SHALL update the progress bar to reflect the 15% point reduction per attempt
7. WHEN the timer runs out THEN the system SHALL prevent further answers from being submitted
