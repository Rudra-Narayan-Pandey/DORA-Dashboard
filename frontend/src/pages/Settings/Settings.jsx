import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import useTheme from '../../hooks/useTheme';
import { showSuccessToast } from '../../components/feedback/ToastMessage';

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  // Config States
  const [apiUrl, setApiUrl] = useState('https://telemetry.aetheros-control.io/api/v1');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(true);
  
  // DORA Thresholds
  const [dfLimit, setDfLimit] = useState('24.5');
  const [ltLimit, setLtLimit] = useState('1.2');
  const [cfrLimit, setCfrLimit] = useState('0.8');
  const [mttrLimit, setMttrLimit] = useState('18');

  const handleSave = (e) => {
    e.preventDefault();
    showSuccessToast("Grid OS parameters successfully written to configuration memory.");
  };

  return (
    <PageContainer>
      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs text-on-surface reveal-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Top threshold cards & General HUD settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* General Configs */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-fixed-dim border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings</span>
              <span>General OS Configs</span>
            </h3>

            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold uppercase tracking-wider">HUD Theme Grid Mode</span>
                  <span className="text-[10px] text-on-surface-variant/60">Switch dark OS background and console styles</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5 font-bold uppercase tracking-wider text-[10px] text-primary-fixed-dim"
                >
                  {theme === 'dark' ? 'DARK MODE' : 'LIGHT MODE'}
                </button>
              </div>

              {/* Auto Refresh */}
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold uppercase tracking-wider">Auto Telemetry Refresh</span>
                  <span className="text-[10px] text-on-surface-variant/60">Poll active nodes every 5 minutes</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-3 py-1.5 border rounded-lg font-bold uppercase tracking-wider text-[10px] ${
                    autoRefresh ? 'border-primary-fixed text-primary-fixed bg-primary-container/10' : 'border-white/10 hover:bg-white/5 text-on-surface-variant'
                  }`}
                >
                  {autoRefresh ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* API Endpoint Input */}
              <div className="space-y-2">
                <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">API Telemetry Link</label>
                <input 
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-xs focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* DORA Targets limits */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">speed</span>
              <span>DORA Target Thresholds</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Deploy Freq (/day)</label>
                <input 
                  type="text"
                  value={dfLimit}
                  onChange={(e) => setDfLimit(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Lead Time (hrs)</label>
                <input 
                  type="text"
                  value={ltLimit}
                  onChange={(e) => setLtLimit(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Failure Rate (%)</label>
                <input 
                  type="text"
                  value={cfrLimit}
                  onChange={(e) => setCfrLimit(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-xs focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Restore MTTR (mins)</label>
                <input 
                  type="text"
                  value={mttrLimit}
                  onChange={(e) => setMttrLimit(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-xs focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Integration channels */}
        <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant border-b border-white/10 pb-3">
            Integration Webhooks
          </h3>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold uppercase tracking-wider">Slack Alarm integrations</span>
              <span className="text-[10px] text-on-surface-variant/60">Broadcast active outages directly to slack</span>
            </div>
            <button
              type="button"
              onClick={() => setSlackAlerts(!slackAlerts)}
              className={`px-3 py-1.5 border rounded-lg font-bold uppercase tracking-wider text-[10px] ${
                slackAlerts ? 'border-primary-fixed text-primary-fixed bg-primary-container/10' : 'border-white/10 hover:bg-white/5 text-on-surface-variant'
              }`}
            >
              {slackAlerts ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="py-3 px-8 bg-gradient-to-r from-primary-fixed-dim to-secondary-container text-on-primary font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs font-mono uppercase tracking-widest"
          >
            Save configurations
          </button>
        </div>
      </form>
    </PageContainer>
  );
};
export default Settings;
