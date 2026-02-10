import React from 'react';
import styles from './GameComponents.module.css';

interface HintSectionProps {
  hint: string;
  onRevealHint: () => void;
  isRevealed: boolean;
}

/**
 * Component to display and reveal hints for the current clue
 * Shows a button to reveal the hint and displays the hint when revealed
 */
const HintSection: React.FC<HintSectionProps> = ({ hint, onRevealHint, isRevealed }) => {
  return (
    <div className={styles.hintSection}>
      <div className={styles.hintContent}>
        {isRevealed ? (
          <p className={styles.hint}>{hint}</p>
        ) : (
          <button 
            className={styles.hintButton} 
            onClick={onRevealHint}
            aria-label="Reveal hint"
          >
            Reveal Hint (reduces score)
          </button>
        )}
      </div>
    </div>
  );
};

export default HintSection;