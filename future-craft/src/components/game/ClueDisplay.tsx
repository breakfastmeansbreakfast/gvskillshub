import React from 'react';
import styles from './GameComponents.module.css';

interface ClueDisplayProps {
  clue: string;
}

/**
 * Component to display emoji clues to the player
 * Renders the emoji sequence in a visually appealing container
 */
const ClueDisplay: React.FC<ClueDisplayProps> = ({ clue }) => {
  return (
    <div className={styles.clueDisplay}>
      <div className={styles.clueContent}>
        <p className={styles.emojiClue} aria-label="Emoji clue">{clue}</p>
      </div>
    </div>
  );
};

export default ClueDisplay;