import React, { useContext } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { FilterContext } from '../../context/FilterContext';

export const Navbar = () => {
  const location = useLocation();
  const { filters, updateFilters } = useContext(FilterContext);

  const getPageHeaderDetails = () => {
    switch (location.pathname) {
      case '/deployments':
        return { title: 'Deployment Center', links: ['Ledger', 'Pipelines'] };
      case '/analytics':
        return { title: 'Lead Time Command', links: ['Telemetry', 'Logs', 'Alerts'] };
      case '/incidents':
        return { title: 'MTTR Telemetry', links: ['Incidents', 'Outages'] };
      case '/reports':
        return { title: 'Audit Reports', links: ['Generated', 'Grades'] };
      case '/settings':
        return { title: 'Telemetry Settings', links: ['HUD', 'Thresholds'] };
      case '/':
      default:
        return { title: 'Mission Control', links: ['Overview', 'HUD'] };
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
          {links.map((lnk, idx) => (
            <span 
              key={idx} 
              className="font-label-mono text-label-mono text-on-surface-variant hover:text-primary-fixed transition-colors cursor-pointer"
            >
              {lnk}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side search & operator detail info */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <input 
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search Telemetry..."
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
            <p className="font-label-mono text-label-mono text-primary-fixed">ADM. SYNC-01</p>
            <p className="text-[10px] text-on-surface-variant/60 leading-none">COMMANDER</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-primary-fixed/30 p-0.5 overflow-hidden">
            <img 
              alt="Commander Avatar" 
              className="w-full h-full object-cover rounded-full" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbXEjfPaNXtfrhgoGhd1EHHzyoZu5eNIx8Dqy6HiYM69vS4K4lNpjOCexnJE-SPV-C_4UA0oZSz88nkcKHn2ItIQxO4PjeFUYRsFfubsNueE3e9W2yt_D30rkxca0fhooudqK6T3ZFzCAzXQX2920d_zRrWCG5gOQDiFPoWxCAyFAYHnkHnFJEq6io-OKg9VnnI1qUaL1irJXrkWciz2P8ZtvN3Mt0LS4JrXjvyCj-fAgVGJLqWBb9ng"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
