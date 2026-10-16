import React, { useState, useEffect } from 'react';
import {
  NotificationSettings,
  SingaporeRegion,
  AlertNotificationItem,
} from '../types/psi';
import { SINGAPORE_REGIONS } from '../constants/regionsAndBands';
import {
  requestBrowserNotificationPermission,
  sendBrowserPushNotification,
  broadcastAlert,
} from '../services/notificationService';
import {
  X,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  Code2,
  Copy,
  Check,
  Send,
  Trash2,
} from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (newSettings: NotificationSettings) => void;
  alertHistory: AlertNotificationItem[];
  onClearHistory: () => void;
  currentPsi: number;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  alertHistory,
  onClearHistory,
  currentPsi,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history' | 'backend'>('settings');
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );
  const [testSent, setTestSent] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setPermissionState(perm);
    const updated = {
      ...localSettings,
      permission: perm,
      enabled: perm === 'granted',
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleToggleRegion = (reg: SingaporeRegion) => {
    const exists = localSettings.regions.includes(reg);
    let updatedRegions: SingaporeRegion[];
    if (exists) {
      if (localSettings.regions.length === 1) return; // keep at least one
      updatedRegions = localSettings.regions.filter((r) => r !== reg);
    } else {
      updatedRegions = [...localSettings.regions, reg];
    }
    const updated = { ...localSettings, regions: updatedRegions };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const handleTestAlert = () => {
    setTestSent(true);
    const testAlert: AlertNotificationItem = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title: '🚨 Test Singapore PSI Alert',
      message: `Simulated air alert: Singapore 24-hr PSI has reached ${Math.max(
        105,
        localSettings.psiThreshold
      )} (Unhealthy threshold). Consider limiting outdoor exertion.`,
      region: localSettings.regions[0] || 'national',
      psiValue: Math.max(105, localSettings.psiThreshold),
      severity: 'unhealthy',
      read: false,
    };

    broadcastAlert(testAlert, localSettings.soundEnabled);
    setTimeout(() => setTestSent(false), 2500);
  };

  const handleThresholdChange = (val: number) => {
    const updated = { ...localSettings, psiThreshold: val };
    setLocalSettings(updated);
    onSaveSettings(updated);
  };

  const serverlessCodeExample = `// Example Serverless Cloud Function (AWS Lambda / Google Cloud Function)
// Scheduled to run every 15-30 minutes via Cloud Scheduler or Cron

import webpush from 'web-push';

export async function handler(event) {
  // 1. Fetch live Singapore PSI from NEA
  const res = await fetch('https://api.data.gov.sg/v1/environment/psi');
  const data = await res.json();
  const latest = data.items[0];
  const psiMap = latest.readings.psi_twenty_four_hourly;

  // 2. Query your subscriber list from database
  // const subscribers = await db.query('SELECT * FROM subscriptions WHERE active = true');

  for (const region of ['national', 'north', 'south', 'east', 'west', 'central']) {
    const currentVal = psiMap[region];
    
    // Check if reading breaches Unhealthy threshold (PSI > 100)
    if (currentVal >= 101) {
      const payload = JSON.stringify({
        title: \`⚠️ Air Quality Alert: \${region.toUpperCase()} PSI is \${currentVal}\`,
        body: 'Unhealthy air detected. Sensitive persons should reduce strenuous outdoor exertion.',
        icon: '/icon.svg',
        data: { region, psi: currentVal, timestamp: latest.timestamp }
      });

      // Dispatch WebPush to subscribers of this region
      // await webpush.sendNotification(subscriber.subscription, payload);
    }
  }

  return { statusCode: 200, body: 'Checked Singapore PSI' };
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Push Alert Settings</h2>
              <p className="text-xs text-slate-400">
                Configure instant alerts when Singapore PSI exceeds safe limits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'settings'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Alert Rules
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'history'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Alert Log ({alertHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'backend'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Serverless Backend Contract
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'settings' && (
            <>
              {/* Permission Banner */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      permissionState === 'granted'
                        ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
                        : permissionState === 'denied'
                        ? 'bg-rose-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Browser Notification Permission:{' '}
                      <span className="capitalize">{permissionState}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {permissionState === 'granted'
                        ? 'Desktop and mobile system banners are fully enabled.'
                        : permissionState === 'denied'
                        ? 'Notifications were blocked in your browser settings.'
                        : 'Allow notifications to receive instant haze warnings.'}
                    </div>
                  </div>
                </div>

                {permissionState !== 'granted' && (
                  <button
                    onClick={handleRequestPermission}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    Enable Browser Push
                  </button>
                )}
              </div>

              {/* Threshold Slider */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block">
                      PSI Alert Threshold
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Notify whenever 24-hr PSI reaches or exceeds this number.
                    </span>
                  </div>
                  <div className="font-mono text-lg font-bold text-teal-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded">
                    {localSettings.psiThreshold} PSI
                  </div>
                </div>

                <input
                  type="range"
                  min="50"
                  max="250"
                  step="5"
                  value={localSettings.psiThreshold}
                  onChange={(e) => handleThresholdChange(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Preset triggers:</span>
                  <button
                    onClick={() => handleThresholdChange(80)}
                    className={`px-2 py-0.5 text-[11px] rounded border ${
                      localSettings.psiThreshold === 80
                        ? 'bg-slate-800 border-teal-500 text-teal-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    80 (Sensitive)
                  </button>
                  <button
                    onClick={() => handleThresholdChange(100)}
                    className={`px-2 py-0.5 text-[11px] rounded border ${
                      localSettings.psiThreshold === 100
                        ? 'bg-slate-800 border-amber-500 text-amber-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    100 (NEA Unhealthy - Recommended)
                  </button>
                  <button
                    onClick={() => handleThresholdChange(150)}
                    className={`px-2 py-0.5 text-[11px] rounded border ${
                      localSettings.psiThreshold === 150
                        ? 'bg-slate-800 border-rose-500 text-rose-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    150 (High Haze)
                  </button>
                </div>
              </div>

              {/* 1-hr PM2.5 Trigger Toggle */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    1-Hour PM2.5 Rapid Alert (&gt; 55 µg/m³)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Sends early warnings before 24-hr PSI averages catch up to sudden smoke plumes.
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = {
                      ...localSettings,
                      pm25ThresholdEnabled: !localSettings.pm25ThresholdEnabled,
                    };
                    setLocalSettings(updated);
                    onSaveSettings(updated);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    localSettings.pm25ThresholdEnabled ? 'bg-teal-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      localSettings.pm25ThresholdEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Monitored Regions */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 space-y-2">
                <label className="text-xs font-semibold text-slate-200 block">
                  Regions to Monitor
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['national', 'north', 'south', 'east', 'west', 'central'] as SingaporeRegion[]).map(
                    (reg) => {
                      const isChecked = localSettings.regions.includes(reg);
                      return (
                        <button
                          key={reg}
                          onClick={() => handleToggleRegion(reg)}
                          className={`px-3 py-2 text-xs rounded-lg border flex items-center justify-between transition-colors ${
                            isChecked
                              ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                          }`}
                        >
                          <span>{SINGAPORE_REGIONS[reg].shortName}</span>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Sound & Tone Setting */}
              <div className="p-4 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                    {localSettings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Audio Chime</div>
                    <div className="text-[11px] text-slate-400">
                      Play acoustic chime when threshold is breached.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const updated = {
                      ...localSettings,
                      soundEnabled: !localSettings.soundEnabled,
                    };
                    setLocalSettings(updated);
                    onSaveSettings(updated);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    localSettings.soundEnabled ? 'bg-teal-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      localSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Test Action */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={handleTestAlert}
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5 text-teal-400" />
                  <span>{testSent ? 'Alert Dispatched!' : 'Send Test Push Alert Now'}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Showing recorded push alert notifications for this session.
                </span>
                {alertHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear History
                  </button>
                )}
              </div>

              {alertHistory.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No air quality alerts recorded yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Alerts trigger automatically when 24-hr PSI exceeds {localSettings.psiThreshold}.
                  </p>
                  <button
                    onClick={handleTestAlert}
                    className="mt-3 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3 text-teal-400" />
                    Trigger Sample Alert
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {alertHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200">{item.title}</span>
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                            {item.psiValue} PSI
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{item.message}</p>
                        <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                          {new Date(item.timestamp).toLocaleString('en-SG')} · Region:{' '}
                          {SINGAPORE_REGIONS[item.region].name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-lg border border-teal-500/30 bg-teal-500/5 text-xs text-slate-300">
                <span className="font-semibold text-teal-400 block mb-1">
                  Ready for Serverless Backend Integration
                </span>
                The frontend stores alert preferences in local state / IndexedDB and is pre-configured
                to exchange standard WebPush credentials (`PushSubscription`) with your future
                serverless endpoint (Cloudflare Workers, AWS Lambda, Supabase, or Google Cloud Functions).
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">
                    Cron Polling Worker (Node.js / TypeScript)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(serverlessCodeExample);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {serverlessCodeExample}
                </pre>
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Official Data Source:</span>{' '}
                <code className="text-teal-400">https://api.data.gov.sg/v1/environment/psi</code>
                <p className="mt-1">
                  Provides public, free JSON endpoints with CORS enabled, updated hourly by the Singapore
                  National Environment Agency (NEA).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Current Islandwide PSI:{' '}
            <strong className="text-slate-200 font-mono">{currentPsi}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
