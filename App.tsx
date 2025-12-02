import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import Scoreboard from './components/ui/Scoreboard';
import ControlPanel from './components/ui/ControlPanel';
import Button from './components/ui/Button';
import { GameState, ScoreEntry } from './types';
import {
  GAME_DURATION_SECONDS,
  BALL_RESET_TIME_MS,
  MAX_POWER,
  MIN_POWER,
  POWER_STEP,
  SHOT_DIRECTION_STEP_DEGREES,
  MAX_SHOT_DIRECTION_DEGREES,
  MIN_SHOT_DIRECTION_DEGREES,
} from './constants';
import * as localStorageService from './services/localStorageService';
import { GameCanvasRef } from './types'; // Import GameCanvasRef

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(GAME_DURATION_SECONDS);
  const [consecutiveHits, setConsecutiveHits] = useState<number>(0);
  const [power, setPower] = useState<number>(MIN_POWER);
  const [shotDirectionY, setShotDirectionY] = useState<number>(0); // Left/Right rotation in degrees
  const [shotDirectionX, setShotDirectionX] = useState<number>(0); // Up/Down angle in degrees
  const [ballResetting, setBallResetting] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);

  const gameCanvasRef = useRef<GameCanvasRef | null>(null); // Updated type
  const timerRef = useRef<number | null>(null);
  const ballResetTimerRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    setGameState(GameState.Playing);
    setScore(0);
    setConsecutiveHits(0);
    setTimer(GAME_DURATION_SECONDS);
    setPower(MIN_POWER);
    setShotDirectionY(0);
    setShotDirectionX(0);
    setBallResetting(false);
    gameCanvasRef.current?.resetBall();
    gameCanvasRef.current?.clearScoreState(); // Ensure score state is clean on new game

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Casting window to any to resolve TypeScript error for setInterval
    timerRef.current = (window as any).setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState(GameState.Ended);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (ballResetTimerRef.current) {
      clearTimeout(ballResetTimerRef.current);
    }
    setGameState(GameState.Idle);
    setScore(0);
    setConsecutiveHits(0);
    setTimer(GAME_DURATION_SECONDS);
    setPower(MIN_POWER);
    setShotDirectionY(0);
    setShotDirectionX(0);
    setBallResetting(false);
    gameCanvasRef.current?.resetBall();
    gameCanvasRef.current?.clearScoreState(); // Ensure score state is clean on full reset
  }, []);

  useEffect(() => {
    // Load high scores on mount
    setHighScores(localStorageService.getHighScores());
  }, []);

  useEffect(() => {
    if (gameState === GameState.Ended) {
      const newScoreEntry: ScoreEntry = {
        score: score,
        date: new Date().toISOString(),
      };
      const updatedScores = localStorageService.addHighScore(newScoreEntry);
      setHighScores(updatedScores);
    }
  }, [gameState, score]);

  const handleShotMade = useCallback(() => {
    setScore((prev) => prev + 1);
    setConsecutiveHits((prev) => {
      const newHits = prev + 1;
      if (newHits % 3 === 0) {
        setScore((s) => s + 1); // Bonus point
      }
      return newHits;
    });
    // Removed ballResetting and setTimeout logic, now handled by handleKeyDown
  }, []);

  const handleShotMissed = useCallback(() => {
    setConsecutiveHits(0);
    // Removed ballResetting and setTimeout logic, now handled by handleKeyDown
  }, []);

  // Changing the type of 'event' to 'any' to resolve the 'Property 'key' does not exist on type 'KeyboardEvent'' error.
  const handleKeyDown = useCallback((event: any) => {
    if (gameState !== GameState.Playing || ballResetting) return;

    switch (event.key) {
      case '1': // Now decreases power
        setPower((prev) => Math.max(prev - POWER_STEP, MIN_POWER));
        break;
      case '2': // Now increases power
        setPower((prev) => Math.min(prev + POWER_STEP, MAX_POWER));
        break;
      case 'ArrowLeft':
        setShotDirectionY((prev) => Math.max(prev - SHOT_DIRECTION_STEP_DEGREES, -MAX_SHOT_DIRECTION_DEGREES));
        break;
      case 'ArrowRight':
        setShotDirectionY((prev) => Math.min(prev + SHOT_DIRECTION_STEP_DEGREES, MAX_SHOT_DIRECTION_DEGREES));
        break;
      case 'ArrowUp':
        setShotDirectionX((prev) => Math.min(prev + SHOT_DIRECTION_STEP_DEGREES, MAX_SHOT_DIRECTION_DEGREES));
        break;
      case 'ArrowDown':
        setShotDirectionX((prev) => Math.max(prev - SHOT_DIRECTION_STEP_DEGREES, -MAX_SHOT_DIRECTION_DEGREES)); // Changed MIN_SHOT_DIRECTION_DEGREES to ensure negative values are allowed
        break;
      case 'Enter':
        gameCanvasRef.current?.shoot(power, shotDirectionY, shotDirectionX);
        setBallResetting(true); // Start resetting immediately after shot
        if (ballResetTimerRef.current) {
          clearTimeout(ballResetTimerRef.current);
        }
        // Casting window to any to resolve TypeScript error for setTimeout
        ballResetTimerRef.current = (window as any).setTimeout(() => {
          try {
            gameCanvasRef.current?.resetBall();
            gameCanvasRef.current?.clearScoreState(); // Clear score state when ball resets
          } catch (error) {
            console.error("Error during ball reset:", error);
          } finally {
            setBallResetting(false);
            setPower(MIN_POWER);
            setShotDirectionY(0);
            setShotDirectionX(0);
          }
        }, BALL_RESET_TIME_MS);
        break;
      default:
        break;
    }
  }, [gameState, ballResetting, power, shotDirectionY, shotDirectionX]);

  useEffect(() => {
    // Casting window to any to resolve TypeScript error for addEventListener
    (window as any).addEventListener('keydown', handleKeyDown);
    return () => {
      // Casting window to any to resolve TypeScript error for removeEventListener
      (window as any).removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const displayTime = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Game Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas
          ref={gameCanvasRef}
          onShotMade={handleShotMade}
          onShotMissed={handleShotMissed}
          gameActive={gameState === GameState.Playing && !ballResetting}
        />
      </div>

      {/* Top Right UI: Scoreboard */}
      <div className="absolute top-4 right-4 z-10">
        <Scoreboard score={score} consecutiveHits={consecutiveHits} timer={displayTime} />
      </div>

      {/* Top Left UI: Control Panel */}
      <div className="absolute top-4 left-4 z-10">
        <ControlPanel
          power={power}
          shotDirectionX={shotDirectionX}
          shotDirectionY={shotDirectionY}
          ballResetting={ballResetting}
          gameActive={gameState === GameState.Playing}
        />
      </div>

      {/* Centered Game State UI */}
      {gameState === GameState.Idle && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900 bg-opacity-80">
          <h1 className="text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
            Basketball Challenge 3D
          </h1>
          <Button onClick={startGame} className="text-xl px-10 py-4">
            Start Game
          </Button>
          <div className="mt-8 p-4 bg-gray-700 bg-opacity-70 rounded-lg shadow-xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-300">How to Play:</h2>
            <ul className="list-disc list-inside text-left text-gray-200 space-y-2">
              <li>Use <span className="font-bold text-yellow-300">Arrow Keys</span> (↑↓←→) to control shot pose/direction.</li>
              <li>Use <span className="font-bold text-yellow-300">1: -Power, 2: +Power</span> to adjust shot power.</li>
              <li>Press <span className="font-bold text-yellow-300">Enter</span> to shoot the ball.</li>
              <li>Score 1 point for hitting the backboard or hoop.</li>
              <li>Get an extra point for every 3 consecutive hits!</li>
              <li>2-minute timer. High score wins!</li>
            </ul>
          </div>
        </div>
      )}

      {gameState === GameState.Ended && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-900 bg-opacity-80">
          <h2 className="text-6xl font-extrabold mb-8 text-green-400">Game Over!</h2>
          <p className="text-4xl text-yellow-300 mb-6">Final Score: {score}</p>
          <Button onClick={startGame} className="text-xl px-8 py-3 mb-4">
            Play Again
          </Button>
          <Button onClick={resetGame} className="text-lg px-6 py-2 bg-gray-600 hover:bg-gray-500">
            Reset Game
          </Button>
          <div className="mt-8 p-4 bg-gray-700 bg-opacity-70 rounded-lg shadow-xl max-w-xs w-full">
            <h3 className="text-xl font-bold mb-2 text-purple-300">High Scores:</h3>
            <ul className="text-sm">
              {highScores.map((entry, index) => (
                <li key={index} className="flex justify-between">
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="font-bold text-lg">{entry.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;