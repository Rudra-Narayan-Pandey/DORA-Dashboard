import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine } from 'react-icons/ri';
import { classNames } from '../../utils/helpers';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className
}) => {
  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050816]/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={classNames(
              "relative w-full max-w-lg overflow-hidden rounded-xl border border-dora-border bg-slate-950/90 shadow-2xl backdrop-blur-glass z-10",
              className
            )}
          >
            {/* Holographic Glowing Header Border */}
            <div className="h-0.5 w-full bg-gradient-to-r from-dora-cyan via-dora-indigo to-dora-violet" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dora-border px-5 py-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-dora-text font-mono text-glow-cyan">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-dora-text-secondary hover:bg-slate-800 hover:text-dora-cyan transition-colors focus:outline-none"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
