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
import { showSuccessToast } from '../../components/feedback/ToastMessage';
import { exportReportData } from '../../services/reportService';
import { COLORS } from '../../utils/colors';

// Counter component for HUD numbers
const AnimatedCounter = ({ targetValue, decimals = 1 }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const end = parseFloat(targetValue);
    if (isNaN(end)) {
      setValue(targetValue);
      return;
    }
    let start = 0;
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
  const { metrics, trends, deploymentsData, refreshData } = useContext(DashboardContext);

  // UTC clock ticker state
  const [utcTime, setUtcTime] = useState(dayjs().utc().format('HH:mm:ss'));
  const [stardate, setStardate] = useState('2405.12');

  useEffect(() => {
    const clock = setInterval(() => {
      setUtcTime(dayjs().utc().format('HH:mm:ss'));
      // Simulate ticking stardate decimals slowly
      const seconds = new Date().getSeconds();
      setStardate((2405 + (seconds / 100)).toFixed(2));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  const handleExport = () => {
    if (deploymentsData) {
      exportReportData(deploymentsData.data, 'json');
      showSuccessToast("Raw telemetry data stream exported.");
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

  // Static Sparkline path calculations to match exact index.html SVGs
  const dfSparkline = "M0,25 Q10,20 20,22 T40,15 T60,25 T80,10 T100,5";
  const ltSparkline = "M0,10 Q20,15 40,12 T70,18 T100,10";
  const cfrSparkline = "M0,5 L20,10 L40,8 L60,15 L80,12 L100,14";
  const mttrSparkline = "M0,25 L30,10 L50,22 L80,5 L100,12";

  // Chart data from trends mock or defaults
  const chartData = trends || [
    { day: "Mon", deployments: 14 },
    { day: "Tue", deployments: 22 },
    { day: "Wed", deployments: 18 },
    { day: "Thu", deployments: 25 },
    { day: "Fri", deployments: 29 },
    { day: "Sat", deployments: 11 },
    { day: "Sun", deployments: 9 }
  ];

  return (
    <PageContainer>
      {/* Dashboard Header */}
      <header className="flex justify-between items-end mb-10 reveal-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h2 className="font-display-lg text-display-lg text-primary tracking-tight">
            Mission Control Overview
          </h2>
          <div className="flex items-center gap-3 text-on-surface-variant font-label-mono mt-2">
            <span className="w-2 h-2 rounded-full bg-primary-container pulse-dot"></span>
            <span>UTC {utcTime}</span>
            <span className="opacity-30">|</span>
            <span>STARDATE: {stardate}</span>
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
            Export Telemetry
          </button>
        </div>
      </header>

      {/* Top Row: DORA Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-panel-gap mb-panel-gap">
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
              <AnimatedCounter targetValue={metrics?.deploymentFrequency.value || 24.5} decimals={1} />
            </span>
            <span className="font-label-mono text-xs text-on-primary-container">/ DAY</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-primary-container fill-none stroke-2 animate-pulse" viewBox="0 0 100 30">
              <path d={dfSparkline}></path>
              <path className="fill-primary-container/10 stroke-none" d="M0,25 Q10,20 20,22 T40,15 T60,25 T80,10 T100,5 V30 H0 Z"></path>
            </svg>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono">
            ↑ {metrics?.deploymentFrequency.trend || 12}% FROM PREV INTERVAL
          </p>
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
              <AnimatedCounter targetValue={metrics?.leadTime.value || 1.2} decimals={1} />
            </span>
            <span className="font-label-mono text-xs text-secondary-fixed">HOURS</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-secondary-fixed-dim fill-none stroke-2" viewBox="0 0 100 30">
              <path d={ltSparkline}></path>
              <path className="fill-secondary-container/10 stroke-none" d="M0,10 Q20,15 40,12 T70,18 T100,10 V30 H0 Z"></path>
            </svg>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono">
            ↓ {Math.abs(metrics?.leadTime.trend || 0.4)}h OPTIMIZED
          </p>
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
              <AnimatedCounter targetValue={metrics?.changeFailureRate.value || 0.8} decimals={1} />
            </span>
            <span className="font-label-mono text-xs text-error/60">%</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-error fill-none stroke-2" viewBox="0 0 100 30">
              <path d={cfrSparkline}></path>
              <path className="fill-error-container/10 stroke-none" d="M0,5 L20,10 L40,8 L60,15 L80,12 L100,14 V30 H0 Z"></path>
            </svg>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono">
            STABLE - WITHIN THRESHOLD
          </p>
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
              <AnimatedCounter targetValue={metrics?.meanTimeToRestore.value || 18} decimals={0} />
            </span>
            <span className="font-label-mono text-xs text-tertiary-fixed">MINS</span>
          </div>
          {/* SVG Sparkline */}
          <div className="h-12 mt-4">
            <svg className="w-full h-full stroke-tertiary-fixed-dim fill-none stroke-2" viewBox="0 0 100 30">
              <path d={mttrSparkline}></path>
              <path className="fill-tertiary-container/10 stroke-none" d="M0,25 L30,10 L50,22 L80,5 L100,12 V30 H0 Z"></path>
            </svg>
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono">
            HIGH-PERFORMING STATUS
          </p>
        </GlassCard>
      </section>

      {/* Middle Row: Trend & Insights */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-panel-gap mb-panel-gap">
        {/* Left: Deployment Velocity Trends */}
        <GlassCard delay="0.6s" className="lg:col-span-2 min-h-[400px] flex flex-col p-glass-padding rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline-lg text-xl text-primary-fixed">Deployment Velocity Trends</h3>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1 rounded bg-white/10 text-xs font-label-mono hover:bg-white/20 transition-colors">7D</button>
              <button type="button" className="px-3 py-1 rounded bg-primary-container text-on-primary-container text-xs font-label-mono">30D</button>
              <button type="button" className="px-3 py-1 rounded bg-white/10 text-xs font-label-mono hover:bg-white/20 transition-colors">90D</button>
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
                  dataKey={trends ? "month" : "day"} 
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
          <div className="flex justify-between mt-4 font-label-mono text-[10px] text-on-surface-variant/40">
            <span>MAY 01</span><span>MAY 07</span><span>MAY 14</span><span>MAY 21</span><span>MAY 28</span><span>JUN 01</span>
          </div>
        </GlassCard>

        {/* Right: Aether AI Insights */}
        <GlassCard delay="0.7s" className="flex flex-col overflow-hidden relative p-glass-padding rounded-2xl">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/15 blur-3xl rounded-full"></div>
          
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-secondary">auto_awesome</span>
            <h3 className="font-headline-lg text-xl text-secondary-fixed">Aether AI Insights</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div className="p-4 rounded-xl bg-white/5 border-l-4 border-primary-container">
              <p className="font-label-mono text-[10px] text-primary-container mb-1 uppercase">System Optimization</p>
              <p className="text-sm text-on-surface/80 leading-relaxed">
                Lead time has decreased by 14% this week. Consider promoting 'Core-Engine-X' build.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border-l-4 border-error">
              <p className="font-label-mono text-[10px] text-error mb-1 uppercase">Anomaly Detected</p>
              <p className="text-sm text-on-surface/80 leading-relaxed">
                Microservice 'Hyperion-Gate' showing unusual latency spikes. Recommend throttling.
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border-l-4 border-secondary">
              <p className="font-label-mono text-[10px] text-secondary mb-1 uppercase">Stability Advisory</p>
              <p className="text-sm text-on-surface/80 leading-relaxed">
                Success rate for Alpha-7 remains at 100%. Protocol suggests expanding rollout window.
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/reports')}
            className="w-full mt-6 py-3 border border-white/10 rounded-xl text-xs font-label-mono hover:bg-white/5 transition-colors uppercase tracking-wider text-primary-fixed-dim"
          >
            Generate Full Telemetry Report
          </button>
        </GlassCard>
      </section>

      {/* Bottom Row: Recent Orbital Deployments */}
      <section className="glass-panel rounded-2xl overflow-hidden reveal-up" style={{ animationDelay: '0.8s' }}>
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-headline-lg text-xl text-on-surface">Recent Orbital Deployments</h3>
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
              {(deploymentsData?.data || []).map((dep, idx) => (
                <tr key={dep.id || idx} className="scanline-hover group border-b border-white/5 hover:text-primary-fixed transition-colors">
                  <td className="px-6 py-4 font-label-mono text-primary-fixed">{dep.id || `RL-2405-A${idx}`}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary-container/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xs text-primary-container">cloud_queue</span>
                    </div>
                    <span className="font-medium">{dep.pipeline || 'Core-Engine-X'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-label-mono">
                      {dep.environment ? dep.environment.toUpperCase() : 'PRODUCTION'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant font-label-mono text-xs">
                    {dep.timestamp ? dayjs(dep.timestamp).format('YYYY-MM-DD HH:mm:ss') : '2024-05-12 14:02:11'}
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
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-white/5 flex justify-center border-t border-white/5">
          <button 
            onClick={() => navigate('/deployments')}
            className="text-xs font-label-mono text-primary-fixed-dim hover:underline uppercase tracking-widest"
          >
            Load More Telemetry History
          </button>
        </div>
      </section>
    </PageContainer>
  );
};
export default Dashboard;
