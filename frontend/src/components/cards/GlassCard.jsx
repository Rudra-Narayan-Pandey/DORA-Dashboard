import React, { useRef, useState } from 'react';

export const GlassCard = ({ children, className = '', glow = false, delay = '0.1s' }) => {
  const cardRef = useRef(null);
  const [bgStyle, setBgStyle] = useState({
    background: 'rgba(255, 255, 255, 0.03)',
  });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBgStyle({
      background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 255, 255, 0.06), transparent 40%)`,
    });
  };

  const handleMouseLeave = () => {
    setBgStyle({
      background: 'rgba(255, 255, 255, 0.03)',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...bgStyle, animationDelay: delay }}
      className={`glass-panel p-glass-padding rounded-xl transition-all duration-300 reveal-up ${
        glow ? 'glow-cyan' : 'hover:shadow-[0_0_15px_rgba(0,219,231,0.15)]'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
