
import React from 'react';
import type { SquareValue } from '../types';
import { XIcon, OIcon } from './icons';

interface SmallSquareProps {
  value: SquareValue;
  onClick: () => void;
  disabled: boolean;
  isPlayable: boolean;
}

const SmallSquare: React.FC<SmallSquareProps> = ({ value, onClick, disabled, isPlayable }) => {
  const baseClasses = "aspect-square w-full h-full flex items-center justify-center rounded transition-colors duration-200";
  const playableClasses = isPlayable 
    ? "bg-gray-700 hover:bg-gray-600 cursor-pointer" 
    : "bg-gray-800/50 cursor-not-allowed";

  const iconClasses = "w-full h-full p-1.5 md:p-2";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${playableClasses}`}
      aria-label={`Square ${value ? `with value ${value}` : 'empty'}`}
    >
      {value === 'X' && <XIcon className={`${iconClasses} text-cyan-400`} />}
      {value === 'O' && <OIcon className={`${iconClasses} text-fuchsia-500`} />}
    </button>
  );
};

export default SmallSquare;
