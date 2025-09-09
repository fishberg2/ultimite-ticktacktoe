
export type Player = 'X' | 'O';
export type SquareValue = Player | null;
export type SmallBoard = SquareValue[];
export type BoardsState = SmallBoard[];

export interface GameState {
  boards: BoardsState;
  largeBoardWinners: SquareValue[];
  currentPlayer: Player;
  nextLargeBoardIndex: number | null;
  gameWinner: Player | null;
  isDraw: boolean;
}

export interface AiMove {
  largeBoardIndex: number;
  smallBoardIndex: number;
}
