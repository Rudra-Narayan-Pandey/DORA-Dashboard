import React, { useState, useContext } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import PageContainer from '../../components/layout/PageContainer';
import GlassCard from '../../components/cards/GlassCard';
import useDeployments from '../../hooks/useDeployments';
import Loader from '../../components/feedback/Loader';
import ErrorState from '../../components/feedback/ErrorState';
import { DashboardContext } from '../../context/DashboardContext';
import dayjs from 'dayjs';
import { formatDisplayName } from '../../utils/displayNames';

export const Deployments = () => {
  const { 
    deployments, 
    pagination, 
    loading, 
    error, 
    page, 
    setPage, 
    refetch 
  } = useDeployments(1, 5);

  const { trends } = useContext(DashboardContext);
  const [activeChart, setActiveChart] = useState('volume'); // volume, speed

  if (loading && page === 1) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[80vh]">
        <Loader size="lg" text="Decompressing deployments grid data..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorState onRetry={refetch} message={error} />
      </PageContainer>
    );
  }

  // Custom tooltips
  const customTooltipStyle = {
    contentStyle: {
      backgroundColor: 'rgba(15, 19, 33, 0.95)',
      backdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: '#dfe1f6',
      fontSize: '11px',
      fontFamily: 'monospace',
    },
    labelStyle: {
      fontWeight: 'bold',
      color: '#00dbe7',
      marginBottom: '4px',
    }
  };

  const chartData = (trends && trends.length > 0)
    ? trends.map(t => ({
        name: t.day || t.month,
        value: t.deployments,
        duration: Math.round(t.leadTime * 3600) // convert hours to seconds for Cycle Times
      }))
    : [];

  return (
    <PageContainer>
      {/* Chart Section */}
      <section className="mb-gutter reveal-up" style={{ animationDelay: '0.1s' }}>
        <GlassCard className="rounded-xl overflow-hidden relative p-glass-padding">
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
              <h3 className="font-display-lg text-headline-lg text-primary-fixed-dim">
                {activeChart === 'volume' ? 'Deployment Volume' : 'Pipeline Cycle Times'}
              </h3>
              <p className="font-body-md text-on-surface-variant">
                {activeChart === 'volume' ? 'Velocity telemetry across all active system nodes' : 'Average build/deploy durations (seconds)'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart('volume')}
                className={`px-3 py-1 rounded text-xs font-label-mono transition-all ${
                  activeChart === 'volume' ? 'bg-primary-container text-on-primary-container' : 'bg-white/5 hover:bg-white/10 text-on-surface-variant'
                }`}
              >
                VOLUME
              </button>
              <button
                onClick={() => setActiveChart('speed')}
                className={`px-3 py-1 rounded text-xs font-label-mono transition-all ${
                  activeChart === 'speed' ? 'bg-primary-container text-on-primary-container' : 'bg-white/5 hover:bg-white/10 text-on-surface-variant'
                }`}
              >
                SPEED
              </button>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="deployGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00dbe7" stopOpacity={0.4}></stop>
                    <stop offset="100%" stopColor="#00dbe7" stopOpacity={0}></stop>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey={activeChart === 'volume' ? 'value' : 'duration'}
                  stroke="#00dbe7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#deployGradient)"
                  className="recharts-glow-path"
                  dot={{ r: 4, stroke: '#00dbe7', strokeWidth: 1.5, fill: '#050816' }}
                  activeDot={{ r: 6, stroke: '#00dbe7', strokeWidth: 1.5, fill: '#00dbe7' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      {/* Main Ledger Table */}
      <section className="glass-panel rounded-xl overflow-hidden reveal-up" style={{ animationDelay: '0.2s' }}>
        <div className="px-glass-padding py-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Recent Azure Pipeline Runs</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-label-mono text-on-surface-variant select-none">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span> SUCCESS
            </div>
            <div className="flex items-center gap-2 text-xs font-label-mono text-on-surface-variant select-none">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span> ACTIVE
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-label-mono text-sm border-collapse">
            <thead className="bg-white/5 text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-glass-padding py-4">Release ID</th>
                <th className="px-glass-padding py-4">Service</th>
                <th className="px-glass-padding py-4">Environment</th>
                <th className="px-glass-padding py-4">Timestamp</th>
                <th className="px-glass-padding py-4">Status</th>
                <th className="px-glass-padding py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-on-surface">
              {deployments.map((dep, idx) => (
                <tr key={dep.id || idx} className="scanline-row transition-colors hover:text-primary-fixed">
                  <td className="px-glass-padding py-5 font-bold text-primary-fixed">{dep.id || `--`}</td>
                  <td className="px-glass-padding py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-primary-container">cloud_queue</span>
                      </div>
                      <span className="font-medium">{dep.pipeline ? formatDisplayName(dep.pipeline, dep.pipeline) : 'Unavailable'}</span>
                    </div>
                  </td>
                  <td className="px-glass-padding py-5">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-label-mono">
                      {dep.environment ? dep.environment.toUpperCase() : 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-glass-padding py-5 text-on-surface-variant text-xs">
                    {dep.timestamp ? dayjs(dep.timestamp).format('YYYY-MM-DD HH:mm:ss') : '--'}
                  </td>
                  <td className="px-glass-padding py-5">
                    <span className={`flex items-center gap-2 font-medium ${
                      dep.status === 'success' ? 'text-primary-fixed' : dep.status === 'failed' ? 'text-error' : 'text-secondary'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        dep.status === 'success' ? 'bg-primary-container' : dep.status === 'failed' ? 'bg-error' : 'bg-secondary-container animate-pulse'
                      }`}></span>
                      {dep.status === 'success' ? 'Success' : dep.status === 'failed' ? 'Failed' : 'Active'}
                    </span>
                  </td>
                  <td className="px-glass-padding py-5 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none">
                      more_vert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paging controls */}
        <div className="p-4 bg-white/5 flex justify-between items-center px-glass-padding border-t border-white/5 font-mono text-xs select-none">
          <span className="text-[10px] text-on-surface-variant/60">
            Page {page} of {pagination.pages || 1} ({pagination.total} records total)
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider text-[10px]"
            >
              Prev
            </button>
            <button 
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border border-white/10 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:pointer-events-none uppercase tracking-wider text-[10px]"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
};
export default Deployments;
