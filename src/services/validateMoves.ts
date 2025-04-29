import { Piece, ValidMoves, LastMove, CastlingRights } from '../types/Piece'; // If you move Piece to types/Piece.ts, even better

export const getValidMoves = (board: (Piece | null)[][], fromRow: number, fromCol: number, lastMove: LastMove, castlingRights: CastlingRights, checkKingSafety = true): ValidMoves => {
  const piece = board[fromRow][fromCol];
  let validMoves: ValidMoves = [];
  if (!piece) return [];

  // Example logic just for pawns (you can later expand for all pieces)
  if (piece.type === 'pawn') {
    validMoves =  pawnValidtion(piece, board, fromRow, fromCol, lastMove )
  } else if (piece.type === 'knight') {
    validMoves = knightValidation(piece, board, fromRow, fromCol);
  } else if (piece.type === 'bishop') {
    validMoves = bishopValidation(piece, board, fromRow, fromCol);
  } else if (piece.type === 'rook') {
    validMoves = rookValidation(piece, board, fromRow, fromCol);
  } else if (piece.type === 'queen') {
    validMoves = queenValidation(piece, board, fromRow, fromCol);
  } else if (piece.type === 'king' && checkKingSafety) {
    validMoves = kingValidation(piece, board, fromRow, fromCol, castlingRights);
  }  

  if (checkKingSafety) {
    validMoves = validMoves.filter(move => {
      const newBoard = board.map(row => row.slice()); // Deep copy
      newBoard[move.row][move.col] = piece;
      newBoard[fromRow][fromCol] = null;
      return !isKingInCheck(newBoard, piece.color, castlingRights);
    });
  }

  return validMoves;
};

