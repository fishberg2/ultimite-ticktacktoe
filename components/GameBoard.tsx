
import React from 'react';
import type { GameState } from '../types';
import LargeBoard from './LargeBoard';

interface GameBoardProps {
  gameState: GameState;
  onPlay: (largeBoardIndex: number, smallBoardIndex: number) => void;
  disabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onPlay, disabled }) => {
  const { boards, largeBoardWinners, nextLargeBoardIndex } = gameState;

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 p-1 md:p-2 bg-gray-800 rounded-lg shadow-2xl">
      {boards.map((smallBoard, i) => (
        <LargeBoard
          key={i}
          largeBoardIndex={i}
          smallBoard={smallBoard}
          winner={largeBoardWinners[i]}
          isActive={nextLargeBoardIndex === null || nextLargeBoardIndex === i}
          onPlay={onPlay}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default GameBoard;
