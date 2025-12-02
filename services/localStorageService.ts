import { ScoreEntry } from '../types';
import { HIGH_SCORES_KEY } from '../constants';

export const getHighScores = (): ScoreEntry[] => {
  try {
    const storedScores = localStorage.getItem(HIGH_SCORES_KEY);
    return storedScores ? JSON.parse(storedScores) : [];
  } catch (error) {
    console.error('Error reading high scores from local storage:', error);
    return [];
  }
};

export const addHighScore = (newScore: ScoreEntry): ScoreEntry[] => {
  try {
    const scores = getHighScores();
    const updatedScores = [...scores, newScore]
      .sort((a, b) => b.score - a.score) // Sort in descending order
      .slice(0, 10); // Keep only the top 10 scores
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(updatedScores));
    return updatedScores;
  } catch (error) {
    console.error('Error saving high score to local storage:', error);
    return getHighScores(); // Return current scores if save fails
  }
};

export const clearHighScores = (): void => {
  try {
    localStorage.removeItem(HIGH_SCORES_KEY);
  } catch (error) {
    console.error('Error clearing high scores from local storage:', error);
  }
};