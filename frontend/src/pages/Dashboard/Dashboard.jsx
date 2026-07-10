import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import PageContainer from '../../components/layout/PageContainer';
import GlassCard from '../../components/cards/GlassCard';
import { DashboardContext } from '../../context/DashboardContext';
import { FilterContext } from '../../context/FilterContext';
import { showSuccessToast } from '../../components/feedback/ToastMessage';
import { exportReportData } from '../../services/reportService';
import Loader from '../../components/feedback/Loader';
import ErrorState from '../../components/feedback/ErrorState';
import { gradeDeploymentFrequency, gradeLeadTime, gradeChangeFailureRate, gradeMTTR } from '../../utils/doraGrading';
import { formatDisplayName } from '../../utils/displayNames';

// Counter component for HUD numbers
const AnimatedCounter = ({ targetValue, decimals = 1 }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = parseFloat(targetValue);
    if (isNaN(end)) {
      setValue(targetValue);
      return;
    }
    const duration = 1200;
    const startTime = performance.now();

    const run = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * end;
      setValue(current);
      if (progress < 1) {
        requestAnimationFrame(run);
      } else {
        setValue(end);
      }
    };
    requestAnimationFrame(run);
  }, [targetValue]);

  return <span>{typeof value === 'number' ? value.toFixed(decimals) : value}</span>;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const { metrics, trends, deploymentsData, refreshData, loading, error } = useContext(DashboardContext);
  const { filters, updateFilters } = useContext(FilterContext);

  // Local clock ticker state
  const [localTime, setLocalTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));

  useEffect(() => {
    const clock = setInterval(() => {
      setLocalTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  if (loading && !metrics) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[80vh]">
        <Loader size="lg" text="Loading Azure DevOps metrics..." />
      </PageContainer>
    );
  }

  if (error && !metrics) {
    return (
      <PageContainer>
        <ErrorState onRetry={refreshData} message={error} />
      </PageContainer>
    );
  }

  const handleExport = () => {
    if (deploymentsData) {
      exportReportData(deploymentsData.data, 'json');
      showSuccessToast("Deployment data exported.");
    }
  };

  // Recharts custom tooltip matching index.html
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

  const chartData = trends || [];
  const chartLabelKey = chartData[0]?.month ? 'month' : 'day';

  const buildSparklinePath = (values = []) => {
    const numericValues = values.map(Number).filter((value) => Number.isFinite(value));
    if (numericValues.length === 0) return '';

    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    const range = max - min || 1;
    const step = numericValues.length > 1 ? 100 / (numericValues.length - 1) : 100;

    return numericValues
      .map((value, index) => {
        const x = index * step;
        const y = 28 - ((value - min) / range) * 24;
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const buildSparklineFill = (path) => (path ? `${path} V30 H0 Z` : '');

  const formatLeadTimeInsight = (val) => {
    const h = parseFloat(val);
    if (isNaN(h) || h === 0) return '0';
    if (h < 1) {
      const secs = Math.round(h * 3600);
      return secs < 60 ? `${secs} seconds` : `${Math.round(h * 60)} minutes`;
    }
    return `${h.toFixed(1)} hours`;
  };

  const dfSparkline = buildSparklinePath(metrics?.deploymentFrequency?.sparkline);
  const ltSparkline = buildSparklinePath(metrics?.leadTime?.sparkline);
  const cfrSparkline = buildSparklinePath(metrics?.changeFailureRate?.sparkline);
  const mttrSparkline = buildSparklinePath(metrics?.meanTimeToRestore?.sparkline);

  const insightCards = [
    {
      tone: 'primary',
      title: parseFloat(metrics?.leadTime?.value || 0) > 0 
        ? (metrics?.leadTime?.trendDirection === 'down' ? 'Lead Time Improving' : 'Lead Time Watch')
        : 'Lead Time — No Data',
      copy: parseFloat(metrics?.leadTime?.value || 0) > 0
        ? `${metrics?.leadTime?.rating} lead time at ${formatLeadTimeInsight(metrics?.leadTime?.value)} with ${Math.abs(metrics?.leadTime?.trend || 0)}% change versus the previous window.`
        : 'No successful deployments in this window. Lead time metrics require at least one completed pipeline run.'
    },
    {
      tone: 'error',
      title: parseFloat(metrics?.changeFailureRate?.value || 0) > 0
        ? (metrics?.changeFailureRate?.trendDirection === 'up' ? 'Failure Rate Rising' : 'Failure Rate Controlled')
        : 'Change Failure Rate',
      copy: parseFloat(metrics?.changeFailureRate?.value || 0) > 0
        ? `${metrics?.changeFailureRate?.rating} change failure rate at ${metrics?.changeFailureRate?.value}% across the selected telemetry window.`
        : 'No failures detected in this window, or no deployments exist to evaluate.'
    },
    {
      tone: 'secondary',
      title: parseFloat(metrics?.deploymentFrequency?.value || 0) > 0
        ? (metrics?.deploymentFrequency?.trendDirection === 'up' ? 'Deployment Cadence Up' : 'Deployment Cadence Steady')
        : 'Deployment Cadence — Inactive',
      copy: parseFloat(metrics?.deploymentFrequency?.value || 0) > 0
        ? `${metrics?.deploymentFrequency?.rating} deployment frequency at ${metrics?.deploymentFrequency?.value} ${metrics?.deploymentFrequency?.unit || 'deploys/day'}.`
        : 'No successful deployments in this window. Trigger a pipeline run to begin tracking deployment cadence.'
    }
  ];

  return (
    <PageContainer>
      {/* Dashboard Header */}
      <header className="flex justify-between items-end mb-10 reveal-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h2 className="font-display-lg text-display-lg text-primary tracking-tight">
            DORA Metrics Overview
          </h2>
          <div className="flex items-center gap-3 text-on-surface-variant font-label-mono mt-2">
            <span className="w-2 h-2 rounded-full bg-primary-container pulse-dot"></span>
            <span>LOCAL {localTime}</span>
            <span className="opacity-30">|</span>
            <span>{metrics ? 'LIVE AZURE DATA' : 'AWAITING TELEMETRY'}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="px-6 py-2 glass-panel rounded-full text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Filtering
          </button>
          
          <button 
            onClick={handleExport}
            className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-medium hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export Deployments
          </button>
        </div>
      </header>

      {/* Top Row: DORA Metrics */}
      <section id="dashboard-metrics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-panel-gap mb-panel-gap">
        {/* Deployment Frequency */}
        <GlassCard glow delay="0.2s" className="p-glass-padding rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              Deployment Frequency
            </span>
            <span className="material-symbols-outlined text-primary-fixed-dim">speed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-data-metric text-[36px] text-primary">
              <AnimatedCounter targetValue={metrics?.deploymentFrequency?.value || 0} decimals={1} />
            </span>
            <span className="font-label-mono text-xs text-on-primary-container">/ DAY</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-primary-container fill-none stroke-2 animate-pulse" viewBox="0 0 100 30">
              <path d={dfSparkline}></path>
              <path className="fill-primary-container/10 stroke-none" d={buildSparklineFill(dfSparkline)}></path>
            </svg>
          </div>
          {metrics?.totalSuccessfulDeployments === 0 ? (
            <p className="text-xs mt-3 font-label-mono text-on-surface-variant/60">
              NO SUCCESSFUL DEPLOYMENTS DETECTED
            </p>
          ) : (
            <p className={`text-xs mt-3 font-label-mono ${gradeDeploymentFrequency(metrics?.deploymentFrequency?.value || 0).isGood ? 'text-primary-fixed/60' : 'text-error/60'}`}>
              {gradeDeploymentFrequency(metrics?.deploymentFrequency?.value || 0).label} · {metrics?.deploymentFrequency?.trendDirection === 'up' ? '↑' : '↓'} {metrics?.deploymentFrequency?.trend || 0}%
            </p>
          )}
        </GlassCard>

        {/* Lead Time */}
        <GlassCard delay="0.3s" className="p-glass-padding rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              Lead Time for Change
            </span>
            <span className="material-symbols-outlined text-secondary">schedule</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-data-metric text-[36px] text-secondary-fixed-dim">
              {parseFloat(metrics?.leadTime?.value || 0) === 0 ? '--' : <AnimatedCounter targetValue={metrics?.leadTime?.value || 0} decimals={metrics?.leadTime?.value > 0 && metrics?.leadTime?.value < 0.1 ? 3 : 1} />}
            </span>
            <span className="font-label-mono text-xs text-secondary-fixed">{parseFloat(metrics?.leadTime?.value || 0) === 0 ? '' : 'HOURS'}</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-secondary-fixed-dim fill-none stroke-2" viewBox="0 0 100 30">
              <path d={ltSparkline}></path>
              <path className="fill-secondary-container/10 stroke-none" d={buildSparklineFill(ltSparkline)}></path>
            </svg>
          </div>
          {metrics?.totalSuccessfulDeployments === 0 ? (
            <p className="text-xs mt-3 font-label-mono text-on-surface-variant/60">
              NO DATA — 0 DEPLOYMENTS
            </p>
          ) : (
            <p className={`text-xs mt-3 font-label-mono ${gradeLeadTime(metrics?.leadTime?.value || 0).isGood ? 'text-secondary-fixed/60' : 'text-error/60'}`}>
              {gradeLeadTime(metrics?.leadTime?.value || 0).label} · {metrics?.leadTime?.trendDirection === 'up' ? '↑' : '↓'} {Math.abs(metrics?.leadTime?.trend || 0)}%
            </p>
          )}
        </GlassCard>

        {/* Change Failure Rate */}
        <GlassCard delay="0.4s" className="p-glass-padding rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              Change Failure Rate
            </span>
            <span className="material-symbols-outlined text-error">heart_broken</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-data-metric text-[36px] text-error">
              {metrics?.totalDeployments === 0 ? '--' : <AnimatedCounter targetValue={metrics?.changeFailureRate?.value || 0} decimals={1} />}
            </span>
            <span className="font-label-mono text-xs text-error/60">{metrics?.totalDeployments === 0 ? '' : '%'}</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-error fill-none stroke-2" viewBox="0 0 100 30">
              <path d={cfrSparkline}></path>
              <path className="fill-error-container/10 stroke-none" d={buildSparklineFill(cfrSparkline)}></path>
            </svg>
          </div>
          {metrics?.totalDeployments === 0 ? (
            <p className="text-xs mt-3 font-label-mono text-on-surface-variant/60">
              NO DEPLOYMENTS TO EVALUATE
            </p>
          ) : (
            <p className={`text-xs mt-3 font-label-mono ${gradeChangeFailureRate(metrics?.changeFailureRate?.value || 0).isGood ? 'text-on-surface-variant/60' : 'text-error/60'}`}>
              {gradeChangeFailureRate(metrics?.changeFailureRate?.value || 0).label}
            </p>
          )}
        </GlassCard>

        {/* Recovery Time */}
        <GlassCard delay="0.5s" className="p-glass-padding rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
              Recovery Time (MTTR)
            </span>
            <span className="material-symbols-outlined text-tertiary-fixed-dim">auto_repair</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-data-metric text-[36px] text-tertiary-fixed-dim">
              {parseFloat(metrics?.meanTimeToRestore?.value || 0) === 0 ? '--' : <AnimatedCounter targetValue={metrics?.meanTimeToRestore?.value || 0} decimals={0} />}
            </span>
            <span className="font-label-mono text-xs text-tertiary-fixed">{parseFloat(metrics?.meanTimeToRestore?.value || 0) === 0 ? '' : 'MINS'}</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-tertiary-fixed-dim fill-none stroke-2" viewBox="0 0 100 30">
              <path d={mttrSparkline}></path>
              <path className="fill-tertiary-container/10 stroke-none" d={buildSparklineFill(mttrSparkline)}></path>
            </svg>
          </div>
          {metrics?.totalIncidents === 0 ? (
            <p className="text-xs mt-3 font-label-mono text-on-surface-variant/60">
              NO INCIDENTS DETECTED
            </p>
          ) : (
            <p className={`text-xs mt-3 font-label-mono ${gradeMTTR(metrics?.meanTimeToRestore?.value || 0).isGood ? 'text-tertiary-fixed/60' : 'text-error/60'}`}>
              {gradeMTTR(metrics?.meanTimeToRestore?.value || 0).label} · {metrics?.meanTimeToRestore?.trendDirection === 'up' ? '↑' : '↓'} {Math.abs(metrics?.meanTimeToRestore?.trend || 0)} mins
            </p>
          )}
        </GlassCard>
      </section>

      {/* Middle Row: Trend & Insights */}
      <section id="dashboard-overview" className="grid grid-cols-1 lg:grid-cols-3 gap-panel-gap mb-panel-gap">
        {/* Left: Deployment Velocity Trends */}
        <GlassCard delay="0.6s" className="lg:col-span-2 min-h-[400px] flex flex-col p-glass-padding rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline-lg text-xl text-primary-fixed">Deployment Velocity Trends</h3>
            <div className="flex gap-2">
              {[
                { label: '7D', value: '7d' },
                { label: '30D', value: '30d' },
                { label: '90D', value: '90d' }
              ].map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => updateFilters({ dateRange: range.value })}
                  className={`px-3 py-1 rounded text-xs font-label-mono transition-colors ${
                    filters.dateRange === range.value ? 'bg-primary-container text-on-primary-container' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Glowing Recharts Area Chart */}
          <div className="flex-1 w-full min-h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00dbe7" stopOpacity={0.3}></stop>
                    <stop offset="100%" stopColor="#00dbe7" stopOpacity={0}></stop>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                <XAxis 
                  dataKey={chartLabelKey} 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  fontSize={10} 
                  tickLine={false} 
                  allowDecimals={false}
                />
                <Tooltip {...customTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="deployments"
                  stroke="#00dbe7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#gradient-area)"
                  className="recharts-glow-path"
                  dot={{ r: 4, stroke: '#00dbe7', strokeWidth: 1.5, fill: '#050816' }}
                  activeDot={{ r: 6, stroke: '#00dbe7', strokeWidth: 1.5, fill: '#00dbe7' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Right: Metric Insights */}
        <GlassCard delay="0.7s" className="flex flex-col overflow-hidden relative p-glass-padding rounded-2xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/15 blur-3xl rounded-full"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">auto_awesome</span>
            <h3 className="font-headline-lg text-xl text-secondary-fixed">Metric Insights</h3>
          </div>

          <div className="space-y-4 flex-1">
            {insightCards.map((insight) => (
              <div key={insight.title} className={`p-4 rounded-xl bg-white/5 border-l-4 ${
                insight.tone === 'primary' ? 'border-primary-container' : insight.tone === 'error' ? 'border-error' : 'border-secondary'
              }`}>
                <p className={`font-label-mono text-[10px] mb-1 uppercase ${
                  insight.tone === 'primary' ? 'text-primary-container' : insight.tone === 'error' ? 'text-error' : 'text-secondary'
                }`}>{insight.title}</p>
                <p className="text-sm text-on-surface/80 leading-relaxed">{insight.copy}</p>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={() => navigate('/reports')}
            className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-label-mono hover:bg-white/5 transition-colors uppercase tracking-wider text-primary-fixed-dim"
          >
            Generate DORA Report
          </button>
        </GlassCard>
      </section>

      {/* Bottom Row: Recent Deployments */}
      <section className="glass-panel rounded-2xl overflow-hidden reveal-up" style={{ animationDelay: '0.8s' }}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-headline-lg text-xl text-on-surface">Recent Azure Pipeline Runs</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-label-mono text-on-surface-variant select-none">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span> SUCCESS
            </div>
            <div className="flex items-center gap-2 text-xs font-label-mono text-on-surface-variant select-none">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span> ACTIVE
            </div>
          </div>
        </div>

        <div className="overflow-x-auto select-text">
          <table className="w-full text-left font-body-md text-sm border-collapse">
            <thead className="bg-white/5 sticky top-0 font-label-mono text-on-surface-variant uppercase text-[10px] tracking-widest border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Release ID</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Environment</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {(deploymentsData?.data || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/60 font-mono text-xs">
                    No Azure pipeline runs found in this selected window.
                  </td>
                </tr>
              ) : (
                (deploymentsData?.data || []).map((dep, idx) => (
                  <tr key={dep.id || idx} className="scanline-hover group border-b border-white/5 hover:text-primary-fixed transition-colors">
                    <td className="px-6 py-4 font-label-mono text-primary-fixed">{dep.id || `--`}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs text-primary-container">cloud_queue</span>
                      </div>
                      <span className="font-medium">{dep.pipeline ? formatDisplayName(dep.pipeline, dep.pipeline) : 'Unavailable'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-label-mono">
                        {dep.environment ? dep.environment.toUpperCase() : 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-label-mono text-xs">
                      {dep.timestamp ? dayjs(dep.timestamp).format('YYYY-MM-DD HH:mm:ss') : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 font-medium ${
                        dep.status === 'success' ? 'text-primary-fixed' : dep.status === 'failed' ? 'text-error' : 'text-secondary'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          dep.status === 'success' ? 'bg-primary-container' : dep.status === 'failed' ? 'bg-error' : 'bg-secondary-container animate-pulse'
                        }`}></span>
                        {dep.status === 'success' ? 'Success' : dep.status === 'failed' ? 'Failed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => navigate('/deployments')}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-white/5 flex justify-center border-t border-white/5">
          <button 
            onClick={() => navigate('/deployments')}
            className="text-xs font-label-mono text-primary-fixed-dim hover:underline uppercase tracking-widest"
          >
            View Deployment History
          </button>
        </div>
      </section>
    </PageContainer>
  );
};
export default Dashboard;
