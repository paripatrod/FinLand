import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

export default function AnimatedBackground() {
  const { theme } = useTheme();

  const variants = {
    default: {
      background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
    },
    cyberpunk: {
      background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
    },
    luxury: {
      background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
    },
    zen: {
      background: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)',
    },
  };

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={theme}
        variants={variants}
        transition={{ duration: 1 }}
      />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
          backgroundColor: theme === 'cyberpunk' ? '#00ff9d' : theme === 'luxury' ? '#fbbf24' : '#10b981',
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.05, 1],
          backgroundColor: theme === 'cyberpunk' ? '#d946ef' : theme === 'luxury' ? '#d97706' : '#059669',
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}
