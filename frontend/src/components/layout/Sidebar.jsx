import React from 'react';
import { NavLink } from 'react-router-dom';
import { formatDisplayName } from '../../utils/displayNames';

export const Sidebar = ({ onLaunchModalTrigger, profile, initials = 'AZ', role = 'Server-side PAT' }) => {
  const displayName = formatDisplayName(profile?.displayName, 'Gargi and Rudra');

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest/30 backdrop-blur-3xl border-r border-white/10 shadow-[0_0_20px_rgba(0,219,231,0.1)] flex flex-col py-unit px-unit z-50 select-none text-on-surface font-mono">
      {/* Brand Header */}
      <div className="mb-12 px-4 py-6">
        <h1 className="font-display-lg text-display-lg font-bold text-primary-fixed tracking-tighter">DORA</h1>
        <p className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest opacity-60">Release Health</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <NavLink 
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'text-primary bg-primary-container/20 border-r-2 border-primary-fixed glow-cyan' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-body-md text-body-md">Dashboard</span>
        </NavLink>

        <NavLink 
          to="/deployments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'text-primary bg-primary-container/20 border-r-2 border-primary-fixed glow-cyan' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined">rocket_launch</span>
          <span className="font-body-md text-body-md">Deployments</span>
        </NavLink>

        <NavLink 
          to="/analytics"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'text-primary bg-primary-container/20 border-r-2 border-primary-fixed glow-cyan' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined">timer</span>
          <span className="font-body-md text-body-md">Lead Time</span>
        </NavLink>

        <NavLink 
          to="/incidents"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'text-primary bg-primary-container/20 border-r-2 border-primary-fixed glow-cyan' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined">build_circle</span>
          <span className="font-body-md text-body-md">MTTR</span>
        </NavLink>

        <NavLink 
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'text-primary bg-primary-container/20 border-r-2 border-primary-fixed glow-cyan' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
            }`
          }
        >
          <span className="material-symbols-outlined">report_problem</span>
          <span className="font-body-md text-body-md">Reports</span>
        </NavLink>
      </nav>

      {/* Footer Profile & Trigger Action */}
      <div className="mt-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-white/5 border border-white/5">
          <div className="w-10 h-10 rounded-full border border-primary-fixed-dim/30 bg-primary-container/20 flex items-center justify-center text-xs font-bold text-primary-fixed">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
            <p className="text-xs text-on-surface-variant truncate">{role}</p>
          </div>
        </div>
        
        <button 
          onClick={onLaunchModalTrigger}
          className="w-full py-3 bg-gradient-to-r from-primary-fixed-dim to-secondary-container text-on-primary font-bold rounded-lg shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 active:scale-95"
        >
          Queue Pipeline
        </button>

        <NavLink 
          to="/settings"
          className="flex items-center gap-3 px-4 py-2 mt-4 text-on-surface-variant hover:text-on-surface text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-sm">settings</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
export default Sidebar;
