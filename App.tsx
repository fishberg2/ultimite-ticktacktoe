
import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Player } from './types';
import { getAiMove } from './services/geminiService';
import { calculateWinner, isBoardFull } from './utils/gameLogic';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import LoadingSpinner from './components/LoadingSpinner';

const INITIAL_STATE: GameState = {
  boards: Array(9).fill(Array(9).fill(null)),
  largeBoardWinners: Array(9).fill(null),
  currentPlayer: 'X',
  nextLargeBoardIndex: null,
  gameWinner: null,
  isDraw: false,
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleRestart = () => {
    setGameState(INITIAL_STATE);
    setIsAiThinking(false);
    setAiError(null);
  };

  const handlePlay = useCallback((largeBoardIndex: number, smallBoardIndex: number) => {
    setGameState(prevState => {
      if (prevState.gameWinner || prevState.isDraw) return prevState;

      const { boards, currentPlayer, largeBoardWinners } = prevState;

      // Ignore click if the square is already taken or the large board is already won
      if (boards[largeBoardIndex][smallBoardIndex] || largeBoardWinners[largeBoardIndex]) {
        return prevState;
      }
      
      const newBoards = boards.map(b => [...b]);
      newBoards[largeBoardIndex][smallBoardIndex] = currentPlayer;

      const newLargeBoardWinners = [...largeBoardWinners];
      if (!newLargeBoardWinners[largeBoardIndex]) {
        const smallBoardWinner = calculateWinner(newBoards[largeBoardIndex]);
        if (smallBoardWinner) {
          newLargeBoardWinners[largeBoardIndex] = smallBoardWinner;
        }
      }

      const gameWinner = calculateWinner(newLargeBoardWinners);
      const isGameADraw = !gameWinner && newLargeBoardWinners.every((winner, index) => winner || isBoardFull(newBoards[index]));

      // Determine the next board
      let nextLargeBoardIndex: number | null = smallBoardIndex;
      if (newLargeBoardWinners[nextLargeBoardIndex] || isBoardFull(newBoards[nextLargeBoardIndex])) {
        nextLargeBoardIndex = null; // Player can play anywhere
      }

      return {
        boards: newBoards,
        largeBoardWinners: newLargeBoardWinners,
        currentPlayer: currentPlayer === 'X' ? 'O' : 'X',
        nextLargeBoardIndex,
        gameWinner,
        isDraw: isGameADraw,
      };
    });
  }, []);


  useEffect(() => {
    if (gameState.currentPlayer === 'O' && !gameState.gameWinner && !gameState.isDraw) {
      const fetchAiMove = async () => {
        setIsAiThinking(true);
        setAiError(null);
        try {
          const move = await getAiMove(gameState);
          if(move) {
              handlePlay(move.largeBoardIndex, move.smallBoardIndex);
          } else {
            setAiError("AI failed to make a move. The game might be stuck.");
          }
        } catch (error) {
          console.error("Error getting AI move:", error);
          setAiError("An error occurred while fetching the AI's move. Please try restarting.");
        } finally {
          setIsAiThinking(false);
        }
      };
      // Add a small delay for better UX
      const timer = setTimeout(fetchAiMove, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameWinner, gameState.isDraw, gameState, handlePlay]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
          Ultimate Tic-Tac-Toe
        </h1>
        <p className="text-gray-400 mt-2">Play against a Gemini-powered AI</p>
      </div>
      
      <div className="relative w-full max-w-lg md:max-w-xl aspect-square">
        {isAiThinking && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-70 flex flex-col items-center justify-center z-10 rounded-lg">
            <LoadingSpinner />
            <p className="mt-4 text-lg text-cyan-300 animate-pulse">Gemini is thinking...</p>
          </div>
        )}
        <GameBoard
          gameState={gameState}
          onPlay={handlePlay}
          disabled={gameState.currentPlayer === 'O' || isAiThinking || !!gameState.gameWinner || gameState.isDraw}
        />
      </div>

      <div className="mt-6 w-full max-w-lg md:max-w-xl">
        {aiError && <p className="text-red-500 text-center mb-4">{aiError}</p>}
        <GameStatus gameState={gameState} onRestart={handleRestart} />
      </div>
    </div>
  );
};

export default App;
