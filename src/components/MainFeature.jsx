import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

const RefreshCwIcon = getIcon('refresh-cw');
const HomeIcon = getIcon('home');
const ArrowRightIcon = getIcon('arrow-right');
const TrophyIcon = getIcon('trophy');
const CircleIcon = getIcon('circle');
const XIcon = getIcon('x');
const AwardIcon = getIcon('award');

// Constants for the game
const EMPTY = null;
const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Winning combinations (rows, columns, diagonals)
const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const MainFeature = ({ gameMode, difficultyLevel, onReturnToMenu }) => {
  // Game state
  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_X);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'draw'
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draw: 0 });
  const [lastMove, setLastMove] = useState(null);

  // Handle player's move
  const handleCellClick = (index) => {
    // Ignore if cell is filled or game is over
    if (board[index] !== EMPTY || gameStatus !== 'playing') return;
    
    // If it's AI's turn and human tried to move, ignore
    if (gameMode === 'ai' && currentPlayer === PLAYER_O) return;
    
    makeMove(index);
  };

  // Make a move
  const makeMove = (index) => {
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    setLastMove(index);
    
    // Check for winner or draw
    const result = checkGameStatus(newBoard, currentPlayer);
    if (result.status === 'won') {
      setGameStatus('won');
      setWinner(currentPlayer);
      setWinningCells(result.winningCells);
      setScores(prevScores => ({
        ...prevScores,
        [currentPlayer]: prevScores[currentPlayer] + 1
      }));
      toast.success(`Player ${currentPlayer} wins!`);
    } else if (result.status === 'draw') {
      setGameStatus('draw');
      setScores(prevScores => ({
        ...prevScores,
        draw: prevScores.draw + 1
      }));
      toast.info("It's a draw!");
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X);
    }
  };

  // Check game status after each move
  const checkGameStatus = (board, player) => {
    // Check for winner
    for (const combo of winningCombinations) {
      if (
        board[combo[0]] === player &&
        board[combo[1]] === player &&
        board[combo[2]] === player
      ) {
        return { status: 'won', winningCells: combo };
      }
    }
    
    // Check for draw (all cells filled)
    if (!board.includes(EMPTY)) {
      return { status: 'draw', winningCells: [] };
    }
    
    // Game continues
    return { status: 'playing', winningCells: [] };
  };

  // Reset the game
  const resetGame = () => {
    setBoard(Array(9).fill(EMPTY));
    setCurrentPlayer(PLAYER_X);
    setGameStatus('playing');
    setWinner(null);
    setWinningCells([]);
    setLastMove(null);
  };

  // AI Move Logic
  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === PLAYER_O && gameStatus === 'playing') {
      // Add a small delay to make AI move feel more natural
      const aiTimer = setTimeout(() => {
        const aiMoveIndex = getAIMove(board, difficultyLevel);
        makeMove(aiMoveIndex);
      }, 600);
      
      return () => clearTimeout(aiTimer);
    }
  }, [currentPlayer, gameStatus, gameMode, difficultyLevel]);

  // AI Move calculation
  const getAIMove = (currentBoard, difficulty) => {
    // Available moves (empty cells)
    const availableMoves = currentBoard.map((cell, index) => 
      cell === EMPTY ? index : null).filter(index => index !== null);
    
    // If no moves available, return -1
    if (availableMoves.length === 0) return -1;
    
    // Easy difficulty: random move
    if (difficulty === 'easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Medium difficulty: 50% optimal, 50% random
    if (difficulty === 'medium') {
      if (Math.random() < 0.5) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
    }
    
    // For medium (50% of the time) and hard difficulty:
    // 1. If AI can win in the next move, make that move
    for (const index of availableMoves) {
      const boardCopy = [...currentBoard];
      boardCopy[index] = PLAYER_O;
      const result = checkGameStatus(boardCopy, PLAYER_O);
      if (result.status === 'won') {
        return index;
      }
    }
    
    // 2. If player can win in the next move, block that move
    for (const index of availableMoves) {
      const boardCopy = [...currentBoard];
      boardCopy[index] = PLAYER_X;
      const result = checkGameStatus(boardCopy, PLAYER_X);
      if (result.status === 'won') {
        return index;
      }
    }
    
    // 3. Try to take the center
    if (availableMoves.includes(4)) {
      return 4;
    }
    
    // 4. Try to take the corners
    const corners = [0, 2, 6, 8].filter(corner => availableMoves.includes(corner));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
    
    // 5. Take any available edge
    const edges = [1, 3, 5, 7].filter(edge => availableMoves.includes(edge));
    if (edges.length > 0) {
      return edges[Math.floor(Math.random() * edges.length)];
    }
    
    // Fallback: random move (shouldn't get here if all cases are covered)
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  // Cell render with animation
  const renderCell = (index) => {
    const isWinningCell = winningCells.includes(index);
    const isLastMove = lastMove === index;
    
    return (
      <motion.button
        key={index}
        className={`aspect-square rounded-lg flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold
          ${board[index] === PLAYER_X ? 'text-primary' : 'text-secondary'}
          ${isWinningCell ? 'bg-surface-100 dark:bg-surface-800 animate-victory' : 'bg-white dark:bg-surface-900'}
          ${isLastMove && !isWinningCell ? 'animate-pop' : ''}
          border-2 border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 
          transition-all shadow-neu-light dark:shadow-neu-dark hover:shadow-none`}
        onClick={() => handleCellClick(index)}
        whileTap={{ scale: 0.97 }}
        aria-label={`Board cell ${index}, ${board[index] || 'empty'}`}
      >
        <AnimatePresence mode="wait">
          {board[index] === PLAYER_X && (
            <motion.div
              key="x"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-2/3 h-2/3 flex items-center justify-center"
            >
              <XIcon className="w-full h-full" />
            </motion.div>
          )}
          {board[index] === PLAYER_O && (
            <motion.div
              key="o"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-2/3 h-2/3 flex items-center justify-center"
            >
              <CircleIcon className="w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  };

  // Game status display
  const renderGameStatus = () => {
    if (gameStatus === 'won') {
      return (
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 text-xl font-bold">
            <TrophyIcon className="h-6 w-6 text-yellow-500" />
            <span className={winner === PLAYER_X ? 'text-primary' : 'text-secondary'}>
              {winner === PLAYER_X ? 'X' : 'O'} Wins!
            </span>
          </div>
        </motion.div>
      );
    } else if (gameStatus === 'draw') {
      return (
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 text-xl font-bold text-surface-600 dark:text-surface-400">
            <AwardIcon className="h-6 w-6" />
            <span>It's a Draw!</span>
          </div>
        </motion.div>
      );
    } else {
      return (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3">
            <div className={`font-bold text-lg ${currentPlayer === PLAYER_X ? 'text-primary' : 'text-surface-500 dark:text-surface-400'}`}>
              Player X
            </div>
            <div className="relative w-16 h-8 bg-surface-200 dark:bg-surface-700 rounded-full flex items-center p-1">
              <motion.div 
                className={`absolute w-6 h-6 rounded-full ${currentPlayer === PLAYER_X ? 'bg-primary' : 'bg-secondary'}`}
                animate={{ x: currentPlayer === PLAYER_X ? 0 : 32 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </div>
            <div className={`font-bold text-lg ${currentPlayer === PLAYER_O ? 'text-secondary' : 'text-surface-500 dark:text-surface-400'}`}>
              Player O
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Game Info Section */}
      <motion.div 
        className="mb-4 card mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {gameMode === 'ai' ? 'Playing vs AI' : 'Two Player Game'}
          </h2>
          
          {gameMode === 'ai' && (
            <div className="px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-sm font-medium capitalize">
              {difficultyLevel}
            </div>
          )}
        </div>
        
        {/* Score display */}
        <div className="flex justify-between mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{scores.X}</div>
            <div className="text-xs uppercase text-surface-500">X Wins</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-surface-600 dark:text-surface-400">{scores.draw}</div>
            <div className="text-xs uppercase text-surface-500">Draws</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{scores.O}</div>
            <div className="text-xs uppercase text-surface-500">O Wins</div>
          </div>
        </div>
        
        {renderGameStatus()}
      </motion.div>
      
      {/* Game Board */}
      <motion.div 
        className="mb-8 grid grid-cols-3 gap-3 sm:gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {board.map((cell, index) => renderCell(index))}
      </motion.div>
      
      {/* Game Controls */}
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.button
          onClick={resetGame}
          className="btn-outline flex items-center justify-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCwIcon className="h-4 w-4" />
          <span>New Game</span>
        </motion.button>
        
        <motion.button
          onClick={onReturnToMenu}
          className="btn-outline flex items-center justify-center gap-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <HomeIcon className="h-4 w-4" />
          <span>Main Menu</span>
        </motion.button>
        
        {gameStatus !== 'playing' && (
          <motion.button
            onClick={resetGame}
            className="btn-primary flex items-center justify-center gap-2"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span>Play Again</span>
            <ArrowRightIcon className="h-4 w-4" />
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default MainFeature;