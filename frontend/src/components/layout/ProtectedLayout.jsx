import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import AuroraBackground from '../effects/AuroraBackground';
import LiquidMetalShader from '../effects/LiquidMetalShader';
import ThreeDBox from '../effects/ThreeDBox';
import { showSuccessToast, showErrorToast } from '../feedback/ToastMessage';
import { PIPELINES, ENVIRONMENTS } from '../../utils/constants';
import useDeployments from '../../hooks/useDeployments';

export const ProtectedLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { triggerDeployment } = useDeployments(1, 5);

  // Form states
  const [serviceNode, setServiceNode] = useState('Core-Engine-X');
  const [environment, setEnvironment] = useState('PRODUCTION');
  const [version, setVersion] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleLaunchSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await triggerDeployment({
        version: version || 'build-v2.4.0-stable',
        pipeline: serviceNode,
        environment: environment.charAt(0) + environment.slice(1).toLowerCase(),
        triggeredBy: 'Cmdr. Vane'
      });
      setIsModalOpen(false);
      setVersion('');
      showSuccessToast(`Orbital Release command accepted: ${serviceNode} launched to ${environment}`);
    } catch (err) {
      showErrorToast(`Launch aborted: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#050816] text-[#dfe1f6] overflow-x-hidden font-body-md select-text">
      {/* Background Layer */}
      <AuroraBackground />

      {/* SideNavBar */}
      <Sidebar onLaunchModalTrigger={() => setIsModalOpen(true)} />

      {/* TopNavBar */}
      <Navbar />

      {/* Nested Route Pages */}
      <Outlet />

      {/* Footer */}
      <Footer />

      {/* WebGL-Shader Simulated Modal Overlay */}
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
                    Initiate Orbital Release
                  </h3>
                  <p className="font-label-mono text-xs text-on-surface-variant/60 mt-1 uppercase">
                    Protocol: AETHER-SIGMA-9
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
                      value={serviceNode}
                      onChange={(e) => setServiceNode(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm bg-surface-container-high/90 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none cursor-pointer"
                    >
                      {PIPELINES.map((p, idx) => (
                        <option key={idx} className="bg-surface text-on-surface" value={p}>{p}</option>
                      ))}
                    </select>
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
                      <option className="bg-surface text-on-surface" value="PRODUCTION">PRODUCTION</option>
                      <option className="bg-surface text-on-surface" value="CANARY">CANARY</option>
                      <option className="bg-surface text-on-surface" value="STAGING">STAGING</option>
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
                    placeholder="e.g. build-v2.4.0-stable"
                    className="w-full glass-input rounded-xl px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="p-4 rounded-xl bg-primary-container/5 border border-primary-container/20 flex gap-4">
                  <span className="material-symbols-outlined text-primary-fixed">security</span>
                  <div>
                    <p className="text-xs font-medium text-primary-fixed">Automated Safety Checks Enabled</p>
                    <p className="text-[11px] text-on-surface-variant/60 leading-relaxed mt-1">
                      System will perform canary analysis for 15 minutes post-deployment. Rollback triggered if MTTR exceeds 20min.
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
