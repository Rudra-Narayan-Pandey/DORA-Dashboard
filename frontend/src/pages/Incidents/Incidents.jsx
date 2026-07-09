import React, { useState, useContext } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import PageContainer from '../../components/layout/PageContainer';
import GlassCard from '../../components/cards/GlassCard';
import useIncidents from '../../hooks/useIncidents';
import Loader from '../../components/feedback/Loader';
import ErrorState from '../../components/feedback/ErrorState';
import { DashboardContext } from '../../context/DashboardContext';
import dayjs from 'dayjs';
import { formatDisplayName } from '../../utils/displayNames';
import EmptyState from '../../components/feedback/EmptyState';
import { showSuccessToast, showErrorToast } from '../../components/feedback/ToastMessage';

export const Incidents = () => {
  const {
    incidents,
    pagination,
    loading,
    error,
    page,
    setPage,
    refetch,
    createIncident,
    resolveIncident
  } = useIncidents(1, 5);

  const { metrics, trends } = useContext(DashboardContext);
  const [activeChart, setActiveChart] = useState('mttr'); // mttr, rate

  // Report Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState('critical');
  const [environment, setEnvironment] = useState('Production');
  const [pipeline, setPipeline] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showErrorToast('Title is required to log an anomaly.');
      return;
    }
    setSubmitting(true);
    try {
      await createIncident({
        title: title.trim(),
        severity,
        environment,
        pipeline: pipeline.trim() || 'Core-Service',
        description: description.trim()
      });
      setIsReportModalOpen(false);
      setTitle('');
      setPipeline('');
      setDescription('');
      showSuccessToast('Incident successfully created on Azure Boards.');
    } catch {
      showErrorToast('Failed to create incident.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && page === 1) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[80vh]">
        <Loader size="lg" text="Syncing incidents matrix data stream..." />
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
        mttr: t.mttr,
        rate: t.failureRate
      }))
    : [];

  const cfrNum = metrics ? parseFloat(metrics.changeFailureRate?.value || 0) : 0;
  const hasDeployments = metrics?.totalDeployments > 0;
  const stabilityScore = hasDeployments ? (100 - cfrNum).toFixed(0) : '--';
  const mttrVal = metrics ? metrics.meanTimeToRestore?.value || 0 : 0;

  return (
    <PageContainer>
      {/* Chart Section */}
      <section id="incidents-chart" className="mb-gutter reveal-up" style={{ animationDelay: '0.1s' }}>
        <GlassCard className="rounded-xl overflow-hidden relative p-glass-padding">
          <div className="flex justify-between items-start mb-6 z-10 relative">
            <div>
              <h3 className="font-display-lg text-headline-lg text-primary-fixed-dim">
                {activeChart === 'mttr' ? 'Mean Time To Restore (MTTR)' : 'Change Failure Rate'}
              </h3>
              <p className="font-body-md text-on-surface-variant">
                {activeChart === 'mttr' ? 'Minutes taken to resolve service anomalies' : 'Percentage of builds triggering outages'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveChart('mttr')}
                className={`px-3 py-1 rounded text-xs font-label-mono transition-all ${
                  activeChart === 'mttr' ? 'bg-primary-container text-on-primary-container' : 'bg-white/5 hover:bg-white/10 text-on-surface-variant'
                }`}
              >
                MTTR
              </button>
              <button
                onClick={() => setActiveChart('rate')}
                className={`px-3 py-1 rounded text-xs font-label-mono transition-all ${
                  activeChart === 'rate' ? 'bg-primary-container text-on-primary-container' : 'bg-white/5 hover:bg-white/10 text-on-surface-variant'
                }`}
              >
                FAILURE RATE
              </button>
            </div>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} tickLine={false} />
                <Tooltip {...customTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey={activeChart === 'mttr' ? 'mttr' : 'rate'}
                  stroke={activeChart === 'mttr' ? '#ddb7ff' : '#ffb4ab'}
                  strokeWidth={3}
                  className="recharts-glow-path"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </section>

      {/* Bento Grid Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-panel-gap mb-gutter">
        <GlassCard delay="0.2s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-error">heart_broken</span>
            <span className="text-[10px] font-label-mono text-error uppercase tracking-tighter">Stability Nom</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Active Alarms</div>
          <div className="font-data-metric text-display-lg text-error">
            {incidents.filter(i => i.status !== 'resolved').length}
          </div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono font-bold uppercase">{incidents.filter(i => i.status !== 'resolved').length === 0 ? 'ALL SYSTEMS NOMINAL' : 'ACTIVE ALERTS DETECTED'}</p>
        </GlassCard>

        <GlassCard delay="0.3s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-secondary">security</span>
            <span className="text-[10px] font-label-mono text-secondary uppercase tracking-tighter">GRID HEALTH</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Stability Score</div>
          <div className="font-data-metric text-display-lg text-secondary">{hasDeployments ? `${stabilityScore}%` : '--'}</div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono font-bold uppercase">{hasDeployments ? `${metrics?.changeFailureRate?.rating || 'Low'} RATING SECURED` : 'NO DEPLOYMENTS TO EVALUATE'}</p>
        </GlassCard>

        <GlassCard delay="0.4s" className="rounded-xl p-glass-padding">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-primary-fixed-dim">build_circle</span>
            <span className="text-[10px] font-label-mono text-primary-fixed-dim uppercase tracking-tighter">Avg Restore Rate</span>
          </div>
          <div className="font-label-mono text-xs text-on-surface-variant mb-1 uppercase tracking-widest font-semibold">Median MTTR</div>
          <div className="font-data-metric text-display-lg text-primary-fixed glow-text-cyan">{metrics?.totalIncidents === 0 ? '--' : `${mttrVal}m`}</div>
          <p className="text-xs text-on-surface-variant/60 mt-3 font-label-mono font-bold uppercase">{metrics?.totalIncidents === 0 ? 'NO INCIDENTS REPORTED' : `${metrics?.meanTimeToRestore?.rating || 'Low'}-PERFORMING STATUS`}</p>
        </GlassCard>
      </section>

      {/* Incidents Ledger Table */}
      <section id="incidents-ledger" className="glass-panel rounded-xl overflow-hidden reveal-up" style={{ animationDelay: '0.5s' }}>
        <div className="px-glass-padding py-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="font-headline-lg text-headline-lg text-on-surface">Recent Outages & Degradations</h3>
          
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-1.5 bg-error text-on-primary font-bold rounded-lg text-xs font-mono uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,84,84,0.2)]"
          >
            <span className="material-symbols-outlined text-sm">report</span>
            Report Anomaly
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-label-mono text-sm border-collapse">
            <thead className="bg-white/5 text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="px-glass-padding py-4">Incident ID</th>
                <th className="px-glass-padding py-4">Anomaly Title</th>
                <th className="px-glass-padding py-4">Severity</th>
                <th className="px-glass-padding py-4">Service</th>
                <th className="px-glass-padding py-4">Detected At</th>
                <th className="px-glass-padding py-4">MTTR</th>
                <th className="px-glass-padding py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-on-surface">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-glass-padding py-12">
                    <EmptyState
                      title="No Azure Boards incidents found"
                      message="The selected Azure DevOps window currently has no incident or bug work items matching the configured filters."
                      actionLabel="Report New Incident"
                      onAction={() => setIsReportModalOpen(true)}
                    />
                  </td>
                </tr>
              ) : incidents.map((i, idx) => (
                <tr key={i.id || idx} className="scanline-row transition-colors hover:text-primary-fixed">
                  <td className="px-glass-padding py-5 font-bold text-error">{i.id || `--`}</td>
                  <td className="px-glass-padding py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-on-surface">{i.title}</span>
                      <span className="text-[10px] text-on-surface-variant/60">{i.description}</span>
                    </div>
                  </td>
                  <td className="px-glass-padding py-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-label-mono ${
                      i.severity === 'critical' ? 'bg-error/10 text-error border border-error/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    }`}>
                      {i.severity?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-glass-padding py-5 text-on-surface-variant">{i.pipeline ? formatDisplayName(i.pipeline, i.pipeline) : 'Unavailable'}</td>
                  <td className="px-glass-padding py-5 text-on-surface-variant">
                    {dayjs(i.detectedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </td>
                  <td className="px-glass-padding py-5">
                    {i.status === 'resolved' ? `${i.duration}m` : (
                      <span className="text-error animate-pulse font-bold">ACTIVE</span>
                    )}
                  </td>
                  <td className="px-glass-padding py-5 text-right">
                    {i.status !== 'resolved' ? (
                      <button 
                        onClick={() => resolveIncident(i.id)}
                        className="px-3 py-1 border border-error/40 hover:bg-error/10 text-error rounded font-bold text-[10px]"
                      >
                        RESOLVE
                      </button>
                    ) : (
                      <span className="text-on-surface-variant/40 uppercase text-[10px]">Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paging controls */}
        <div className="p-4 bg-white/5 flex justify-between items-center px-glass-padding border-t border-white/5 font-mono text-xs select-none">
          <span className="text-[10px] text-on-surface-variant/60">
            Page {page} of {pagination.pages || 1}
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

      {/* Report Incident Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-gutter backdrop-blur-3xl overflow-hidden">
          <div className="relative w-full max-w-xl glass-panel rounded-2xl p-6 border border-white/15 shadow-2xl z-10 font-mono text-on-surface text-xs">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display-lg text-xl text-error tracking-tight">Report Service Anomaly</h3>
                <p className="text-[10px] text-on-surface-variant/60 uppercase mt-1">Log a new bug / incident work item in Azure Boards</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="p-2 rounded-full hover:bg-white/10 text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Anomaly Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Critical failure in core billing database connection"
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Severity</label>
                  <select 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-3 bg-surface-container-high/90 appearance-none cursor-pointer"
                  >
                    <option value="critical" className="bg-surface">CRITICAL (Priority 1)</option>
                    <option value="major" className="bg-surface">MAJOR (Priority 2)</option>
                    <option value="minor" className="bg-surface">MINOR (Priority 3)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Target Environment</label>
                  <select 
                    value={environment} 
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-3 bg-surface-container-high/90 appearance-none cursor-pointer"
                  >
                    <option value="Production" className="bg-surface">PRODUCTION</option>
                    <option value="Canary" className="bg-surface">CANARY</option>
                    <option value="Staging" className="bg-surface">STAGING</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Affected Pipeline / Service</label>
                <input 
                  type="text"
                  value={pipeline}
                  onChange={(e) => setPipeline(e.target.value)}
                  placeholder="e.g. Rudra-Narayan-Pandey.DORA-Dashboard"
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Detailed Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Steps to reproduce, error stack, impact analysis..."
                  rows={4}
                  className="w-full glass-input rounded-xl px-4 py-3 text-on-surface bg-transparent resize-none focus:outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 text-on-surface"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-3 bg-error text-on-primary font-bold rounded-xl shadow-[0_0_20px_rgba(255,84,84,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  {submitting ? 'LOGGING BUG...' : 'REPORT OUTAGE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
export default Incidents;
