# Game Configuration

This directory contains configuration files for the FutureCraft game.

## Game Clues (`gameClues.json`)

This file contains all the emoji clues used in the game. Each clue has the following structure:

```json
{
  "id": "unique-identifier",
  "category": "brand|film|sport|landmark|saying|city|country|word|planet",
  "emojiClue": "🔍🐠",
  "answer": "finding nemo",
  "hint": "Film",
  "difficulty": "easy|medium|hard"
}
```

### Fields:

- **id**: Unique identifier for the clue (e.g., "brand-1", "film-2")
- **category**: The category this clue belongs to
- **emojiClue**: The emoji sequence that represents the clue
- **answer**: The correct answer (lowercase)
- **hint**: A hint for the player (usually just the category)
- **difficulty**: How difficult the clue is (affects scoring)

### Adding New Clues:

1. Open `gameClues.json`
2. Add a new object to the array with all required fields
3. Make sure the `id` is unique
4. Use lowercase for the `answer` field
5. Save the file - changes will be reflected in the game immediately

### Categories:

- **brand**: Company or product names
- **film**: Movie titles
- **sport**: Sports and games
- **landmark**: Famous places and monuments
- **saying**: Common phrases and idioms
- **city**: City names
- **country**: Country names
- **word**: General words or concepts
- **planet**: Planets in our solar system

The game randomly selects 5 clues from this file for each game session. Players can choose to play with:

- **Random**: Mixed clues from all categories (default behavior)
- **Specific Category**: Only clues from a chosen category (e.g., only "brand" clues)

### Category Selection:

Players can now select their preferred category before starting a game:

- Choose "Random" for the traditional mixed-category experience
- Select a specific category to focus on particular types of clues
- If a category has fewer than 5 clues, the game will use all available clues from that category
