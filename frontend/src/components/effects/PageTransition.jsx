import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: [0.25, 1, 0.5, 1] // Custom ease-out cubic bezier
    }
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};
export default PageTransition;
