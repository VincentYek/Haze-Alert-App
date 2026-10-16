import React, { useState, useEffect } from 'react';
import { AlertNotificationItem } from '../types/psi';
import { subscribeToInAppAlerts } from '../services/notificationService';
import { SINGAPORE_REGIONS, getPsiBand } from '../constants/regionsAndBands';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const InAppToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<AlertNotificationItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToInAppAlerts((alert) => {
      setToasts((prev) => [alert, ...prev.slice(0, 3)]); // Keep up to 4 toasts
    });
    return unsubscribe;
  }, []);

  const handleDismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const band = getPsiBand(toast.psiValue);
        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl border border-slate-700 bg-slate-900/95 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-200"
            style={{ borderLeftColor: band.colorHex, borderLeftWidth: '4px' }}
          >
            <div className="p-2 rounded-lg bg-slate-800 shrink-0">
              {toast.psiValue > 100 ? (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-teal-400" />
              )}
            </div>

            <div className="flex-1 pr-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{toast.title}</span>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: `${band.colorHex}22`,
                    color: band.colorHex,
                  }}
                >
                  {toast.psiValue} PSI
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">{toast.message}</p>
              <span className="text-[10px] text-slate-500 mt-1.5 block font-mono">
                {SINGAPORE_REGIONS[toast.region]?.shortName || 'Singapore'} ·{' '}
                {new Date(toast.timestamp).toLocaleTimeString('en-SG')}
              </span>
            </div>

            <button
              onClick={() => handleDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
