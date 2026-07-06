import React, { useState } from 'react';
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

export const Analytics = () => {
  const [timefeed, setTimefeed] = useState('LAST 7 DAYS');

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

  const chartData = [
    { name: 'Phase 1', value: 150 },
    { name: 'Phase 2', value: 80 },
    { name: 'Phase 3', value: 120 },
    { name: 'Phase 4', value: 100 },
    { name: 'Phase 5', value: 60 },
    { name: 'Phase 6', value: 90 },
    { name: 'Phase 7', value: 40 }
  ];

  return (
    <PageContainer>
      {/* Hero Section: Lead Time Velocity */}
      <section className="mb-gutter reveal-up" style={{ animationDelay: '0.1s' }}>
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
                value={timefeed} 
                onChange={(e) => setTimefeed(e.target.value)}
                className="bg-surface-container-highest/30 border-white/10 rounded-lg text-xs font-label-mono px-3 py-1 outline-none text-on-surface cursor-pointer focus:ring-1 focus:ring-primary-container"
              >
                <option value="LAST 24 HOURS" className="bg-surface">LAST 24 HOURS</option>
                <option value="LAST 7 DAYS" className="bg-surface">LAST 7 DAYS</option>
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
                <XAxis dataKey="name" hide />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="value"
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
            <span className="text-[10px] font-label-mono text-primary-fixed-dim uppercase tracking-tighter">Stability Score: 98%</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Median Lead Time</div>
          <div className="font-data-metric text-display-lg text-primary-fixed glow-text-cyan">1h 22m</div>
          <div className="mt-4 text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-green-400 text-sm">trending_down</span>
            <span className="text-green-400 font-bold">-12%</span> vs last week
          </div>
        </GlassCard>

        {/* Process Efficiency */}
        <GlassCard delay="0.3s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary">bolt</span>
            <span className="text-[10px] font-label-mono text-secondary uppercase tracking-tighter">Cluster Health</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Process Efficiency</div>
          <div className="font-data-metric text-display-lg text-secondary">88%</div>
          <div className="mt-4 w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-secondary h-full shadow-[0_0_10px_rgba(192,193,255,0.5)]" style={{ width: '88%' }}></div>
          </div>
        </GlassCard>

        {/* Deployment Velocity */}
        <GlassCard delay="0.4s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary-fixed-dim">rocket_launch</span>
            <span className="text-[10px] font-label-mono text-primary-fixed-dim uppercase tracking-tighter">Elite Performer</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Deployment Velocity</div>
          <div className="font-data-metric text-display-lg text-on-surface">12<span className="text-2xl text-on-surface-variant">/day</span></div>
          <div className="mt-4 text-xs text-on-surface-variant flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-primary-fixed-dim text-sm">auto_graph</span>
            Scaling according to schedule
          </div>
        </GlassCard>
      </section>

      {/* Pipeline Stage Breakdown Table */}
      <section className="glass-panel rounded-xl overflow-hidden reveal-up" style={{ animationDelay: '0.5s' }}>
        <div className="px-glass-padding py-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Pipeline Stage Breakdown</h3>
          <button className="font-label-mono text-xs text-primary-fixed-dim flex items-center gap-2 hover:underline focus:outline-none">
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
              {/* Development */}
              <tr className="scanline-row transition-colors">
                <td className="px-glass-padding py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-fixed-dim">code</span>
                    <span className="text-on-surface font-medium">Development</span>
                  </div>
                </td>
                <td className="px-glass-padding py-5">
                  <span className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    STABLE
                  </span>
                </td>
                <td className="px-glass-padding py-5 text-right font-data-metric text-primary-fixed">42m</td>
                <td className="px-glass-padding py-5">
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-white/10"></div>
                  </div>
                </td>
                <td className="px-glass-padding py-5 text-right">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none">more_vert</button>
                </td>
              </tr>

              {/* Build */}
              <tr className="scanline-row transition-colors">
                <td className="px-glass-padding py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">memory</span>
                    <span className="text-on-surface font-medium">Build</span>
                  </div>
                </td>
                <td className="px-glass-padding py-5">
                  <span className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    OPTIMIZED
                  </span>
                </td>
                <td className="px-glass-padding py-5 text-right font-data-metric text-primary-fixed">8m</td>
                <td className="px-glass-padding py-5">
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                  </div>
                </td>
                <td className="px-glass-padding py-5 text-right">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none">more_vert</button>
                </td>
              </tr>

              {/* Test */}
              <tr className="scanline-row transition-colors">
                <td className="px-glass-padding py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-tertiary-fixed-dim">science</span>
                    <span className="text-on-surface font-medium">Test</span>
                  </div>
                </td>
                <td className="px-glass-padding py-5">
                  <span className="flex items-center gap-2 text-orange-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot"></span>
                    HEAVY LOAD
                  </span>
                </td>
                <td className="px-glass-padding py-5 text-right font-data-metric text-primary-fixed">24m</td>
                <td className="px-glass-padding py-5">
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-orange-400 shadow-[0_0_5px_#f59e0b]"></div>
                    <div className="w-4 h-1 bg-white/10"></div>
                    <div className="w-4 h-1 bg-white/10"></div>
                    <div className="w-4 h-1 bg-white/10"></div>
                  </div>
                </td>
                <td className="px-glass-padding py-5 text-right">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none">more_vert</button>
                </td>
              </tr>

              {/* Deploy */}
              <tr className="scanline-row transition-colors">
                <td className="px-glass-padding py-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-primary-container">rocket</span>
                    <span className="text-on-surface font-medium">Deploy</span>
                  </div>
                </td>
                <td className="px-glass-padding py-5">
                  <span className="flex items-center gap-2 text-green-400 text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    READY
                  </span>
                </td>
                <td className="px-glass-padding py-5 text-right font-data-metric text-primary-fixed">12m</td>
                <td className="px-glass-padding py-5">
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-primary-fixed-dim shadow-[0_0_5px_#00dbe7]"></div>
                    <div className="w-4 h-1 bg-white/10"></div>
                    <div className="w-4 h-1 bg-white/10"></div>
                  </div>
                </td>
                <td className="px-glass-padding py-5 text-right">
                  <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none">more_vert</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  );
};
export default Analytics;
