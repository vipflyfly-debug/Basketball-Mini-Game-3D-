import React from 'react';

interface ScoreboardProps {
  score: number;
  consecutiveHits: number;
  timer: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, consecutiveHits, timer }) => {
  return (
    <div className="flex items-center justify-around w-max px-4 py-2 text-lg md:text-xl font-bold text-white bg-gray-800 bg-opacity-70 shadow-lg rounded-lg">
      <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700 bg-opacity-80">
        <span className="text-blue-300 text-sm">Score</span>
        <span className="text-yellow-400">{score}</span>
      </div>
      <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700 bg-opacity-80 mx-4">
        <span className="text-blue-300 text-sm">Consecutive</span>
        <span className="text-green-400">{consecutiveHits}</span>
      </div>
      <div className="flex flex-col items-center p-2 rounded-lg bg-gray-700 bg-opacity-80">
        <span className="text-blue-300 text-sm">Time Left</span>
        <span className="text-red-400">{timer}</span>
      </div>
    </div>
  );
};

export default Scoreboard;