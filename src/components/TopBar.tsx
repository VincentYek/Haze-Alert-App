import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';
import { NotificationSettings } from '../types/psi';

interface TopBarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onOpenNotifications: () => void;
  notificationSettings: NotificationSettings;
  isAlarmActive: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  onOpenNotifications,
  notificationSettings,
  isAlarmActive,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('overview');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block ring-2 ring-teal-400/30" />
          <span>BreatheSG</span>
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavigate('overview')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'overview' ? 'text-teal-400 font-semibold' : ''
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('map')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'map' ? 'text-teal-400 font-semibold' : ''
            }`}
          >
            Region Map
          </button>
          <button
            onClick={() => onNavigate('trends')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'trends' ? 'text-teal-400 font-semibold' : ''
            }`}
          >
            24h Trends
          </button>
          <button
            onClick={() => onNavigate('advisory')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'advisory' ? 'text-teal-400 font-semibold' : ''
            }`}
          >
            Health Advisory
          </button>
          <button
            onClick={() => onNavigate('backend')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
              activeView === 'backend' ? 'text-teal-400 font-semibold' : ''
            }`}
          >
            Backend Spec
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNotifications}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              isAlarmActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 animate-pulse'
                : notificationSettings.permission === 'granted'
                ? 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
            }`}
          >
            {isAlarmActive ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            <span>
              {isAlarmActive
                ? 'Haze Alert Active'
                : notificationSettings.permission === 'granted'
                ? `Alerts On (>${notificationSettings.psiThreshold} PSI)`
                : 'Configure Alerts'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
