import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

export const Footer = () => {
  const [status, setStatus] = useState('Checking...');
  const [statusColor, setStatusColor] = useState('text-yellow-400');
  const [latency, setLatency] = useState('--');
  const [node, setNode] = useState('--');

  const checkHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await api.get('/health', {
        timeout: 5000,
        validateStatus: (statusCode) => statusCode < 600
      });
      const elapsed = Math.round(performance.now() - start);
      const data = res.data;

      const isConnected = data.checks?.azureConnectivity === 'UP';
      if (isConnected) {
        setStatus('Operational');
        setStatusColor('text-primary-fixed');
      } else {
        setStatus('Degraded');
        setStatusColor('text-yellow-400');
      }
      setLatency(`${data.latencyMs || elapsed}ms`);
      setNode(data.organization ? `${data.organization}/${data.project || '--'}` : '--');
    } catch {
      setStatus('Offline');
      setStatusColor('text-red-400');
      setLatency('--');
      setNode('--');
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Re-check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    // Also re-check when settings change (e.g. API URL changed)
    const handleSettingsChange = () => { checkHealth(); };
    window.addEventListener('dora-settings-changed', handleSettingsChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('dora-settings-changed', handleSettingsChange);
    };
  }, [checkHealth]);

  return (
    <footer className="fixed bottom-0 left-64 right-0 bg-surface-container-lowest/90 backdrop-blur-md border-t border-white/5 flex justify-between items-center gap-4 px-gutter py-2 z-40 select-none text-on-surface font-mono overflow-hidden">
      <p className="font-label-mono text-label-mono text-on-surface-variant/40 tracking-tighter">
        DORA Metrics & Release Health
      </p>
      <div className="flex gap-6 min-w-0 overflow-hidden">
        <span className="font-label-mono text-label-mono text-primary-fixed-dim/60 truncate">
          System Status: <span className={statusColor}>{status}</span>
        </span>
        <span className="font-label-mono text-label-mono text-primary-fixed-dim/60">
          API Latency: <span className="text-primary-fixed">{latency}</span>
        </span>
        <span className="font-label-mono text-label-mono text-primary-fixed-dim/60">
          Node: <span className="text-primary-fixed">{node}</span>
        </span>
      </div>
    </footer>
  );
};
export default Footer;
