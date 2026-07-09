import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FilterContext } from '../../context/FilterContext';
import api from '../../services/api';
import { formatDisplayName } from '../../utils/displayNames';

export const Navbar = ({ profile, initials = 'AZ', role = 'Server-side PAT' }) => {
  const location = useLocation();
  const { filters, updateFilters } = useContext(FilterContext);
  const [connection, setConnection] = useState({ status: 'checking', label: 'Checking link' });

  const checkConnection = useCallback(async () => {
    try {
      const response = await api.get('/health', {
        timeout: 5000,
        validateStatus: (statusCode) => statusCode < 600
      });
      const data = response.data;
      setConnection({
        status: data.azureConnected ? 'connected' : 'degraded',
        label: data.azureConnected ? `${data.organization}/${data.project}` : data.diagnostics || 'Azure degraded'
      });
    } catch (error) {
      setConnection({ status: 'offline', label: error?.message || 'Backend offline' });
    }
  }, []);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    window.addEventListener('dora-settings-changed', checkConnection);
    return () => {
      clearInterval(interval);
      window.removeEventListener('dora-settings-changed', checkConnection);
    };
  }, [checkConnection]);

  const getPageHeaderDetails = () => {
    switch (location.pathname) {
      case '/deployments':
        return { title: 'Deployment Health', links: ['Runs', 'Pipelines'] };
      case '/analytics':
        return { title: 'Lead Time', links: ['Trend', 'Stages'] };
      case '/incidents':
        return { title: 'MTTR & Incidents', links: ['Incidents', 'Bugs'] };
      case '/reports':
        return { title: 'DORA Report', links: ['Scorecard', 'Actions'] };
      case '/settings':
        return { title: 'Settings', links: ['Connection', 'Thresholds'] };
      case '/':
      default:
        return { title: 'DORA Dashboard', links: ['Overview', 'Metrics'] };
    }
  };

  const { title, links } = getPageHeaderDetails();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-background/20 backdrop-blur-xl border-b border-white/5 flex justify-between items-center px-gutter z-40 select-none text-on-surface font-mono">
      {/* Title & Sublinks Left */}
      <div className="flex items-center gap-8">
        <h2 className="font-display-lg text-headline-lg text-primary-fixed-dim uppercase tracking-widest">
          {title}
        </h2>
        <nav className="hidden md:flex gap-6">
          {links.map((lnk, idx) => {
            const handleLinkClick = (name) => {
              const idMap = {
                // Dashboard
                'Overview': 'dashboard-overview',
                'Metrics': 'dashboard-metrics',
                // Deployments
                'Runs': 'deployments-ledger',
                'Pipelines': 'deployments-chart',
                // Analytics
                'Trend': 'analytics-trend',
                'Stages': 'analytics-stages',
                // Incidents
                'Incidents': 'incidents-chart',
                'Bugs': 'incidents-ledger',
                // Reports
                'Scorecard': 'reports-scorecard',
                'Actions': 'reports-recommendations',
                // Settings
                'Connection': 'settings-connection',
                'Thresholds': 'settings-thresholds'
              };
              const target = idMap[name];
              if (target) {
                const element = document.getElementById(target);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            };

            return (
              <button 
                key={idx} 
                type="button"
                onClick={() => handleLinkClick(lnk)}
                className="font-label-mono text-label-mono text-on-surface-variant hover:text-primary-fixed transition-colors cursor-pointer focus:outline-none"
              >
                {lnk}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right side search & operator detail info */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={checkConnection}
          title={connection.label}
          className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-wider text-on-surface-variant hover:bg-white/10"
        >
          <span className={`h-2 w-2 rounded-full ${
            connection.status === 'connected' ? 'bg-emerald-400' :
            connection.status === 'degraded' ? 'bg-yellow-400 animate-pulse' :
            connection.status === 'checking' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
          }`} />
          <span className={
            connection.status === 'connected' ? 'text-emerald-400' :
            connection.status === 'offline' ? 'text-red-400' : 'text-yellow-400'
          }>
            {connection.status === 'connected' ? 'Azure Live' : connection.status === 'offline' ? 'Offline' : 'Azure Degraded'}
          </span>
        </button>

        {/* Search */}
        <div className="relative group">
          <input 
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search Azure data..."
            className="bg-white/5 border-white/10 rounded-full pl-10 pr-4 py-1 text-sm focus:ring-1 focus:ring-primary-fixed/50 w-64 transition-all duration-300 text-on-surface focus:outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
        </div>

        {/* Notifications and Settings Icons */}
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined">hub</span>
          </button>
        </div>

        {/* Operator Profile details */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-label-mono text-label-mono text-primary-fixed max-w-40 truncate">{formatDisplayName(profile?.displayName, 'Gargi and Rudra')}</p>
            <p className="text-[10px] text-on-surface-variant/60 leading-none max-w-40 truncate">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-primary-fixed/30 bg-primary-container/20 flex items-center justify-center text-xs font-bold text-primary-fixed">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
