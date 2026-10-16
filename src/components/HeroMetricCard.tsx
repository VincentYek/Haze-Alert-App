import React from 'react';
import { SingaporeRegion, ReadingItem, NotificationSettings } from '../types/psi';
import { SINGAPORE_REGIONS, getPsiBand, getPm25Band } from '../constants/regionsAndBands';
import { Bell, BellRing, RefreshCw, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

interface HeroMetricCardProps {
  selectedRegion: SingaporeRegion;
  psiReadings: ReadingItem;
  pm25OneHourReadings: ReadingItem;
  pm25TwentyFourHourReadings: ReadingItem;
  timestamp: string;
  isSimulated: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onSimulateHaze: () => void;
  onOpenSettings: () => void;
  notificationSettings: NotificationSettings;
}

export const HeroMetricCard: React.FC<HeroMetricCardProps> = ({
  selectedRegion,
  psiReadings,
  pm25OneHourReadings,
  pm25TwentyFourHourReadings,
  timestamp,
  isSimulated,
  isLoading,
  onRefresh,
  onSimulateHaze,
  onOpenSettings,
  notificationSettings,
}) => {
  const currentPsi = psiReadings[selectedRegion];
  const pm25One = pm25OneHourReadings[selectedRegion];
  const pm25TwentyFour = pm25TwentyFourHourReadings[selectedRegion];
  
  const psiBand = getPsiBand(currentPsi);
  const pm25Band = getPm25Band(pm25One);
  const regionInfo = SINGAPORE_REGIONS[selectedRegion];

  // Gauge calculation for PSI (0 - 300 scale)
  const maxScale = 300;
  const percentage = Math.min(100, Math.round((currentPsi / maxScale) * 100));
  const strokeDashoffset = 440 - (440 * percentage) / 100;

  // Threshold breach status
  const isPsiThresholdBreached = currentPsi >= notificationSettings.psiThreshold;
  const isPm25Breached = notificationSettings.pm25ThresholdEnabled && pm25One >= notificationSettings.pm25Threshold;
  const isAlarmActive = isPsiThresholdBreached || isPm25Breached;

  const formattedTime = new Date(timestamp).toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-md">
      {/* Background ambient gradient glow mapped to current air quality band */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{ backgroundColor: psiBand.colorHex }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Region title, estates & primary gauge */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Circular Radial Gauge */}
          <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
            <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#1e293b"
                strokeWidth="12"
              />
              {/* Progress */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={psiBand.colorHex}
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Value in center */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-white tabular-nums">
                {currentPsi}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                24-hr PSI
              </span>
            </div>
          </div>

          {/* Region details and Status Description */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {regionInfo.name}
              </h1>
              {isSimulated && (
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  Simulation Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Key areas: {regionInfo.estates.join(', ')}
            </p>

            {/* Air Quality Band Tag & Health Impact */}
            <div className="mt-3 flex items-center flex-wrap gap-2">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold ${psiBand.bgLight} ${psiBand.borderColor} border`}
                style={{ color: psiBand.colorHex }}
              >
                {currentPsi > 100 ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>Air Quality: {psiBand.label}</span>
              </div>

              <div className="text-xs text-slate-400">
                Updated at <span className="font-mono text-slate-200">{formattedTime} SGT</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mt-2 max-w-xl leading-relaxed">
              {psiBand.healthImpact}
            </p>
          </div>
        </div>

        {/* Right: Real-time 1-hr PM2.5, Notification Status & Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-72">
          {/* 1-hr PM2.5 Card */}
          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-medium">1-Hour PM2.5 (Real-Time)</div>
              <div className="text-[11px] text-slate-500">Most sensitive haze indicator</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xl font-bold text-slate-100 tabular-nums">
                {pm25One} <span className="text-xs font-normal text-slate-400">µg/m³</span>
              </div>
              <div className={`text-[11px] font-medium ${pm25Band.color}`}>
                {pm25Band.label}
              </div>
            </div>
          </div>

          {/* Active Push Alert Banner / Breach Alert */}
          <div
            className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
              isAlarmActive
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isAlarmActive ? (
                <BellRing className="w-4 h-4 text-rose-400 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-teal-400" />
              )}
              <div>
                <div className="text-xs font-semibold">
                  {isAlarmActive ? 'Alert Threshold Exceeded!' : 'Push Alert Monitoring'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isAlarmActive
                    ? `Reading (${currentPsi}) ≥ Limit (${notificationSettings.psiThreshold})`
                    : `Threshold set at ${notificationSettings.psiThreshold} PSI`}
                </div>
              </div>
            </div>
            <button
              onClick={onOpenSettings}
              className="text-xs font-medium text-teal-400 hover:text-teal-300 underline underline-offset-2 shrink-0 ml-2"
            >
              Config
            </button>
          </div>

          {/* Action Buttons: Simulate Spike & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSimulateHaze}
              className="flex-1 px-3 py-2 text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              title="Test the push notification trigger by setting PSI > 100"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Haze Spike</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Fetch latest data from data.gov.sg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
