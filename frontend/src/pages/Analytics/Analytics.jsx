import React, { useContext } from 'react';
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
import { DashboardContext } from '../../context/DashboardContext';
import { FilterContext } from '../../context/FilterContext';
import { exportReportData } from '../../services/reportService';
import { showSuccessToast } from '../../components/feedback/ToastMessage';

export const Analytics = () => {
  const { metrics, trends } = useContext(DashboardContext);
  const { filters, updateFilters } = useContext(FilterContext);

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

  // Convert decimal hours float (e.g. 1.5) into Xh Ym, or seconds if sub-minute
  const formatLeadTime = (hoursStr) => {
    const hours = parseFloat(hoursStr);
    if (isNaN(hours)) return hoursStr || '0h 00m';
    if (hours === 0) return '0m';
    
    const totalSeconds = Math.round(hours * 3600);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
  };

  // Get dynamic efficiency from lead time rating
  const getEfficiency = (rating, value) => {
    if (!value || parseFloat(value) === 0) return 0;
    if (rating === 'Elite') return 95;
    if (rating === 'High') return 88;
    if (rating === 'Medium') return 72;
    return 48;
  };

  const hasDeployments = metrics?.totalSuccessfulDeployments > 0;
  const efficiency = metrics ? getEfficiency(metrics.leadTime?.rating || 'Low', metrics.leadTime?.value) : 0;
  const cfrNum = metrics ? parseFloat(metrics.changeFailureRate?.value || 0) : 0;
  const stabilityScore = hasDeployments ? (100 - cfrNum).toFixed(0) : '--';
  const dfVal = metrics?.deploymentFrequency?.value || 0;

  // Dynamic durations based on fractions of total cycle time
  const totalMins = metrics ? parseFloat(metrics.leadTime.value) * 60 : 0;
  const devDuration = totalMins > 0 ? `${Math.round(totalMins * 0.5)}m` : '--';
  const buildDuration = totalMins > 0 ? `${Math.round(totalMins * 0.1)}m` : '--';
  const testDuration = totalMins > 0 ? `${Math.round(totalMins * 0.3)}m` : '--';
  const deployDuration = totalMins > 0 ? `${Math.round(totalMins * 0.1)}m` : '--';

  const chartData = trends || [];

  const handleExport = () => {
    exportReportData({ metrics, trends, filters }, 'json');
    showSuccessToast('Analytics telemetry exported.');
  };

  return (
    <PageContainer>
      {/* Hero Section: Lead Time Velocity */}
      <section id="analytics-trend" className="mb-gutter reveal-up" style={{ animationDelay: '0.1s' }}>
        <GlassCard className="rounded-xl overflow-hidden relative p-glass-padding">
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
              <h3 className="font-display-lg text-headline-lg text-primary-fixed-dim">Lead Time Velocity</h3>
              <p className="font-body-md text-on-surface-variant">Time-to-market trajectory across the primary cluster</p>
            </div>
            
            <div className="flex gap-2">
              <span className="bg-primary-container/10 text-primary-fixed-dim px-3 py-1 rounded-full text-xs font-label-mono flex items-center gap-2 select-none">
                <span className="w-2 h-2 bg-primary-fixed-dim rounded-full pulse-dot"></span>
                REAL-TIME FEED
              </span>
              <select 
                value={filters.dateRange} 
                onChange={(e) => updateFilters({ dateRange: e.target.value })}
                className="bg-surface-container-highest/30 border-white/10 rounded-lg text-xs font-label-mono px-3 py-1 outline-none text-on-surface cursor-pointer focus:ring-1 focus:ring-primary-container"
              >
                <option value="7d" className="bg-surface">LAST 7 DAYS</option>
                <option value="30d" className="bg-surface">LAST 30 DAYS</option>
                <option value="90d" className="bg-surface">LAST 90 DAYS</option>
              </select>
            </div>
          </div>

          {/* Recharts Area Chart styled EXACTLY like the SVG chart in code (2).html */}
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00dbe7" stopOpacity={0.4}></stop>
                    <stop offset="100%" stopColor="#00dbe7" stopOpacity={0}></stop>
                  </linearGradient>
                </defs>
                <XAxis dataKey={trends && trends.length > 0 && trends[0].month ? "month" : "day"} hide />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="leadTime"
                  stroke="#00dbe7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                  className="recharts-glow-path"
                  dot={{ r: 4, stroke: '#00dbe7', strokeWidth: 1.5, fill: '#050816' }}
                  activeDot={{ r: 6, stroke: '#00dbe7', strokeWidth: 1.5, fill: '#00dbe7' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      {/* Bento Grid Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-panel-gap mb-gutter">
        {/* Median Lead Time */}
        <GlassCard delay="0.2s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary-fixed-dim">schedule</span>
            <span className="text-[10px] font-label-mono text-primary-fixed-dim uppercase tracking-tighter">Stability Score: {stabilityScore}%</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Median Lead Time</div>
          <div className="font-data-metric text-display-lg text-primary-fixed glow-text-cyan">{hasDeployments ? formatLeadTime(metrics?.leadTime?.value || 0) : '--'}</div>
          {hasDeployments ? (
            <div className="mt-4 text-xs text-on-surface-variant flex items-center gap-1">
              <span className={`material-symbols-outlined text-sm ${metrics?.leadTime?.trendDirection === 'down' ? 'text-green-400' : 'text-error'}`}>{metrics?.leadTime?.trendDirection === 'down' ? 'trending_down' : 'trending_up'}</span>
              <span className={`font-bold ${metrics?.leadTime?.trendDirection === 'down' ? 'text-green-400' : 'text-error'}`}>{Math.abs(metrics?.leadTime?.trend || 0)}%</span> vs previous window
            </div>
          ) : (
            <div className="mt-4 text-xs text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-on-surface-variant/60">trending_flat</span>
              NO DATA TO COMPARE
            </div>
          )}
        </GlassCard>

        {/* Process Efficiency */}
        <GlassCard delay="0.3s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary">bolt</span>
            <span className="text-[10px] font-label-mono text-secondary uppercase tracking-tighter">Cluster Health</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Process Efficiency</div>
          <div className="font-data-metric text-display-lg text-secondary">{hasDeployments ? `${efficiency}%` : '--'}</div>
          <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full shadow-[0_0_10px_rgba(192,193,255,0.5)]" style={{ width: `${hasDeployments ? efficiency : 0}%` }}></div>
          </div>
        </GlassCard>

        {/* Deployment Velocity */}
        <GlassCard delay="0.4s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary-fixed-dim">rocket_launch</span>
            <span className="text-[10px] font-label-mono text-primary-fixed-dim uppercase tracking-tighter">{hasDeployments ? `${metrics?.deploymentFrequency?.rating || '--'} Performer` : 'UNRATED'}</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Deployment Velocity</div>
          <div className="font-data-metric text-display-lg text-on-surface">{dfVal}<span className="text-2xl text-on-surface-variant">/day</span></div>
          <div className="mt-4 text-xs text-on-surface-variant flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-primary-fixed-dim text-sm">auto_graph</span>
            {hasDeployments ? `${metrics?.deploymentFrequency?.rating} tier performance` : 'No successful deploys in window'}
          </div>
        </GlassCard>
      </section>

      {/* Pipeline Stage Breakdown Table */}
      <section id="analytics-stages" className="glass-panel rounded-xl overflow-hidden reveal-up" style={{ animationDelay: '0.5s' }}>
        <div className="px-glass-padding py-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Pipeline Stage Breakdown</h3>
          <button
            type="button"
            onClick={handleExport}
            className="font-label-mono text-xs text-primary-fixed-dim flex items-center gap-2 hover:underline focus:outline-none"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            EXPORT REPORT
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-label-mono border-collapse text-sm">
            <thead className="bg-white/5 text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-glass-padding py-4">Phase</th>
                <th className="px-glass-padding py-4">Status</th>
                <th className="px-glass-padding py-4 text-right">Avg. Duration</th>
                <th className="px-glass-padding py-4">Health Index</th>
                <th className="px-glass-padding py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-on-surface">
              {[
                {
                  key: 'development',
                  name: 'Development',
                  icon: 'code',
                  iconClass: 'text-primary-fixed-dim',
                  colorClass: 'bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]'
                },
                {
                  key: 'build',
                  name: 'Build',
                  icon: 'memory',
                  iconClass: 'text-secondary',
                  colorClass: 'bg-secondary shadow-[0_0_5px_rgba(192,193,255,0.5)]'
                },
                {
                  key: 'test',
                  name: 'Test',
                  icon: 'science',
                  iconClass: 'text-tertiary-fixed-dim',
                  colorClass: 'bg-orange-400 shadow-[0_0_5px_#f59e0b]'
                },
                {
                  key: 'deploy',
                  name: 'Deploy',
                  icon: 'rocket',
                  iconClass: 'text-on-primary-container',
                  colorClass: 'bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]'
                }
              ].map((stage) => {
                const stageData = metrics?.stages?.[stage.key] || {
                  duration: stage.key === 'development' ? devDuration : stage.key === 'build' ? buildDuration : stage.key === 'test' ? testDuration : deployDuration,
                  status: totalMins > 0 ? 'ACTIVE' : 'NO DATA',
                  healthIndex: totalMins > 0 ? 2 : 0
                };

                const isStable = ['STABLE', 'OPTIMIZED', 'READY'].includes(stageData.status);

                return (
                  <tr key={stage.key} className="scanline-row transition-colors">
                    <td className="px-glass-padding py-5">
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${stage.iconClass}`}>{stage.icon}</span>
                        <span className="text-on-surface font-medium">{stage.name}</span>
                      </div>
                    </td>
                    <td className="px-glass-padding py-5">
                      <span className={`flex items-center gap-2 text-xs font-semibold ${isStable ? 'text-green-400' : 'text-orange-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isStable ? 'bg-green-400' : 'bg-orange-400 pulse-dot'}`}></span>
                        {stageData.status}
                      </span>
                    </td>
                    <td className="px-glass-padding py-5 text-right font-data-metric text-primary-fixed">{stageData.duration}</td>
                    <td className="px-glass-padding py-5">
                      <div className="flex gap-1">
                        {Array.from({ length: 4 }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`w-4 h-1 ${idx < stageData.healthIndex ? stage.colorClass : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-glass-padding py-5 text-right">
                      <button
                        type="button"
                        onClick={handleExport}
                        aria-label={`Export ${stage.name} stage telemetry`}
                        className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
                      >
                        download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  );
};
export default Analytics;
