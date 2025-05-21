import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

const MoonIcon = getIcon('moon');
const SunIcon = getIcon('sun');
const GithubIcon = getIcon('github');

const Home = ({ darkMode, toggleDarkMode }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState(null); // 'ai' or 'human'
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  
  const startGame = (mode) => {
    setGameMode(mode);
    setGameStarted(true);
    
    if (mode === 'ai') {
      toast.success(`Starting game against AI (${difficultyLevel} difficulty)`);
    } else {
      toast.success("Starting a 2-player game. X goes first!");
    }
  };
  
  const returnToMenu = () => {
    setGameStarted(false);
    setGameMode(null);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen">
      {/* Header with theme toggle */}
      <header className="py-4 px-6 flex justify-between items-center border-b border-surface-200 dark:border-surface-800">
        <motion.h1 
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          TicTacGo
        </motion.h1>
        
        <div className="flex items-center gap-4">
          <motion.button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <SunIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <MoonIcon className="h-5 w-5 text-surface-600" />
            )}
          </motion.button>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {!gameStarted ? (
          <motion.div 
            className="max-w-md mx-auto card neu-shadow"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              Welcome to TicTacGo
            </h2>
            
            <motion.div 
              className="space-y-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={item} className="mb-6">
                <h3 className="text-lg font-medium mb-2">Game Mode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => startGame('human')}
                    className="btn-outline py-3 rounded-xl neu-shadow hover:shadow-none active:scale-95 transition-all"
                  >
                    Play with Friend
                  </button>
                  
                  <button 
                    onClick={() => startGame('ai')}
                    className="btn-primary py-3 rounded-xl hover:shadow-md active:scale-95 transition-all"
                  >
                    Play vs AI
                  </button>
                </div>
              </motion.div>
              
              {/* AI Difficulty Selection */}
              <motion.div variants={item} className={gameMode === 'ai' ? "block" : "hidden"}>
                <h3 className="text-lg font-medium mb-2">AI Difficulty</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficultyLevel(level)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all
                        ${difficultyLevel === level
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                        }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={item} className="pt-4">
                <p className="text-sm text-center text-surface-500 dark:text-surface-400">
                  Classic Tic-Tac-Toe with a modern twist!
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <MainFeature 
            gameMode={gameMode} 
            difficultyLevel={difficultyLevel} 
            onReturnToMenu={returnToMenu} 
          />
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-4 border-t border-surface-200 dark:border-surface-800 text-center text-sm text-surface-500 dark:text-surface-400">
        <p>&copy; {new Date().getFullYear()} TicTacGo. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;