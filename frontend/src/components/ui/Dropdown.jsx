import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { classNames } from '../../utils/helpers';

export const Dropdown = ({
  trigger,
  items = [], // [{ label, onClick, icon }]
  align = 'right', // left, right
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignStyles = {
    left: 'left-0 mt-2',
    right: 'right-0 mt-2'
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={classNames(
              "absolute z-40 w-48 rounded-lg border border-dora-border bg-slate-950/95 p-1 shadow-2xl backdrop-blur-glass focus:outline-none origin-top",
              alignStyles[align],
              className
            )}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={classNames(
                  "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-xs font-mono text-dora-text hover:bg-dora-cyan/10 hover:text-dora-cyan transition-colors"
                )}
              >
                {item.icon && <span className="text-sm">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Dropdown;
