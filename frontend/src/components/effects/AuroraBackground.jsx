import React from 'react';

export const AuroraBackground = () => {
  return (
    <>
      {/* Background Aurora Blurs */}
      <div className="fixed inset-0 z-[-2] pointer-events-none overflow-hidden bg-[#050816]">
        <div className="aurora-blur absolute -top-40 -left-40 w-96 h-96 bg-primary-container rounded-full opacity-40"></div>
        <div className="aurora-blur absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-secondary-container rounded-full opacity-40"></div>
      </div>
      {/* Radial Gradient Backdrops */}
      <div className="aurora-bg"></div>
    </>
  );
};
export default AuroraBackground;
