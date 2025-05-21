import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const ArrowLeftIcon = getIcon('arrow-left');
const AlertTriangleIcon = getIcon('alert-triangle');

const NotFound = ({ darkMode }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 5000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div 
        className="max-w-md w-full card neu-shadow text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-center">
          <AlertTriangleIcon className="h-16 w-16 text-secondary" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-medium mb-6">Page Not Found</h2>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
          You'll be redirected to the home page in a few seconds.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center btn-primary justify-center gap-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Return to Home</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;