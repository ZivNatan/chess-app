export type Piece = {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
};

export type ValidMoves = { row: number; col: number }[];

export type LastMove = { from: { row: number; col: number }, to: { row: number; col: number }, piece: Piece } | null;

export type CastlingRights = {
  whiteKingMoved: boolean;
  blackKingMoved: boolean;
  whiteKingsideRookMoved: boolean;
  whiteQueensideRookMoved: boolean;
  blackKingsideRookMoved: boolean;
  blackQueensideRookMoved: boolean;
}