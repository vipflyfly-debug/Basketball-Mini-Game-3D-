
// Enum for game states
export enum GameState {
  Idle = 'idle',
  Playing = 'playing',
  Ended = 'ended',
}

// Interface for a high score entry
export interface ScoreEntry {
  score: number;
  date: string; // ISO date string
}

// Interface for props passed to the GameCanvas ref
export interface GameCanvasRef {
  shoot: (power: number, directionY: number, directionX: number) => void;
  resetBall: () => void;
  clearScoreState: () => void; // Added this line
}