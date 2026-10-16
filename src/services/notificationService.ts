import { AlertNotificationItem, PsiBandLevel, SingaporeRegion } from '../types/psi';

// Synthesize pleasant, clean acoustic chimes via Web Audio API
export function playAlertSound(level: PsiBandLevel = 'unhealthy') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    if (level === 'unhealthy' || level === 'very_unhealthy' || level === 'hazardous') {
      // Alert chime: Two-tone urgent bell
      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

      osc2.frequency.setValueAtTime(440.0, now); // A4
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } else {
      // Pleasant info chime (single crystal note)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc1.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.4);
    }
  } catch {
    // Audio might fail in autoplay restricted scenarios
  }
}

// Request real browser notification permission
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

// Send real native browser notification if granted
export function sendBrowserPushNotification(title: string, options: NotificationOptions) {
  if (!('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          ...options,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
      });
    } else {
      new Notification(title, {
        ...options,
        icon: '/icon.svg',
      });
    }
    return true;
  } catch (err) {
    console.warn('Native notification failed:', err);
    return false;
  }
}

// Global in-app toast event listener setup
type ToastListener = (alert: AlertNotificationItem) => void;
const listeners: Set<ToastListener> = new Set();

export function subscribeToInAppAlerts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function broadcastAlert(alert: AlertNotificationItem, soundEnabled = true) {
  if (soundEnabled) {
    playAlertSound(alert.severity);
  }

  // Attempt real browser notification
  sendBrowserPushNotification(alert.title, {
    body: alert.message,
    tag: `psi-${alert.region}-${Date.now()}`,
    data: { region: alert.region, psi: alert.psiValue },
  });

  // Notify active UI toast listeners
  listeners.forEach((listener) => {
    try {
      listener(alert);
    } catch (e) {
      console.error(e);
    }
  });
}
