import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-center p-6 bg-[#050816] relative z-10 font-mono select-none">
      <div className="aurora-bg"></div>
      
      <div className="glass-panel p-8 md:p-12 border-error/30 bg-error/5 rounded-2xl shadow-xl max-w-lg flex flex-col items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-error opacity-40 animate-bounce" />

        <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center border border-error/20">
          <span className="material-symbols-outlined text-3xl animate-pulse">report_problem</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-error glow-text-cyan tracking-wider uppercase">
            Sector 404
          </h1>
          <p className="text-[10px] text-error/80 font-bold uppercase tracking-widest mt-1">
            GRID COORDINATES INACTIVE
          </p>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs">
          The telemetry link command pointed to an inactive sector. Grid sector address mapping failed signature verification checks.
        </p>

        <button
          onClick={() => navigate('/')}
          className="py-3 px-8 bg-gradient-to-r from-error to-secondary-container text-on-primary font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs font-mono uppercase tracking-widest"
        >
          Return to Core Grid
        </button>
      </div>
    </div>
  );
};
export default NotFound;
