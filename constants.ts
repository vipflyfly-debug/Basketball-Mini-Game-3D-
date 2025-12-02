// Game Logic Constants
export const GAME_DURATION_SECONDS = 120; // 2 minutes
export const BALL_RESET_TIME_MS = 5000; // 5 seconds

// Ball Physics / Shooting Constants
export const SHOT_POWER_MULTIPLIER = 0.03; // Adjust to make power values meaningful
export const MIN_POWER = 10;
export const MAX_POWER = 100;
export const POWER_STEP = 2.5;

// Shot Direction Constants (in degrees)
export const SHOT_DIRECTION_STEP_DEGREES = 5;
export const MAX_SHOT_DIRECTION_DEGREES = 50; // Max horizontal/vertical angle
export const MIN_SHOT_DIRECTION_DEGREES = 0; // Min vertical angle for upward shots, allows negative for downward

// 3D Scene Constants
export const BASKETBALL_RADIUS = 0.2;
export const HOOP_HEIGHT = 3.0; // Height of the rim from the ground
export const HOOP_RADIUS = 0.318; // Reduced from 0.45 to shrink area by 50% (0.45 * sqrt(0.5))
export const HOOP_THICKNESS = 0.02;
export const BACKBOARD_WIDTH = 2.4; // Doubled from 1.2
export const BACKBOARD_HEIGHT = 1.8; // Doubled from 0.9
export const COURT_SIZE = 15; // Side length of the square court

// Ball Reset Position Ranges (relative to hoop/camera)
export const RESET_POS_X_MIN = -1.5;
export const RESET_POS_X_MAX = 1.5;
export const RESET_POS_Z_MIN = 1; // Changed from 3 to 1 for wider random range
export const RESET_POS_Z_MAX = 7; // CORRECTED from 10 to 7 to keep within court bounds (Court size 15, Z goes from -7.5 to 7.5. Hoop is at Z=0)
export const RESET_POS_Y = BASKETBALL_RADIUS; // Ball always starts on the ground

// Colors
export const COLORS = {
  BASKETBALL_ORANGE: '#FF7F00',
  HOOP_RED: '#CC0000',
  BACKBOARD_WHITE: '#F0F0F0',
  COURT_BLUE: '#305090',
  COURT_LINES_WHITE: '#FFFFFF',
  SKY_BLUE: '#87CEEB',
  AMBIENT_LIGHT: '#FFFFFF',
  DIRECTIONAL_LIGHT: '#FDFBFB',
};

// Local Storage Key
export const HIGH_SCORES_KEY = 'basketball_high_scores';