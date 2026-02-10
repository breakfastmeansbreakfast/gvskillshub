"use client";

import React, { useState, useRef, useEffect } from 'react';
import styles from './GameComponents.module.css';

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled?: boolean;
  timeUp?: boolean;
  onNext?: () => void;
}

/**
 * Component for player to input their answer
 * Handles text input and submission via button or Enter key
 */
const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, disabled = false, timeUp = false, onNext }) => {
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer.trim() && !disabled) {
      onSubmit(answer.trim());
      setAnswer(''); // Clear the input after submission
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  // Handle keyboard events (e.g., Enter key)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && answer.trim() && !disabled) {
      onSubmit(answer.trim());
      setAnswer(''); // Clear the input after submission
    }
  };

  return (
    <div className={styles.answerInput}>
      <h2 className={styles.sectionTitle}>Your Answer</h2>
      <form className={styles.answerForm} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className={styles.answerField}
          value={answer}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={timeUp ? "Time's up!" : "Type your answer here..."}
          disabled={disabled || timeUp}
          aria-label="Answer input field"
        />
        {timeUp && onNext ? (
          <button 
            type="button" 
            className={`${styles.submitButton} ${styles.nextButton}`}
            onClick={onNext}
            aria-label="Next clue"
          >
            Next Clue
          </button>
        ) : (
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={disabled || !answer.trim()}
            aria-label="Submit answer"
          >
            Submit
          </button>
        )}
      </form>
    </div>
  );
};

export default AnswerInput;