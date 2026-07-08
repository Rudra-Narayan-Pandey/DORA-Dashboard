import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import AuroraBackground from '../effects/AuroraBackground';
import LiquidMetalShader from '../effects/LiquidMetalShader';
import ThreeDBox from '../effects/ThreeDBox';
import { showSuccessToast, showErrorToast } from '../feedback/ToastMessage';
import useDeployments from '../../hooks/useDeployments';
import { getPipelines } from '../../services/pipelineService';
import { getCurrentProfile } from '../../services/authService';
import { formatDisplayName } from '../../utils/displayNames';

export const ProtectedLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { triggerDeployment } = useDeployments(1, 5);
  const [profile, setProfile] = useState(null);

  // Form states
  const [pipelines, setPipelines] = useState([]);
  const [pipelinesLoading, setPipelinesLoading] = useState(false);
  const [pipelinesError, setPipelinesError] = useState('');
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [environment, setEnvironment] = useState('Production');
  const [version, setVersion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedPipeline = pipelines.find((pipeline) => String(pipeline.id) === String(selectedPipelineId));

  const profileName = formatDisplayName(profile?.displayName, 'Gargi and Rudra');
  const profileRole = profile?.email || 'Server-side PAT';
  const initials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AZ';

  useEffect(() => {
    let cancelled = false;
    getCurrentProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPipelines = async () => {
    setPipelinesLoading(true);
    setPipelinesError('');
    try {
      const data = await getPipelines();
      setPipelines(data);
      setSelectedPipelineId((current) => current || (data[0]?.id ? String(data[0].id) : ''));
    } catch (err) {
      setPipelines([]);
      setSelectedPipelineId('');
      setPipelinesError(err?.message || 'Unable to load Azure pipeline definitions.');
    } finally {
      setPipelinesLoading(false);
    }
  };

  // Toggle body overflow on modal open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-active');
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.classList.remove('modal-active');
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      loadPipelines();
    }
  }, [isModalOpen]);

  const handleLaunchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPipeline) {
      showErrorToast('Queue request blocked: select a live Azure pipeline first.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await triggerDeployment({
        version,
        pipelineId: selectedPipeline.id,
        pipeline: selectedPipeline.name,
        environment,
        triggeredBy: profileName
      });
      setIsModalOpen(false);
      setVersion('');
      showSuccessToast(`Release queued: ${formatDisplayName(result.pipeline, result.pipeline)} run ${result.runId || result.id} for ${environment}`);
    } catch (err) {
      showErrorToast(`Queue request failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050816] text-[#dfe1f6] overflow-x-hidden font-body-md select-text">
      {/* Background Layer */}
      <AuroraBackground />

      {/* SideNavBar */}
      <Sidebar onLaunchModalTrigger={() => setIsModalOpen(true)} profile={profile} initials={initials} role={profileRole} />

      {/* TopNavBar */}
      <Navbar profile={profile} initials={initials} role={profileRole} />

      {/* Nested Route Pages */}
      <Outlet />

      {/* Footer */}
      <Footer />

      {/* Release launch modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-gutter backdrop-blur-3xl overflow-hidden modal-active"
          id="modal-overlay"
          style={{ display: 'flex', opacity: 1 }}
        >
          {/* Liquid Metal Shader Canvas Background */}
          <LiquidMetalShader />

          {/* Modal Container with three-d wireframe */}
          <div className="modal-3d-entrance relative w-full max-w-2xl metallic-border glass-panel rounded-2xl p-0 shadow-2xl border-white/20 z-10">
            {/* Projecting 3D wireframe box in background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
              <ThreeDBox />
            </div>

            {/* Modal Content */}
            <div className="relative z-10 p-glass-padding font-mono text-on-surface">
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                <div>
                  <h3 className="font-display-lg text-3xl text-primary-fixed tracking-tight">
                    Queue Azure Pipeline
                  </h3>
                  <p className="font-label-mono text-xs text-on-surface-variant/60 mt-1 uppercase">
                    Run a real Azure DevOps pipeline using the server-side PAT
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleLaunchSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">
                      Service Node
                    </label>
                    <select
                      value={selectedPipelineId}
                      onChange={(e) => setSelectedPipelineId(e.target.value)}
                      disabled={pipelinesLoading || pipelines.length === 0}
                      className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm bg-surface-container-high/90 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                    >
                      {pipelinesLoading && <option className="bg-surface text-on-surface" value="">Loading Azure pipelines...</option>}
                      {!pipelinesLoading && pipelines.length === 0 && <option className="bg-surface text-on-surface" value="">No Azure pipelines found</option>}
                      {pipelines.map((pipeline) => (
                        <option key={pipeline.id} className="bg-surface text-on-surface" value={pipeline.id}>
                          {pipeline.displayName || pipeline.name}
                        </option>
                      ))}
                    </select>
                    {pipelinesError && (
                      <p className="text-[10px] text-error px-1">{pipelinesError}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 flex flex-col">
                    <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">
                      Environment
                    </label>
                    <select 
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm bg-surface-container-high/90 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                    >
                      <option className="bg-surface text-on-surface" value="Production">PRODUCTION</option>
                      <option className="bg-surface text-on-surface" value="Canary">CANARY</option>
                      <option className="bg-surface text-on-surface" value="Staging">STAGING</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">
                    Commit Hash / Version
                  </label>
                  <input 
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="Azure run note, branch, or release version"
                    className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="p-4 rounded-xl bg-primary-container/5 border border-primary-container/20 flex gap-4">
                  <span className="material-symbols-outlined text-primary-fixed">security</span>
                  <div>
                    <p className="text-xs font-medium text-primary-fixed">Automated Safety Checks Enabled</p>
                    <p className="text-[11px] text-on-surface-variant/60 leading-relaxed mt-1">
                      The backend will queue the selected Azure pipeline using the server-side PAT. Azure DevOps remains the source of truth for approvals, gates, and run status.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-white/10 rounded-xl font-label-mono text-xs hover:bg-white/5 transition-all text-on-surface"
                  >
                    CANCEL INITIATION
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting || pipelinesLoading || !selectedPipeline}
                    className="flex-1 py-4 bg-primary-container text-on-primary-container rounded-xl font-bold text-sm shadow-[0_0_30px_rgba(0,242,255,0.3)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    {submitting ? 'ROUTING RELEASE...' : 'CONFIRM LAUNCH'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProtectedLayout;
