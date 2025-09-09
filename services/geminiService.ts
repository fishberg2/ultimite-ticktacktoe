
import { GoogleGenAI, Type } from "@google/genai";
import type { GameState, AiMove, SquareValue, BoardsState } from '../types';

// Ensure the API key is available
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatBoardToString = (boards: BoardsState, largeBoardWinners: SquareValue[]): string => {
  let boardStr = "Current Board State:\n";
  for (let i = 0; i < 9; i++) {
    boardStr += `Large Board ${i} (Winner: ${largeBoardWinners[i] || 'None'}): [${boards[i].map(s => s || '-').join(', ')}]\n`;
  }
  return boardStr;
};

export const getAiMove = async (gameState: GameState): Promise<AiMove | null> => {
  const { boards, largeBoardWinners, nextLargeBoardIndex } = gameState;

  const validMoves: AiMove[] = [];
    if (nextLargeBoardIndex !== null) {
        // Play in the specified board
        if (!largeBoardWinners[nextLargeBoardIndex]) {
            boards[nextLargeBoardIndex].forEach((square, sIdx) => {
                if (!square) {
                    validMoves.push({ largeBoardIndex: nextLargeBoardIndex, smallBoardIndex: sIdx });
                }
            });
        }
    }

    // If the specified board is won/full or no board is specified, find all valid moves
    if (validMoves.length === 0) {
        boards.forEach((smallBoard, lIdx) => {
            if (!largeBoardWinners[lIdx]) {
                smallBoard.forEach((square, sIdx) => {
                    if (!square) {
                        validMoves.push({ largeBoardIndex: lIdx, smallBoardIndex: sIdx });
                    }
                });
            }
        });
    }

  if (validMoves.length === 0) {
    console.warn("No valid moves available for AI.");
    return null; // No moves possible
  }

  const prompt = `
    You are an expert Ultimate Tic-Tac-Toe player. Your symbol is 'O'.
    The game consists of a 3x3 grid of smaller 3x3 tic-tac-toe boards.
    The goal is to win three smaller boards in a row, column, or diagonal.
    When a player makes a move in a square of a small board, the next player must play in the corresponding large board.
    For example, if 'X' plays in the top-right square of any small board, 'O' must then play in the top-right large board.
    If the target large board is already won or full, the player can play in any other available large board.

    Current game state:
    ${formatBoardToString(boards, largeBoardWinners)}
    
    The next move must be made in large board index: ${nextLargeBoardIndex === null ? 'Any available board' : nextLargeBoardIndex}.

    Your task is to choose the best possible move from the list of valid moves to maximize your chances of winning.
    A valid move must be in an unoccupied square within a large board that has not yet been won.

    Here are all the valid moves you can make, presented as an array of objects:
    ${JSON.stringify(validMoves)}

    Analyze the board state and the valid moves, then return your chosen move as a JSON object with 'largeBoardIndex' and 'smallBoardIndex'. You MUST pick one of the moves from the provided valid moves list.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            largeBoardIndex: { type: Type.INTEGER, description: "Index of the large board (0-8) for the move." },
            smallBoardIndex: { type: Type.INTEGER, description: "Index of the small square (0-8) within that board." },
          },
          required: ["largeBoardIndex", "smallBoardIndex"],
        },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const responseText = response.text.trim();
    const move = JSON.parse(responseText) as AiMove;

    // Final validation to ensure AI picked a valid move
    const isMoveValid = validMoves.some(
      validMove => validMove.largeBoardIndex === move.largeBoardIndex && validMove.smallBoardIndex === move.smallBoardIndex
    );
    
    if (isMoveValid) {
        return move;
    } else {
        console.warn("AI returned an invalid move. Picking a random valid move instead.", move);
        // Fallback to a random valid move if AI hallucinates
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // As a fallback, return a random valid move
    console.log("Gemini failed, returning a random valid move as a fallback.");
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
};
