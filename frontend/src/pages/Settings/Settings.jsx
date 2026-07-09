import React, { useState, useEffect, useCallback, useRef } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import useTheme from '../../hooks/useTheme';
import { showSuccessToast, showErrorToast, showSystemToast } from '../../components/feedback/ToastMessage';
import api from '../../services/api';

const DEFAULTS = {
  apiUrl: 'http://localhost:5000/api',
  autoRefresh: true,
  refreshInterval: '5',
  slackAlerts: false,
  slackWebhookUrl: '',
  dfLimit: '24.5',
  ltLimit: '1.2',
  cfrLimit: '0.8',
  mttrLimit: '18',
};

const loadSetting = (key, fallback) => {
  const val = localStorage.getItem(key);
  return val !== null ? val : fallback;
};

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  // ── Connection Health ──
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // unknown, checking, connected, failed
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // ── Config States ──
  const [apiUrl, setApiUrl] = useState(() => loadSetting('dora_api_url', DEFAULTS.apiUrl));
  const [autoRefresh, setAutoRefresh] = useState(() => loadSetting('dora_auto_refresh', 'true') === 'true');
  const [refreshInterval, setRefreshInterval] = useState(() => loadSetting('dora_refresh_interval', DEFAULTS.refreshInterval));
  const [slackAlerts, setSlackAlerts] = useState(() => loadSetting('dora_slack_alerts', 'false') === 'true');
  const [slackWebhookUrl, setSlackWebhookUrl] = useState(() => loadSetting('dora_slack_webhook_url', DEFAULTS.slackWebhookUrl));

  // ── DORA Thresholds ──
  const [dfLimit, setDfLimit] = useState(() => loadSetting('dora_df_limit', DEFAULTS.dfLimit));
  const [ltLimit, setLtLimit] = useState(() => loadSetting('dora_lt_limit', DEFAULTS.ltLimit));
  const [cfrLimit, setCfrLimit] = useState(() => loadSetting('dora_cfr_limit', DEFAULTS.cfrLimit));
  const [mttrLimit, setMttrLimit] = useState(() => loadSetting('dora_mttr_limit', DEFAULTS.mttrLimit));

  // ── Validation Errors ──
  const [errors, setErrors] = useState({});

  // ── Saving State ──
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ── Track initial load values for dirty detection ──
  const initialValues = useRef({});
  useEffect(() => {
    initialValues.current = {
      apiUrl: loadSetting('dora_api_url', DEFAULTS.apiUrl),
      autoRefresh: loadSetting('dora_auto_refresh', 'true') === 'true',
      refreshInterval: loadSetting('dora_refresh_interval', DEFAULTS.refreshInterval),
      slackAlerts: loadSetting('dora_slack_alerts', 'false') === 'true',
      slackWebhookUrl: loadSetting('dora_slack_webhook_url', DEFAULTS.slackWebhookUrl),
      dfLimit: loadSetting('dora_df_limit', DEFAULTS.dfLimit),
      ltLimit: loadSetting('dora_lt_limit', DEFAULTS.ltLimit),
      cfrLimit: loadSetting('dora_cfr_limit', DEFAULTS.cfrLimit),
      mttrLimit: loadSetting('dora_mttr_limit', DEFAULTS.mttrLimit),
    };
  }, []);

  // ── Dirty detection ──
  useEffect(() => {
    const currentValues = { apiUrl, autoRefresh, refreshInterval, slackAlerts, slackWebhookUrl, dfLimit, ltLimit, cfrLimit, mttrLimit };
    const isDirty = Object.keys(currentValues).some(key => String(currentValues[key]) !== String(initialValues.current[key]));
    setHasUnsavedChanges(isDirty);
  }, [apiUrl, autoRefresh, refreshInterval, slackAlerts, slackWebhookUrl, dfLimit, ltLimit, cfrLimit, mttrLimit]);

  // ── Connection test ──
  const testConnection = useCallback(async () => {
    setConnectionStatus('checking');
    setConnectionDetails(null);
    try {
      const baseUrl = apiUrl || DEFAULTS.apiUrl;
      const res = await api.get('/health', {
        baseURL: baseUrl,
        timeout: 8000,
        validateStatus: (status) => status < 600
      });
      const data = res.data;
      setConnectionStatus(data.azureConnected ? 'connected' : 'failed');
      setConnectionDetails(data);
      setLastChecked(new Date());
      if (data.azureConnected) {
        showSuccessToast('Connection verified — Azure DevOps link active');
      } else {
        showErrorToast(`Connection failed: ${data.diagnostics}`);
      }
    } catch (err) {
      setConnectionStatus('failed');
      setConnectionDetails({ diagnostics: err?.message || 'Could not reach the backend server.' });
      setLastChecked(new Date());
      showErrorToast('Connection failed — backend server unreachable');
    }
  }, [apiUrl]);

  // ── Auto-test connection on mount ──
  useEffect(() => {
    testConnection();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Validation ──
  const validate = () => {
    const newErrors = {};

    // API URL
    if (!apiUrl.trim()) {
      newErrors.apiUrl = 'API endpoint URL is required';
    } else {
      try {
        new URL(apiUrl);
      } catch {
        newErrors.apiUrl = 'Invalid URL format (e.g. http://localhost:5000/api)';
      }
    }

    // Refresh Interval
    const riVal = parseFloat(refreshInterval);
    if (isNaN(riVal) || riVal < 1 || riVal > 60) {
      newErrors.refreshInterval = 'Must be 1–60 minutes';
    }

    // DORA thresholds
    const dfVal = parseFloat(dfLimit);
    if (isNaN(dfVal) || dfVal < 0) newErrors.dfLimit = 'Must be a positive number';

    const ltVal = parseFloat(ltLimit);
    if (isNaN(ltVal) || ltVal < 0) newErrors.ltLimit = 'Must be a positive number';

    const cfrVal = parseFloat(cfrLimit);
    if (isNaN(cfrVal) || cfrVal < 0 || cfrVal > 100) newErrors.cfrLimit = 'Must be 0–100';

    const mttrVal = parseFloat(mttrLimit);
    if (isNaN(mttrVal) || mttrVal < 0) newErrors.mttrLimit = 'Must be a positive number';

    // Slack webhook
    if (slackAlerts && !slackWebhookUrl.trim()) {
      newErrors.slackWebhookUrl = 'Webhook URL required when Slack alerts are active';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Save handler ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showErrorToast('Fix validation errors before saving');
      return;
    }

    setSaving(true);
    try {
      localStorage.setItem('dora_api_url', apiUrl.trim());
      localStorage.setItem('dora_auto_refresh', autoRefresh.toString());
      localStorage.setItem('dora_refresh_interval', refreshInterval);
      localStorage.setItem('dora_slack_alerts', slackAlerts.toString());
      localStorage.setItem('dora_slack_webhook_url', slackWebhookUrl.trim());
      localStorage.setItem('dora_df_limit', dfLimit);
      localStorage.setItem('dora_lt_limit', ltLimit);
      localStorage.setItem('dora_cfr_limit', cfrLimit);
      localStorage.setItem('dora_mttr_limit', mttrLimit);

      // Update initial values ref so dirty detection resets
      initialValues.current = { apiUrl, autoRefresh, refreshInterval, slackAlerts, slackWebhookUrl, dfLimit, ltLimit, cfrLimit, mttrLimit };
      setHasUnsavedChanges(false);

      // Dispatch custom event so DashboardContext and Footer can react to changed settings
      window.dispatchEvent(new CustomEvent('dora-settings-changed'));

      // Slight delay to feel real
      await new Promise(r => setTimeout(r, 400));
      showSuccessToast('All configurations saved to local memory');
    } catch {
      showErrorToast('Failed to persist configurations');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to defaults ──
  const handleReset = () => {
    setApiUrl(DEFAULTS.apiUrl);
    setAutoRefresh(DEFAULTS.autoRefresh);
    setRefreshInterval(DEFAULTS.refreshInterval);
    setSlackAlerts(DEFAULTS.slackAlerts);
    setSlackWebhookUrl(DEFAULTS.slackWebhookUrl);
    setDfLimit(DEFAULTS.dfLimit);
    setLtLimit(DEFAULTS.ltLimit);
    setCfrLimit(DEFAULTS.cfrLimit);
    setMttrLimit(DEFAULTS.mttrLimit);
    setErrors({});
    showSystemToast('All fields reset to factory defaults — save to apply', 'System Reset');
  };

  // ── Status indicator helper ──
  const StatusDot = ({ status }) => {
    const colors = {
      unknown: 'bg-gray-400',
      checking: 'bg-yellow-400 animate-pulse',
      connected: 'bg-emerald-400',
      failed: 'bg-red-400',
    };
    return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || colors.unknown}`} />;
  };

  const statusLabel = {
    unknown: 'Not Tested',
    checking: 'Testing...',
    connected: 'Connected',
    failed: 'Connection Failed',
  };

  // ── Input component helpers ──
  const SettingsInput = ({ label, value, onChange, error, placeholder, type = 'text', disabled = false }) => (
    <div className="space-y-1.5">
      <label className="font-label-mono text-[10px] text-on-surface-variant uppercase tracking-widest px-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full glass-input rounded-xl px-4 py-3 text-on-surface text-xs focus:outline-none transition-colors ${
          error ? 'border-red-400/60 focus:border-red-400' : 'focus:border-primary-fixed/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && <p className="text-[10px] text-red-400 px-1 font-mono">{error}</p>}
    </div>
  );

  const ToggleButton = ({ active, onClick, activeLabel, inactiveLabel }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 border rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all duration-200 ${
        active
          ? 'border-primary-fixed text-primary-fixed bg-primary-container/10 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
          : 'border-white/10 hover:bg-white/5 text-on-surface-variant'
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );

  return (
    <PageContainer>
      <form onSubmit={handleSave} className="space-y-6 font-mono text-xs text-on-surface reveal-up" style={{ animationDelay: '0.1s' }}>

        {/* ── Unsaved Changes Banner ── */}
        {hasUnsavedChanges && (
          <div className="glass-panel rounded-xl px-5 py-3 border border-yellow-400/30 bg-yellow-400/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-yellow-400 text-base">warning</span>
              <span className="text-yellow-300 text-xs font-mono uppercase tracking-wider">You have unsaved changes</span>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleReset} className="px-3 py-1 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 text-on-surface-variant transition-colors">
                Reset
              </button>
              <button type="submit" disabled={saving} className="px-4 py-1 bg-primary-container/80 text-on-primary-container rounded-lg text-[10px] font-bold uppercase tracking-wider hover:brightness-110 transition-all">
                {saving ? 'Saving...' : 'Save Now'}
              </button>
            </div>
          </div>
        )}

        {/* ── Row 1: Connection Status + Azure DevOps Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Connection Status Card */}
          <div id="settings-connection" className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-fixed-dim border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">wifi_tethering</span>
              <span>Connection Status</span>
            </h3>

            <div className="flex items-center gap-3 py-2">
              <StatusDot status={connectionStatus} />
              <span className={`font-bold uppercase tracking-wider text-xs ${
                connectionStatus === 'connected' ? 'text-emerald-400' :
                connectionStatus === 'failed' ? 'text-red-400' :
                connectionStatus === 'checking' ? 'text-yellow-400' : 'text-on-surface-variant'
              }`}>
                {statusLabel[connectionStatus]}
              </span>
            </div>

            {connectionDetails?.latencyMs !== undefined && (
              <div className="flex items-center justify-between py-1 border-t border-white/5">
                <span className="text-on-surface-variant/60 text-[10px] uppercase tracking-wider">API Latency</span>
                <span className="text-primary-fixed font-bold text-xs">{connectionDetails.latencyMs}ms</span>
              </div>
            )}

            {lastChecked && (
              <div className="flex items-center justify-between py-1 border-t border-white/5">
                <span className="text-on-surface-variant/60 text-[10px] uppercase tracking-wider">Last Checked</span>
                <span className="text-on-surface text-[10px]">{lastChecked.toLocaleTimeString()}</span>
              </div>
            )}

            <button
              type="button"
              onClick={testConnection}
              disabled={connectionStatus === 'checking'}
              className="mt-auto w-full py-2.5 border border-primary-fixed/30 rounded-xl font-bold uppercase tracking-wider text-[10px] text-primary-fixed hover:bg-primary-container/10 transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">{connectionStatus === 'checking' ? 'sync' : 'speed'}</span>
              {connectionStatus === 'checking' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {/* Azure DevOps Info Card */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cloud</span>
              <span>Azure DevOps Link</span>
            </h3>

            {connectionDetails?.organization ? (
              <>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-on-surface-variant/60 text-[10px] uppercase tracking-wider">Organization</span>
                  <span className="text-on-surface font-bold text-xs">{connectionDetails.organization}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-on-surface-variant/60 text-[10px] uppercase tracking-wider">Project</span>
                  <span className="text-on-surface font-bold text-xs">{connectionDetails.project}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-on-surface-variant/60 text-[10px] uppercase tracking-wider">Gateway</span>
                  <span className={`font-bold text-xs ${connectionDetails.status === 'UP' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {connectionDetails.status === 'UP' ? 'OPERATIONAL' : 'DEGRADED'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-on-surface-variant/60 text-[10px] uppercase tracking-wider">Auth Mode</span>
                  <span className="text-on-surface font-bold text-xs">PAT (Server-Side)</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center py-6">
                <p className="text-on-surface-variant/40 text-[10px] uppercase tracking-widest text-center">
                  {connectionStatus === 'checking' ? 'Retrieving org details...' : 'Run connection test to load'}
                </p>
              </div>
            )}
          </div>

          {/* General OS Configs Card */}
          <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-fixed-dim border-b border-white/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">settings</span>
              <span>General OS Configs</span>
            </h3>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold uppercase tracking-wider">Dashboard Theme</span>
                <span className="text-[10px] text-on-surface-variant/60">Switch dark OS background and console styles</span>
              </div>
              <ToggleButton
                active={theme === 'dark'}
                onClick={toggleTheme}
                activeLabel="DARK MODE"
                inactiveLabel="LIGHT MODE"
              />
            </div>

            {/* Auto Refresh */}
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold uppercase tracking-wider">Auto Refresh</span>
                <span className="text-[10px] text-on-surface-variant/60">Poll active nodes at set interval</span>
              </div>
              <ToggleButton
                active={autoRefresh}
                onClick={() => setAutoRefresh(!autoRefresh)}
                activeLabel="ENABLED"
                inactiveLabel="DISABLED"
              />
            </div>

            {/* Refresh Interval */}
            {autoRefresh && (
              <SettingsInput
                label="Refresh Interval (Minutes)"
                value={refreshInterval}
                onChange={setRefreshInterval}
                error={errors.refreshInterval}
                placeholder="5"
                type="number"
              />
            )}

            {/* API Endpoint Input */}
            <SettingsInput
              label="Backend API URL"
              value={apiUrl}
              onChange={setApiUrl}
              error={errors.apiUrl}
              placeholder="http://localhost:5000/api"
            />
          </div>
        </div>

        {/* ── Row 2: DORA Thresholds ── */}
        <div id="settings-thresholds" className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">speed</span>
              <span>DORA Target Thresholds</span>
            </h3>
            <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-wider">
              Metrics are graded against these targets
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <SettingsInput
                label="Deploy Freq (/day)"
                value={dfLimit}
                onChange={setDfLimit}
                error={errors.dfLimit}
                placeholder="24.5"
                type="number"
              />
              <p className="text-[9px] text-on-surface-variant/40 px-1">Elite ≥ target value</p>
            </div>
            <div className="space-y-1.5">
              <SettingsInput
                label="Lead Time (hrs)"
                value={ltLimit}
                onChange={setLtLimit}
                error={errors.ltLimit}
                placeholder="1.2"
                type="number"
              />
              <p className="text-[9px] text-on-surface-variant/40 px-1">Elite ≤ target value</p>
            </div>
            <div className="space-y-1.5">
              <SettingsInput
                label="Failure Rate (%)"
                value={cfrLimit}
                onChange={setCfrLimit}
                error={errors.cfrLimit}
                placeholder="0.8"
                type="number"
              />
              <p className="text-[9px] text-on-surface-variant/40 px-1">Elite ≤ target value</p>
            </div>
            <div className="space-y-1.5">
              <SettingsInput
                label="Restore MTTR (mins)"
                value={mttrLimit}
                onChange={setMttrLimit}
                error={errors.mttrLimit}
                placeholder="18"
                type="number"
              />
              <p className="text-[9px] text-on-surface-variant/40 px-1">Elite ≤ target value</p>
            </div>
          </div>
        </div>

        {/* ── Row 3: Integration Webhooks ── */}
        <div className="glass-panel p-glass-padding rounded-xl flex flex-col gap-4 border-white/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant border-b border-white/10 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">webhook</span>
            <span>Integration Webhooks</span>
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold uppercase tracking-wider">Slack Alarm Integrations</span>
              <span className="text-[10px] text-on-surface-variant/60">Broadcast active outages directly to Slack</span>
            </div>
            <ToggleButton
              active={slackAlerts}
              onClick={() => setSlackAlerts(!slackAlerts)}
              activeLabel="ACTIVE"
              inactiveLabel="INACTIVE"
            />
          </div>

          {slackAlerts && (
            <SettingsInput
              label="Slack Webhook URL"
              value={slackWebhookUrl}
              onChange={setSlackWebhookUrl}
              error={errors.slackWebhookUrl}
              placeholder="https://hooks.slack.com/services/T.../B.../..."
            />
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="py-2.5 px-6 border border-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all"
          >
            Reset to Defaults
          </button>

          <button
            type="submit"
            disabled={saving}
            className="py-3 px-8 bg-gradient-to-r from-primary-fixed-dim to-secondary-container text-on-primary font-bold rounded-xl shadow-lg transition-all active:scale-95 text-xs font-mono uppercase tracking-widest disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                Saving...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">save</span>
                Save Configurations
              </>
            )}
          </button>
        </div>
      </form>
    </PageContainer>
  );
};
export default Settings;
