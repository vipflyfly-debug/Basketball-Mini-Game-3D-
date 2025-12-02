import React from 'react';
import { MAX_POWER, MIN_POWER, MAX_SHOT_DIRECTION_DEGREES } from '../../constants';

interface ControlPanelProps {
  power: number;
  shotDirectionY: number; // Left/Right
  shotDirectionX: number; // Up/Down
  ballResetting: boolean;
  gameActive: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ power, shotDirectionY, shotDirectionX, ballResetting, gameActive }) => {
  const isInputDisabled = ballResetting || !gameActive;

  // Calculate power percentage for the bar
  const powerPercentage = ((power - MIN_POWER) / (MAX_POWER - MIN_POWER)) * 100;

  // Determine direction indicator styling
  const directionYText = shotDirectionY === 0 ? 'Center' : (shotDirectionY > 0 ? `Right ${shotDirectionY}°` : `Left ${-shotDirectionY}°`);
  const directionXText = shotDirectionX === 0 ? 'Straight' : (shotDirectionX > 0 ? `Up ${shotDirectionX}°` : `Down ${-shotDirectionX}°`);

  return (
    <div className={`p-4 rounded-lg bg-gray-700 bg-opacity-80 shadow-inner max-w-sm transition-opacity duration-300 ${isInputDisabled ? 'opacity-50' : 'opacity-100'}`}>
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold text-blue-200 mb-2">Controls</h3>
        <p className="text-sm text-gray-300">
          Arrows: <span className="font-bold text-yellow-300">Direction</span> | 1: <span className="font-bold text-yellow-300">-Power</span>, 2: <span className="font-bold text-yellow-300">+Power</span> | Enter: <span className="font-bold text-yellow-300">Shoot</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm md:text-base"> {/* Removed md:grid-cols-2 as it's a narrow column now */}
        {/* Power Indicator */}
        <div className="flex flex-col items-center justify-center bg-gray-800 p-3 rounded-md shadow-md">
          <span className="text-gray-300 font-medium mb-1">Power</span>
          <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-red-500 rounded-full"
              style={{ width: `${powerPercentage}%` }}
            ></div>
          </div>
          <span className="text-yellow-400 mt-2">{power} / {MAX_POWER}</span>
        </div>

        {/* Shot Direction Y (Left/Right) */}
        <div className="flex flex-col items-center justify-center bg-gray-800 p-3 rounded-md shadow-md">
          <span className="text-gray-300 font-medium mb-1">Horizontal Angle</span>
          <div className="relative w-full h-3 bg-gray-600 rounded-full flex items-center justify-center">
            <div
              className="absolute h-full w-1 bg-white rounded-full transition-transform duration-100"
              style={{
                transform: `translateX(${((shotDirectionY / MAX_SHOT_DIRECTION_DEGREES) * 50)}%)`,
              }}
            ></div>
            <span className="absolute left-0 text-xs text-gray-400">- {MAX_SHOT_DIRECTION_DEGREES}°</span>
            <span className="absolute right-0 text-xs text-gray-400">+ {MAX_SHOT_DIRECTION_DEGREES}°</span>
          </div>
          <span className="text-cyan-400 mt-2">{directionYText}</span>
        </div>

        {/* Shot Direction X (Up/Down) */}
        <div className="flex flex-col items-center justify-center bg-gray-800 p-3 rounded-md shadow-md">
          <span className="text-gray-300 font-medium mb-1">Vertical Angle</span>
          <div className="relative w-full h-3 bg-gray-600 rounded-full flex items-center justify-center">
            <div
              className="absolute h-full w-1 bg-white rounded-full transition-transform duration-100"
              style={{
                transform: `translateX(${((shotDirectionX / MAX_SHOT_DIRECTION_DEGREES) * 50)}%)`,
              }}
            ></div>
            <span className="absolute left-0 text-xs text-gray-400">- {MAX_SHOT_DIRECTION_DEGREES}°</span>
            <span className="absolute right-0 text-xs text-gray-400">+ {MAX_SHOT_DIRECTION_DEGREES}°</span>
          </div>
          <span className="text-purple-400 mt-2">{directionXText}</span>
        </div>
      </div>

      {ballResetting && (
        <p className="mt-4 text-center text-orange-300 font-bold text-lg animate-pulse">
          Ball Resetting...
        </p>
      )}
      {!gameActive && !ballResetting && (
         <p className="mt-4 text-center text-gray-400 font-bold text-lg">
          Press "Start Game" to begin!
        </p>
      )}
    </div>
  );
};

export default ControlPanel;