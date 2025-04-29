// src/components/ChessPiece.tsx
import React from 'react';

interface ChessPieceProps {
  type: string; // The type of the piece (e.g., 'pawn', 'king', etc.)
  color: string; // The color of the piece ('white' or 'black')
}

const ChessPiece: React.FC<ChessPieceProps> = ({ type, color }) => {
  const pieceSymbols: { [key: string]: string } = {
    pawn: color === 'white' ? '♙' : '♟',
    rook: color === 'white' ? '♖' : '♜',
    knight: color === 'white' ? '♘' : '♞',
    bishop: color === 'white' ? '♗' : '♝',
    queen: color === 'white' ? '♕' : '♛',
    king: color === 'white' ? '♔' : '♚',
  };

  return (
    <div className={`flex justify-center items-center text-3xl`}>
      {pieceSymbols[type]}
    </div>
  );
};

export default ChessPiece;