export const isCheckmate = (
    board: (Piece | null)[][],
    color: 'white' | 'black',
    lastMove: { from: { row: number; col: number }; to: { row: number; col: number }; piece: Piece } | null,
    castlingRights: CastlingRights
  ): boolean => {
    // 1. Is king already in check?
    if (!isKingInCheck(board, color, castlingRights)) {
      return false; // King is not in check → not mate
    }
  
    // 2. Check if the player has any legal move
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === color) {
          const moves = getValidMoves(board, row, col, lastMove, castlingRights, true);
  
          if (moves.length > 0) {
            return false; // Found a move → not mate
          }
        }
      }
    }
  
    // No moves → Checkmate!
    return true;
  };

  const pawnValidtion = ( 
    piece: Piece, 
    board: (Piece | null)[][], 
    fromRow: number, 
    fromCol: number,   
    lastMove: { from: { row: number; col: number }, to: { row: number; col: number }, piece: Piece } | null
    ): ValidMoves => {

    const validMoves: ValidMoves = [];
    const direction = piece.color === 'white' ? -1 : 1;
    const nextRow = fromRow + direction;
  
    // 1 step forward if empty
    if (board[nextRow] && !board[nextRow][fromCol]) {
      validMoves.push({ row: nextRow, col: fromCol });
  
      // 2 steps forward if on starting row AND both squares empty
      const startingRow = piece.color === 'white' ? 6 : 1;
      const twoStepsRow = fromRow + 2 * direction;
      if (fromRow === startingRow && board[twoStepsRow] && !board[twoStepsRow][fromCol]) {
        validMoves.push({ row: twoStepsRow, col: fromCol });
      }
    }
  
    // Capture diagonally
    [fromCol - 1, fromCol + 1].forEach(captureCol => {
      if (board[nextRow] && board[nextRow][captureCol] && board[nextRow][captureCol]?.color !== piece.color) {
        validMoves.push({ row: nextRow, col: captureCol });
      }
    });

    // En Passant
    if (lastMove && lastMove.piece.type === 'pawn' && Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
        const direction = piece.color === 'white' ? -1 : 1;
        const enPassantRow = fromRow;
        
        // Check if pawn is next to the opponent pawn that just moved
        [fromCol - 1, fromCol + 1].forEach(captureCol => {
        if (captureCol >= 0 && captureCol < 8) {
            if (lastMove.to.row === enPassantRow && lastMove.to.col === captureCol) {
            validMoves.push({ row: fromRow + direction, col: captureCol });
            }
        }
        });
    }
  
  
    return validMoves;
  };

  const knightValidation = (piece: Piece, board: (Piece | null)[][], fromRow: number, fromCol: number): ValidMoves => {
    const validMoves: ValidMoves = [];
  
    // All 8 possible L-shaped jumps
    const moves = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ];
  
    for (const move of moves) {
      const r = fromRow + move.row;
      const c = fromCol + move.col;
  
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetSquare = board[r][c];
  
        if (!targetSquare || targetSquare.color !== piece.color) {
          validMoves.push({ row: r, col: c });
        }
      }
    }
  
    return validMoves;
  };

  const bishopValidation = (piece: Piece, board: (Piece | null)[][], fromRow: number, fromCol: number): ValidMoves => {
    const validMoves: ValidMoves = [];
  
    // Diagonal directions
    const directions = [
      { row: -1, col: -1 }, // up-left
      { row: -1, col: 1 },  // up-right
      { row: 1, col: -1 },  // down-left
      { row: 1, col: 1 },   // down-right
    ];
  
    for (const dir of directions) {
      let r = fromRow + dir.row;
      let c = fromCol + dir.col;
  
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetSquare = board[r][c];
  
        if (!targetSquare) {
          // Empty square → can move
          validMoves.push({ row: r, col: c });
        } else {
          if (targetSquare.color !== piece.color) {
            // Enemy piece → can capture
            validMoves.push({ row: r, col: c });
          }
          // Friendly or enemy → stop
          break;
        }
  
        r += dir.row;
        c += dir.col;
      }
    }
  
    return validMoves;
  };

  const rookValidation = (piece: Piece, board: (Piece | null)[][], fromRow: number, fromCol: number): ValidMoves => {
    const validMoves: ValidMoves = [];
  
    // Directions: up, down, left, right
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 },  // right
    ];
  
    for (const dir of directions) {
      let r = fromRow + dir.row;
      let c = fromCol + dir.col;
  
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetSquare = board[r][c];
  
        if (!targetSquare) {
          // Empty square → you can move there
          validMoves.push({ row: r, col: c });
        } else {
          if (targetSquare.color !== piece.color) {
            // Enemy piece → you can capture it
            validMoves.push({ row: r, col: c });
          }
          // Friendly or enemy -> stop here
          break;
        }
  
        r += dir.row;
        c += dir.col;
      }
    }
  
    return validMoves;
  };

  const queenValidation = (piece: Piece, board: (Piece | null)[][], fromRow: number, fromCol: number): ValidMoves => {
    const rookMoves = rookValidation(piece, board, fromRow, fromCol);
    const bishopMoves = bishopValidation(piece, board, fromRow, fromCol);
    return [...rookMoves, ...bishopMoves];
  };

  const kingValidation = (piece: Piece, board: (Piece | null)[][], fromRow: number, fromCol: number, castlingRights:CastlingRights): ValidMoves => {
    const validMoves: ValidMoves = [];
  
    const directions = [
      { row: -1, col: 0 }, { row: 1, col: 0 },
      { row: 0, col: -1 }, { row: 0, col: 1 },
      { row: -1, col: -1 }, { row: -1, col: 1 },
      { row: 1, col: -1 }, { row: 1, col: 1 },
    ];
  
    for (const dir of directions) {
      const r = fromRow + dir.row;
      const c = fromCol + dir.col;
  
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const targetSquare = board[r][c];
  
        if (!targetSquare || targetSquare.color !== piece.color) {
          // Now simulate the move
          const newBoard = board.map(row => row.slice()); // Deep copy
          newBoard[r][c] = piece;
          newBoard[fromRow][fromCol] = null;
  
          if (!isKingInCheck(newBoard, piece.color, castlingRights)) {
            validMoves.push({ row: r, col: c });
          }
        }
      }
    }

    CastlingValidation(castlingRights, piece, board, validMoves)
 
  
    return validMoves;
  };
  
  
  const isKingInCheck = (board: (Piece | null)[][], color: 'white' | 'black', castlingRights: CastlingRights): boolean => {
    let kingPosition: { row: number; col: number } | null = null;
  
    // 1. Find the king
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'king' && piece.color === color) {
          kingPosition = { row: r, col: c };
          break;
        }
      }
      if (kingPosition) break;
    }
  
    if (!kingPosition) {
      // King not found (error)
      return true;
    }
  
    // 2. Check if any enemy piece attacks king position
   
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const piece = board[r][c];
              if (piece && piece.color !== color) {
                const enemyMoves = getValidMoves(board, r, c, null, castlingRights, false);
        
                if (enemyMoves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
                  return true;
                }
              }
            }
          }
    

    return false;
  };

  const isSquareUnderAttack = (board: (Piece | null)[][], row: number, col: number, enemyColor: 'white' | 'black', castlingRights: CastlingRights): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === enemyColor) {
          const moves = getValidMoves(board, r, c, null, castlingRights, false); 
  
          if (moves.some(move => move.row === row && move.col === col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const CastlingValidation =  (castlingRights: CastlingRights, piece: Piece , board: (Piece | null)[][], validMoves: ValidMoves) => {

       // Short Castling (Kingside)
       if (castlingRights && !castlingRights.whiteKingMoved && !castlingRights.whiteKingsideRookMoved && piece.color === 'white') {
        if (!board[7][5] && !board[7][6]) { // Squares between King and Rook are empty
            // You also must check that squares 5 and 6 are not under attack!
            if (!isSquareUnderAttack(board, 7, 4, 'black',castlingRights) &&
                !isSquareUnderAttack(board, 7, 5, 'black',castlingRights) &&
                !isSquareUnderAttack(board, 7, 6, 'black',castlingRights)) {
                validMoves.push({ row: 7, col: 6 }); // King castles to g1
            }
        }
    }

    // Short Castling (Kingside) for black
    if (castlingRights && !castlingRights.blackKingMoved && !castlingRights.blackKingsideRookMoved && piece.color === 'black') {
        if (!board[0][5] && !board[0][6]) { // Squares between King and Rook are empty
        if (!isSquareUnderAttack(board, 0, 4, 'white', castlingRights) &&
            !isSquareUnderAttack(board, 0, 5, 'white', castlingRights) &&
            !isSquareUnderAttack(board, 0, 6, 'white', castlingRights)) {
            validMoves.push({ row: 0, col: 6 }); // King castles to g8
        }
        }
    }
    
    // Long Castling (Queenside)
    if (castlingRights && !castlingRights.whiteKingMoved && !castlingRights.whiteQueensideRookMoved && piece.color === 'white') {
        if (!board[7][1] && !board[7][2] && !board[7][3]) { // Squares between King and Rook are empty
        if (!isSquareUnderAttack(board, 7, 4, 'black', castlingRights) &&
            !isSquareUnderAttack(board, 7, 3, 'black', castlingRights) &&
            !isSquareUnderAttack(board, 7, 2, 'black',castlingRights)) {
            validMoves.push({ row: 7, col: 2 }); // King castles to c1
        }
        }
    }

    // Long Castling (Queenside) for black
    if (castlingRights && !castlingRights.blackKingMoved && !castlingRights.blackQueensideRookMoved && piece.color === 'black') {
        if (!board[0][1] && !board[0][2] && !board[0][3]) { // Squares between King and Rook are empty
        if (!isSquareUnderAttack(board, 0, 4, 'white', castlingRights) &&
            !isSquareUnderAttack(board, 0, 3, 'white', castlingRights) &&
            !isSquareUnderAttack(board, 0, 2, 'white', castlingRights)) {
            validMoves.push({ row: 0, col: 2 }); // King castles to c8
        }
        }
    }

  }


  
  
  
  
  
