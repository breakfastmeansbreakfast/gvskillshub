import React from 'react';
import styles from './GameComponents.module.css';

/**
 * Component to display game information and rules
 */
const InfoSection: React.FC = () => {
  return (
    <div className={styles.infoSection}>
      <h2 className={styles.infoTitle}>How to Play</h2>
      
      <div 
        id="game-info-content"
        className={styles.infoContent}
      >
        <ul className={styles.rulesList}>
          <li>Decode the emoji sequence to guess the word, brand, landmark, or other concept.</li>
          <li>Type your answer in the input box and press Enter or click Submit.</li>
          <li>You have 3 attempts for each clue before the answer is revealed.</li>
          <li>If you&aposre stuck, you can reveal a hint, but this will reduce your potential score.</li>
          <li>Your score is based on speed, accuracy, and whether you used hints.</li>
          <li>The game includes clues from categories like words, brands, landmarks, sports, films, sayings, and planets.</li>
        </ul>
      </div>
    </div>
  );
};

export default InfoSection;