import React from 'react';

export const AnimatedGrid = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
      {/* 3D Grid container */}
      <div 
        className="absolute bottom-0 left-[-50%] right-[-50%] h-[60%] origin-center"
        style={{
          perspective: '450px',
          perspectiveOrigin: '50% 0%',
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            transform: 'rotateX(75deg)',
            backgroundImage: `
              linear-gradient(90deg, rgba(0, 242, 254, 0.1) 1px, transparent 1px),
              linear-gradient(0deg, rgba(0, 242, 254, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: 'center top',
            animation: 'grid-scroll 18s linear infinite',
            maskImage: 'linear-gradient(to bottom, transparent, black 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 70%)',
          }}
        />
      </div>
      
      {/* Add grid-scroll keyframe style dynamically */}
      <style>{`
        @keyframes grid-scroll {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 1080px;
          }
        }
      `}</style>
    </div>
  );
};
export default AnimatedGrid;
