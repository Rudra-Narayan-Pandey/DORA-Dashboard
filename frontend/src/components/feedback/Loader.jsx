import React from 'react';
import { motion } from 'framer-motion';

export const Loader = ({ size = 'md', text = 'Synchronizing Grid...' }) => {
  const sizeMap = {
    sm: 'w-8 h-8 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className={`rounded-full border-t-dora-cyan border-r-transparent border-b-dora-indigo border-l-transparent shadow-neon-cyan/20 ${sizeMap[size]}`}
        />
        
        {/* Inner Counter-Rotating Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className={`absolute rounded-full border-t-transparent border-r-dora-green border-b-transparent border-l-dora-violet/50 ${
            size === 'sm' ? 'w-5 h-5 border' : size === 'lg' ? 'w-16 h-16 border-2' : 'w-10 h-10 border-2'
          }`}
        />
        
        {/* Glowing Center Dot */}
        <div className="absolute w-2 h-2 rounded-full bg-dora-cyan shadow-neon-cyan animate-ping" />
      </div>
      
      {text && (
        <span className="text-xs font-mono uppercase tracking-widest text-dora-cyan text-glow-cyan animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};
export default Loader;
