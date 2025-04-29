// src/components/ChessBoard.tsx
import React, { useState } from 'react';
import ChessPiece from './ChessPiece';
import { CastlingRights, LastMove, Piece } from '../types/Piece';
import './ChessBoard.css'; // Import the CSS file
import { getValidMoves, isCheckmate } from '../services/validateMoves';

const ChessBoard: React.FC = () => {
    const board: (Piece | null) [][] = [
        [ // row 0 - Black major pieces
          { type: 'rook', color: 'black' },
          { type: 'knight', color: 'black' },
          { type: 'bishop', color: 'black' },
          { type: 'queen', color: 'black' },
          { type: 'king', color: 'black' },
          { type: 'bishop', color: 'black' },
          { type: 'knight', color: 'black' },
          { type: 'rook', color: 'black' },
        ],
        [ // row 1 - Black pawns
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
          { type: 'pawn', color: 'black' },
        ],
        [ // row 2 - Empty
          null, null, null, null, null, null, null, null
        ],
        [ // row 3 - Empty
          null, null, null, null, null, null, null, null
        ],
        [ // row 4 - Empty
          null, null, null, null, null, null, null, null
        ],
        [ // row 5 - Empty
          null, null, null, null, null, null, null, null
        ],
        [ // row 6 - White pawns
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
          { type: 'pawn', color: 'white' },
        ],
        [ // row 7 - White major pieces
          { type: 'rook', color: 'white' },
          { type: 'knight', color: 'white' },
          { type: 'bishop', color: 'white' },
          { type: 'queen', color: 'white' },
          { type: 'king', color: 'white' },
          { type: 'bishop', color: 'white' },
          { type: 'knight', color: 'white' },
          { type: 'rook', color: 'white' },
        ],
    ];
    const [gameOver, setGameOver] = useState(false);
    const [selectedPiece, setSelectedPiece] = useState<{ row: number; col: number } | null>(null);
    const [turn, setTurn] = useState<'white' | 'black'>('white');
    const [boardState, setBoardState] = useState(board);
    const [validMoves, setValidMoves] = useState< { row: number; col: number }[]>([]);
    const [lastMove, setLastMove] = useState<LastMove>(null);
    const [castlingRights, setCastlingRights] = useState<CastlingRights>({
        whiteKingMoved: false,
        blackKingMoved: false,
        whiteKingsideRookMoved: false,
        whiteQueensideRookMoved: false,
        blackKingsideRookMoved: false,
        blackQueensideRookMoved: false,
      });


    const handleSquareClick = (row: number, col: number) => {
        const square = boardState[row][col];
      
        if (selectedPiece) {
          const selectedSquare = boardState[selectedPiece.row][selectedPiece.col];
          const moves = getValidMoves(boardState, row, col, lastMove, castlingRights);
          if (square && square.color === turn) {
            // Change selection (clicked your own piece)
            setSelectedPiece({ row, col });
           
            setValidMoves(moves);
            setBoardState(boardState);
          } else {

            if (isValidMove(row, col)) {
                // Move selected piece to empty or enemy square
                const newBoard = boardState.map((r) => r.slice());

                // 🛡️ Handle En Passant special capture
                if (selectedSquare?.type === 'pawn' && col !== selectedPiece.col && !square) {
                    // Moved diagonally into an empty square -> En Passant!
                    const direction = turn === 'white' ? 1 : -1; // Opposite because you capture enemy pawn
                    newBoard[row + direction][col] = null; // Remove enemy pawn
                }

               // Normal move
                newBoard[row][col] = selectedSquare;
                newBoard[selectedPiece.row][selectedPiece.col] = null;

                // 🛡️ Pawn Promotion
                if (selectedSquare?.type === 'pawn') {
                    const promotionRow = selectedSquare.color === 'white' ? 0 : 7;
                    if (row === promotionRow) {
                    newBoard[row][col] = {
                        type: 'queen', // Promote to Queen
                        color: selectedSquare.color
                    };
                    }
                }

                // Handle Castling
                if (selectedSquare?.type === 'king' && Math.abs(col - selectedPiece.col) === 2) {
                    // King moved two squares horizontally → it is castling
                    if (col === 6) {
                    // Kingside castling
                    newBoard[row][5] = newBoard[row][7]; // Move rook next to king
                    newBoard[row][7] = null; // Empty original rook square
                    } else if (col === 2) {
                    // Queenside castling
                    newBoard[row][3] = newBoard[row][0]; // Move rook next to king
                    newBoard[row][0] = null; // Empty original rook square
                    }
                }

                if(selectedSquare?.type === 'king' || selectedSquare?.type === 'rook'){
                    updateCastlingFlags(selectedSquare)
                }

                setBoardState(newBoard);
                setSelectedPiece(null);
                setValidMoves([]);
                setLastMove({ from: { row: selectedPiece.row, col: selectedPiece.col }, to: { row, col }, piece: selectedSquare! });
                const nextTurn = turn === 'white' ? 'black' : 'white';
                setTurn(nextTurn);
            
                // Checkmate detection
                if (isCheckmate(newBoard, nextTurn, lastMove, castlingRights)) {
                    setTimeout(() => {
                    alert(`${nextTurn.toUpperCase()} is checkmated! Game over.`);
                    setGameOver(true);
                    }, 100);
                }
            }
          }
        } else {
          if (square && square.color === turn) {
            setSelectedPiece({ row, col });
            const moves = getValidMoves(boardState, row, col, lastMove, castlingRights);
            setValidMoves(moves);
            setBoardState(boardState);
          }
        }
      };

      const getCursorClass = (piece: Piece | null): string => {
        if (piece && piece.color === turn) {
          return 'cursor-pointer';
        }
        return 'cursor-default';
      };

      const isSelectedSquare = (row:number, col:number):string => {
        if(selectedPiece?.row === row && selectedPiece?.col === col){
            return  'selected-square'
        }
        return ''
      }

      const isValidMove = (row: number, col: number) => {
        return validMoves.some(move => move.row === row && move.col === col);
      };

      const isCaptureMove = (row: number, col: number) => {
        const square = boardState[row][col];
        return isValidMove(row, col) && square !== null && square.color !== turn;
      };

      const updateCastlingFlags = (selectedSquare:Piece | null):void =>{

        if (selectedSquare?.type === 'king') {
            if (selectedSquare.color === 'white') {
              setCastlingRights(prev => ({ ...prev, whiteKingMoved: true }));
            } else {
              setCastlingRights(prev => ({ ...prev, blackKingMoved: true }));
            }
          }
          
          if (selectedSquare?.type === 'rook') {
            if (selectedSquare.color === 'white') {
              if (selectedPiece?.col === 0) {
                setCastlingRights(prev => ({ ...prev, whiteQueensideRookMoved: true }));
              } else if (selectedPiece?.col === 7) {
                setCastlingRights(prev => ({ ...prev, whiteKingsideRookMoved: true }));
              }
            } else {
              if (selectedPiece?.col === 0) {
                setCastlingRights(prev => ({ ...prev, blackQueensideRookMoved: true }));
              } else if (selectedPiece?.col === 7) {
                setCastlingRights(prev => ({ ...prev, blackKingsideRookMoved: true }));
              }
            }
          }
          
      }
      
      
    const renderSquares = () => {
        const squares = [];
        let isWhite = false; // This determines the alternating color of the squares

        for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        const rowSquares = [];
        for (let colIndex = 0; colIndex < 8; colIndex++) {
            const piece: Piece | null = boardState[rowIndex][colIndex];

            rowSquares.push(
            <div
                key={`${rowIndex}-${colIndex}`}
                className={`square ${isWhite ? 'white' : 'dark'} ${getCursorClass(piece)} 
                ${isCaptureMove(rowIndex, colIndex) ? 'capture-move' : ''}
                ${isSelectedSquare(rowIndex, colIndex)}  ${isValidMove(rowIndex, colIndex) ? 'valid-move' : '' }`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
            >

                {piece && <ChessPiece type={piece.type} color={piece.color} />}
            </div>
            );
            isWhite = !isWhite; // Alternate square color
        }
        // Wrap the row in a div that will stack the squares
        squares.push(
            <div key={rowIndex} className="row">
            {rowSquares}
            </div>
        );
        isWhite = !isWhite; // Alternate color for the next row
        }
        return squares;
    };

    
    const restartGame = () => {
        setBoardState(board); // <<< you need an initialBoard function!
        setTurn('white');
        setSelectedPiece(null);
        setValidMoves([]);
        setCastlingRights({
          whiteKingMoved: false,
          blackKingMoved: false,
          whiteKingsideRookMoved: false,
          whiteQueensideRookMoved: false,
          blackKingsideRookMoved: false,
          blackQueensideRookMoved: false,
        });
        setLastMove(null);
        setGameOver(false);
    };


    

    return (
        <div>
          <div className="board">
            <div className="turn-title">
              <span className="capitalize">{turn} to move.</span>
            </div>
            {renderSquares()}
          </div>
      
          {gameOver && (
            <button onClick={restartGame} style={{ marginTop: '20px', padding: '10px 20px', cursor:'pointer', fontSize: '16px' }}>
              Restart Game
            </button>
          )}
        </div>
      );
      
};

export default ChessBoard;


