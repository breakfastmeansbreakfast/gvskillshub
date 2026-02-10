import React from "react";
import { CategoryFilter, getAvailableCategories } from "./utils/gameUtils";
import "./CategorySelector.css";

interface CategorySelectorProps {
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  onStartGame: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  onStartGame,
}) => {
  const availableCategories = getAvailableCategories();

  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="category-selector">
      <h2>Choose a Category</h2>
      <p>
        Select a category for your emoji guessing game, or choose
        &quot;Random&quot; for a mix of all categories.
      </p>

      <div className="category-options">
        <div className="category-grid">
          {/* Random option */}
          <button
            className={`category-button random-button ${
              selectedCategory === "random" ? "selected" : ""
            }`}
            onClick={() => onCategoryChange("random")}
          >
            <span className="category-emoji">🎲</span>
            <span className="category-name">Random</span>
            <span className="category-description">Mix of all categories</span>
          </button>

          {/* Category options */}
          {availableCategories.map((category) => (
            <button
              key={category}
              className={`category-button ${
                selectedCategory === category ? "selected" : ""
              }`}
              onClick={() => onCategoryChange(category)}
            >
              <span className="category-emoji">
                {getCategoryEmoji(category)}
              </span>
              <span className="category-name">
                {formatCategoryName(category)}
              </span>
              <span className="category-description">
                {getCategoryDescription(category)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button className="start-game-button" onClick={onStartGame}>
        Start Game with{" "}
        {selectedCategory === "random"
          ? "Random Categories"
          : formatCategoryName(selectedCategory)}
      </button>
    </div>
  );
};

// Helper function to get emoji for each category
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    brand: "🏢",
    film: "🎬",
    sport: "⚽",
    geography: "🌍",
    saying: "💬",
    word: "📝",
    planet: "🪐",
  };
  return emojiMap[category] || "❓";
};

// Helper function to get description for each category
const getCategoryDescription = (category: string): string => {
  const descriptionMap: Record<string, string> = {
    brand: "Companies & products",
    film: "Movies & shows",
    sport: "Sports & games",
    geography: "Places & countries",
    saying: "Common phrases",
    word: "General words",
    planet: "Planets & space",
  };
  return descriptionMap[category] || "Various topics";
};
