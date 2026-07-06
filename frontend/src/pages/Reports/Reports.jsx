import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loader from '../../components/feedback/Loader';
import { generateReport, exportReportData } from '../../services/reportService';
import { DATE_RANGES, ENVIRONMENTS } from '../../utils/constants';
import { showSuccessToast, showErrorToast } from '../../components/feedback/ToastMessage';

export const Reports = () => {
  const [range, setRange] = useState(DATE_RANGES.LAST_7D);
  const [environment, setEnvironment] = useState(ENVIRONMENTS.PRODUCTION);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleCompileReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await generateReport({ range, environment });
      setReport(res);
      showSuccessToast("DevOps performance report compiled successfully.");
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to compile performance report.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    if (!report) return;
    try {
      exportReportData(report, format);
      showSuccessToast(`Exporting raw telemetry as ${format.toUpperCase()}`);
    } catch (err) {
      showErrorToast("Export error encountered.");
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A':
      case 'A-':
        return 'text-green-400 border-green-400/30 bg-green-400/5 glow-text-cyan shadow-[0_0_15px_rgba(74,222,128,0.1)]';
      case 'B':
      case 'B+':
        return 'text-primary-fixed-dim border-primary-fixed-dim/30 bg-primary-fixed-dim/5 glow-text-cyan shadow-[0_0_15px_rgba(0,219,231,0.1)]';
      case 'C':
      case 'C+':
        return 'text-orange-400 border-orange-400/30 bg-orange-400/5';
      case 'D':
      default:
        return 'text-error border-error/30 bg-error/5';
    }
  };

  return (
    <PageContainer>
      {/* Scope configuration bar */}
      <form onSubmit={handleCompileReport} className="glass-panel p-glass-padding rounded-xl flex flex-col md:flex-row items-end gap-4 border-white/10 reveal-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="space-y-2 flex flex-col">
            <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Report Scope Window</label>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm bg-surface-container-high/90 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value={DATE_RANGES.LAST_7D} className="bg-surface">7 Days window</option>
              <option value={DATE_RANGES.LAST_30D} className="bg-surface">30 Days window</option>
              <option value={DATE_RANGES.LAST_90D} className="bg-surface">90 Days window</option>
            </select>
          </div>
          
          <div className="space-y-2 flex flex-col">
            <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">Target Grid Environment</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm bg-surface-container-high/90 focus:outline-none focus:border-primary appearance-none cursor-pointer"
            >
              <option value="All" className="bg-surface">All Environments</option>
              {Object.values(ENVIRONMENTS).map((env, idx) => (
                <option key={idx} className="bg-surface text-on-surface" value={env}>{env.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full md:w-auto py-3.5 px-8 bg-gradient-to-r from-primary-fixed-dim to-secondary-container text-on-primary font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs font-mono uppercase tracking-widest"
        >
          Compile Report
        </button>
      </form>

      {/* Report results panel */}
      {loading ? (
        <div className="glass-panel p-16 flex items-center justify-center min-h-[300px] rounded-xl border-white/10">
          <Loader size="lg" text="Aggregating metrics datasets..." />
        </div>
      ) : report ? (
        <div className="flex flex-col gap-6 font-mono text-on-surface reveal-up" style={{ animationDelay: '0.2s' }}>
          
          {/* Grader Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-5 flex items-center justify-between border-white/10 rounded-xl">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Overall Health Grade</span>
                <span className="text-xs text-on-surface-variant/60">Range: {report.range}</span>
              </div>
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center text-2xl font-black ${getGradeColor(report.grades.overall)}`}>
                {report.grades.overall}
              </div>
            </div>

            <div className="glass-panel p-5 flex flex-col justify-between border-white/10 rounded-xl">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Build success rate</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-on-surface">{report.successfulDeployments} / {report.totalDeployments}</span>
                <span className="text-xs text-green-400 font-bold">
                  {((report.successfulDeployments / report.totalDeployments) * 100).toFixed(1)}% OK
                </span>
              </div>
            </div>

            <div className="glass-panel p-5 flex flex-col justify-between border-white/10 rounded-xl">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Telemetry Export</span>
              <button 
                onClick={() => handleExport('json')}
                className="w-full mt-2 py-2.5 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold transition-all text-primary-fixed-dim"
              >
                DOWNLOAD JSON DATA
              </button>
            </div>
          </div>

          {/* DORA grades grid */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-on-surface-variant font-bold border-b border-white/10 pb-3">
              DORA Scorecard Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Deployment Frequency', value: '24.5 / day', grade: report.grades.deploymentFrequency },
                { label: 'Lead Time to Changes', value: '1.2 hours', grade: report.grades.leadTime },
                { label: 'Change Failure Rate', value: '0.8%', grade: report.grades.changeFailureRate },
                { label: 'MTTR Recovery Time', value: '18 minutes', grade: report.grades.meanTimeToRestore },
              ].map((card, idx) => (
                <div key={idx} className="border border-white/5 bg-white/5 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-on-surface-variant/60 uppercase tracking-wider">{card.label}</span>
                    <span className="text-sm font-bold text-on-surface">{card.value}</span>
                  </div>
                  <span className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${getGradeColor(card.grade)}`}>
                    {card.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations / AI directives */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-secondary font-bold border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Aether AI Directives</span>
            </h3>
            <div className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-white/5 bg-white/5 rounded-lg text-xs leading-relaxed">
                  <div className="text-secondary font-bold font-mono">0{idx + 1}.</div>
                  <div className="text-on-surface-variant">{rec}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="glass-panel p-16 flex flex-col items-center justify-center text-center border-white/10 rounded-xl text-on-surface-variant/40 gap-4 reveal-up" style={{ animationDelay: '0.2s' }}>
          <span className="material-symbols-outlined text-4xl text-slate-700">file_copy</span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-mono">Compiler Standby</h3>
            <p className="text-xs font-mono mt-1">Select timeframe scopes above to compile telemetry scorecards.</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
export default Reports;
