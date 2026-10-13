import { getValidMoves, isCheckmate } from './validateMoves';
import { Piece } from '../types/Piece';

const rights = { whiteKingMoved:true, blackKingMoved:true, whiteKingsideRookMoved:true, whiteQueensideRookMoved:true, blackKingsideRookMoved:true, blackQueensideRookMoved:true };
const empty = (): (Piece | null)[][] => Array.from({ length: 8 }, () => Array(8).fill(null));

test('king cannot move next to the enemy king', () => {
  const board = empty();
  board[4][4] = { type: 'king', color: 'white' };
  board[2][4] = { type: 'king', color: 'black' };
  const moves = getValidMoves(board, 4, 4, null, rights);
  expect(moves.some(m => m.row === 3)).toBe(false);
  expect(moves.length).toBe(5);
});

test('knight in the center has 8 moves', () => {
  const board = empty();
  board[7][0] = { type: 'king', color: 'white' };
  board[0][7] = { type: 'king', color: 'black' };
  board[4][4] = { type: 'knight', color: 'white' };
  expect(getValidMoves(board, 4, 4, null, rights).length).toBe(8);
});

test('rook in the center has 14 moves on an open board', () => {
  const board = empty();
  board[7][0] = { type: 'king', color: 'white' };
  board[0][7] = { type: 'king', color: 'black' };
  board[4][4] = { type: 'rook', color: 'white' };
  expect(getValidMoves(board, 4, 4, null, rights).length).toBe(14);
});

test('a pinned rook can only move along the pin line', () => {
  const board = empty();
  board[7][4] = { type: 'king', color: 'white' };
  board[6][4] = { type: 'rook', color: 'white' };
  board[0][4] = { type: 'rook', color: 'black' };
  board[0][0] = { type: 'king', color: 'black' };
  const moves = getValidMoves(board, 6, 4, null, rights);
  expect(moves.every(m => m.col === 4)).toBe(true);
  expect(moves.length).toBe(6);
});

test('detects back-rank checkmate, and no mate once the rook is gone', () => {
  const board = empty();
  board[7][7] = { type: 'king', color: 'white' };
  board[6][6] = { type: 'pawn', color: 'white' };
  board[6][7] = { type: 'pawn', color: 'white' };
  board[7][0] = { type: 'rook', color: 'black' };
  board[0][0] = { type: 'king', color: 'black' };
  expect(isCheckmate(board, 'white', null, rights)).toBe(true);
  board[7][0] = null;
  expect(isCheckmate(board, 'white', null, rights)).toBe(false);
});