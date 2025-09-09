
import React from 'react';
import type { GameState } from '../types';

interface GameStatusProps {
  gameState: GameState;
  onRestart: () => void;
}

const GameStatus: React.FC<GameStatusProps> = ({ gameState, onRestart }) => {
  const { gameWinner, isDraw, currentPlayer } = gameState;

  const getStatusMessage = () => {
    if (gameWinner) {
      return (
        <span className={gameWinner === 'X' ? 'text-cyan-400' : 'text-fuchsia-500'}>
          Player {gameWinner} Wins!
        </span>
      );
    }
    if (isDraw) {
      return <span className="text-gray-400">It's a Draw!</span>;
    }
    return (
      <span>
        Turn: Player{' '}
        <span className={currentPlayer === 'X' ? 'text-cyan-400' : 'text-fuchsia-500'}>
          {currentPlayer}
        </span>
      </span>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-800 rounded-lg shadow-lg">
      <div className="text-xl md:text-2xl font-bold text-white mb-4 sm:mb-0">
        {getStatusMessage()}
      </div>
      <button
        onClick={onRestart}
        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400 transition-all duration-300"
      >
        Restart Game
      </button>
    </div>
  );
};

export default GameStatus;
