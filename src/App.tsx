/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SingaporeRegion,
  HourlyReading,
  NotificationSettings,
  AlertNotificationItem,
} from './types/psi';
import {
  fetchLiveSingaporePsi,
  generateHistorical24hReadings,
  PRESET_SCENARIOS,
  CurrentPsiData,
} from './services/psiApi';
import { getPsiBand, SINGAPORE_REGIONS } from './constants/regionsAndBands';
import { broadcastAlert } from './services/notificationService';
import { TopBar } from './components/TopBar';
import { HeroMetricCard } from './components/HeroMetricCard';
import { SingaporeMap } from './components/SingaporeMap';
import { HourlyTrendChart } from './components/HourlyTrendChart';
import { PollutantGrid } from './components/PollutantGrid';
import { HealthAdvisory } from './components/HealthAdvisory';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { InAppToastContainer } from './components/InAppToastContainer';
import { BackendIntegrationGuide } from './components/BackendIntegrationGuide';
import {
  Sliders,
  CheckCircle2,
  AlertOctagon,
  Flame,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  permission:
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default',
  psiThreshold: 100, // Official Singapore NEA Unhealthy boundary
  pm25ThresholdEnabled: true,
  pm25Threshold: 55, // 1-hr PM2.5 elevated boundary
  regions: ['national', 'north', 'south', 'east', 'west', 'central'],
  soundEnabled: true,
  quietHoursEnabled: false,
  quietStart: '23:00',
  quietEnd: '07:00',
  morningBriefing: false,
};

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState<SingaporeRegion>('national');
  const [activeView, setActiveView] = useState<string>('overview');
  const [data, setData] = useState<CurrentPsiData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('breathesg_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [alertHistory, setAlertHistory] = useState<AlertNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('breathesg_alert_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track last alerted PSI value to prevent spamming duplicate alerts on identical readings
  const [lastAlertedPsi, setLastAlertedPsi] = useState<number | null>(null);

  // Register service worker on startup for push capabilities
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('BreatheSG service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service worker registration skipped:', err);
        });
    }
  }, []);

  // Save settings to localStorage
  const handleSaveSettings = (newSettings: NotificationSettings) => {
    setNotificationSettings(newSettings);
    try {
      localStorage.setItem('breathesg_settings', JSON.stringify(newSettings));
    } catch {
      // localStorage might be disabled
    }
  };

  // Record an alert to history
  const addAlertToHistory = useCallback((alert: AlertNotificationItem) => {
    setAlertHistory((prev) => {
      const updated = [alert, ...prev.slice(0, 19)];
      try {
        localStorage.setItem('breathesg_alert_history', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Evaluate threshold breach and dispatch alert
  const checkThresholdAndAlert = useCallback(
    (currentPsi: number, pm25: number, region: SingaporeRegion) => {
      const isBreached =
        currentPsi >= notificationSettings.psiThreshold ||
        (notificationSettings.pm25ThresholdEnabled && pm25 >= notificationSettings.pm25Threshold);

      if (isBreached && lastAlertedPsi !== currentPsi) {
        const band = getPsiBand(currentPsi);
        const alertItem: AlertNotificationItem = {
          id: `alert-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: `⚠️ Singapore Air Quality Alert: ${band.label}`,
          message: `${SINGAPORE_REGIONS[region].name} 24-hr PSI has reached ${currentPsi} (Limit: ${notificationSettings.psiThreshold}). Limit strenuous outdoor activity.`,
          region,
          psiValue: currentPsi,
          severity: band.level,
          read: false,
        };

        broadcastAlert(alertItem, notificationSettings.soundEnabled);
        addAlertToHistory(alertItem);
        setLastAlertedPsi(currentPsi);
      }
    },
    [notificationSettings, lastAlertedPsi, addAlertToHistory]
  );

  // Fetch live PSI data from data.gov.sg
  const loadLiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchLiveSingaporePsi();
      setData(result);
      const psi = result.psi24h[selectedRegion];
      const pm25 = result.pm25OneHour[selectedRegion];
      checkThresholdAndAlert(psi, pm25, selectedRegion);
    } catch (e) {
      console.error('Failed to load PSI:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRegion, checkThresholdAndAlert]);

  // Initial load
  useEffect(() => {
    loadLiveData();
    // Poll every 3 minutes
    const interval = setInterval(loadLiveData, 180000);
    return () => clearInterval(interval);
  }, [loadLiveData]);

  // Apply simulation preset
  const applyPreset = (key: keyof typeof PRESET_SCENARIOS) => {
    const preset = PRESET_SCENARIOS[key];
    if (!data) return;

    const simulatedData: CurrentPsiData = {
      ...data,
      isSimulated: true,
      scenarioName: preset.name,
      timestamp: new Date().toISOString(),
      psi24h: { ...preset.psi },
      pm25OneHour: { ...preset.pm25 },
      pm25TwentyFourHour: {
        national: Math.round(preset.pm25.national * 0.9),
        north: Math.round(preset.pm25.north * 0.9),
        south: Math.round(preset.pm25.south * 0.9),
        east: Math.round(preset.pm25.east * 0.9),
        west: Math.round(preset.pm25.west * 0.9),
        central: Math.round(preset.pm25.central * 0.9),
      },
    };

    setData(simulatedData);
    const psi = simulatedData.psi24h[selectedRegion];
    const pm25 = simulatedData.pm25OneHour[selectedRegion];
    checkThresholdAndAlert(psi, pm25, selectedRegion);
  };

  // Generate 24-hr historical hourly readings for the selected region
  const hourlyData = useMemo(() => {
    if (!data) return [];
    const currentPsi = data.psi24h[selectedRegion];
    const currentPm25 = data.pm25OneHour[selectedRegion];
    return generateHistorical24hReadings(currentPsi, currentPm25);
  }, [data, selectedRegion]);

  const currentPsi = data ? data.psi24h[selectedRegion] : 50;
  const currentPm25 = data ? data.pm25OneHour[selectedRegion] : 20;
  const isAlarmActive =
    currentPsi >= notificationSettings.psiThreshold ||
    (notificationSettings.pm25ThresholdEnabled && currentPm25 >= notificationSettings.pm25Threshold);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Bar Contract (1 row, 3 zones, gap-8) */}
      <TopBar
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view);
          const el = document.getElementById(view);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOpenNotifications={() => setIsSettingsOpen(true)}
        notificationSettings={notificationSettings}
        isAlarmActive={isAlarmActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Interactive Scenario Testing Bar */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-slate-200">Alert Testing Bar:</span>
            <span className="text-slate-400 hidden md:inline">
              Simulate haze surges to verify real push notification behavior:
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={loadLiveData}
              className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 ${
                data && !data.isSimulated
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-teal-400" />
              <span>Live Singapore Gov</span>
            </button>

            <button
              onClick={() => applyPreset('moderate')}
              className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <CloudSun className="w-3 h-3 text-sky-400" />
              <span>Normal (Moderate)</span>
            </button>

            <button
              onClick={() => applyPreset('unhealthyAlert')}
              className="px-2.5 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1.5"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Spike &gt; 100 PSI (Trigger Alert)</span>
            </button>

            <button
              onClick={() => applyPreset('severeHaze')}
              className="px-2.5 py-1 rounded text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Severe Haze (&gt; 200 PSI)</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Rules</span>
            </button>
          </div>
        </div>

        {/* Hero Metric Section (Section id: overview) */}
        {data ? (
          <div id="overview" className="scroll-mt-20">
            <HeroMetricCard
              selectedRegion={selectedRegion}
              psiReadings={data.psi24h}
              pm25OneHourReadings={data.pm25OneHour}
              pm25TwentyFourHourReadings={data.pm25TwentyFourHour}
              timestamp={data.timestamp}
              isSimulated={data.isSimulated}
              isLoading={isLoading}
              onRefresh={loadLiveData}
              onSimulateHaze={() => applyPreset('unhealthyAlert')}
              onOpenSettings={() => setIsSettingsOpen(true)}
              notificationSettings={notificationSettings}
            />
          </div>
        ) : (
          <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/50 animate-pulse flex items-center justify-center">
            <span className="text-slate-500 text-sm font-mono">Fetching Singapore NEA air quality telemetry...</span>
          </div>
        )}

        {/* 2-Column Split: Interactive Map & 24h Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Map (Section id: map) */}
          <div id="map" className="scroll-mt-20 flex flex-col">
            {data && (
              <SingaporeMap
                selectedRegion={selectedRegion}
                onSelectRegion={(reg) => {
                  setSelectedRegion(reg);
                  checkThresholdAndAlert(data.psi24h[reg], data.pm25OneHour[reg], reg);
                }}
                psiReadings={data.psi24h}
                pm25Readings={data.pm25OneHour}
              />
            )}
          </div>

          {/* 24-hr Hourly Trend (Section id: trends) */}
          <div id="trends" className="scroll-mt-20 flex flex-col">
            <HourlyTrendChart
              selectedRegion={selectedRegion}
              hourlyData={hourlyData}
              psiThreshold={notificationSettings.psiThreshold}
            />
          </div>
        </div>

        {/* Sub-Pollutants Breakdown Grid */}
        {data && (
          <div>
            <PollutantGrid selectedRegion={selectedRegion} data={data} />
          </div>
        )}

        {/* Official MOH & NEA Health Advisory Matrix (Section id: advisory) */}
        <div id="advisory" className="scroll-mt-20">
          <HealthAdvisory
            currentPsi={currentPsi}
            currentPm25={currentPm25}
            psiLevel={getPsiBand(currentPsi).level}
          />
        </div>

        {/* Serverless Backend Integration Guide (Section id: backend) */}
        <div id="backend" className="scroll-mt-20">
          <BackendIntegrationGuide />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-6 px-4 sm:px-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">BreatheSG</span>
            <span>·</span>
            <span>Live Singapore Air Quality Tracker & Haze Alert System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="https://data.gov.sg/datasets/d_e0e7a2c6d48c084f74d081b95ffab896/view"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-teal-400 transition flex items-center gap-1"
            >
              <span>NEA data.gov.sg Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white transition"
            >
              Notification Settings
            </button>
            <span className="font-mono text-slate-600">v1.0.0 (Front-End Decoupled)</span>
          </div>
        </div>
      </footer>

      {/* In-App Live Toast Stack */}
      <InAppToastContainer />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={notificationSettings}
        onSaveSettings={handleSaveSettings}
        alertHistory={alertHistory}
        onClearHistory={() => {
          setAlertHistory([]);
          try {
            localStorage.removeItem('breathesg_alert_history');
          } catch {
            // ignore
          }
        }}
        currentPsi={currentPsi}
      />
    </div>
  );
}
