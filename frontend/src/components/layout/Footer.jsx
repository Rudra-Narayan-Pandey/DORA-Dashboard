import React from 'react';

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 right-0 w-[calc(100%-16rem)] bg-surface-container-lowest/80 backdrop-blur-md border-t border-white/5 flex justify-between items-center px-gutter py-2 z-40 select-none text-on-surface font-mono">
      <p className="font-label-mono text-label-mono text-on-surface-variant/40 tracking-tighter">
        AetherOS Telemetry System © 2026
      </p>
      <div className="flex gap-6">
        <span className="font-label-mono text-label-mono text-primary-fixed-dim/60">
          System Status: <span className="text-primary-fixed">Operational</span>
        </span>
        <span className="font-label-mono text-label-mono text-primary-fixed-dim/60">
          API Latency: <span className="text-primary-fixed">24ms</span>
        </span>
        <span className="font-label-mono text-label-mono text-primary-fixed-dim/60">
          Node: <span className="text-primary-fixed">Orbital-1</span>
        </span>
      </div>
    </footer>
  );
};
export default Footer;
