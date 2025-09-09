
import React from 'react';
import type { SmallBoard, SquareValue } from '../types';
import SmallSquare from './SmallSquare';
import { XIcon, OIcon } from './icons';

interface LargeBoardProps {
  largeBoardIndex: number;
  smallBoard: SmallBoard;
  winner: SquareValue;
  isActive: boolean;
  onPlay: (largeBoardIndex: number, smallBoardIndex: number) => void;
  disabled: boolean;
}

const LargeBoard: React.FC<LargeBoardProps> = ({
  largeBoardIndex,
  smallBoard,
  winner,
  isActive,
  onPlay,
  disabled,
}) => {
  const boardIsActiveAndPlayable = isActive && !winner && !disabled;

  const baseClasses = "grid grid-cols-3 gap-1 rounded-md relative transition-all duration-300";
  const activeClasses = boardIsActiveAndPlayable ? "bg-gray-700 shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400" : "bg-gray-800";
  const inactiveClasses = !isActive && !winner ? "opacity-50" : "";
  const wonClasses = winner ? `bg-gray-800 ${winner === 'X' ? 'ring-2 ring-cyan-500' : 'ring-2 ring-fuchsia-500'}` : "";

  return (
    <div className={`${baseClasses} ${activeClasses} ${inactiveClasses} ${wonClasses}`}>
      {winner && (
        <div className="absolute inset-0 flex items-center justify-center text-8xl md:text-9xl font-black z-10">
          {winner === 'X' 
            ? <XIcon className="w-full h-full p-2 text-cyan-400 opacity-60" /> 
            : <OIcon className="w-full h-full p-2 text-fuchsia-500 opacity-60" />}
        </div>
      )}
      {smallBoard.map((square, i) => (
        <SmallSquare
          key={i}
          value={square}
          onClick={() => onPlay(largeBoardIndex, i)}
          disabled={disabled || !isActive || !!winner || !!square}
          isPlayable={boardIsActiveAndPlayable && !square}
        />
      ))}
    </div>
  );
};

export default LargeBoard;
