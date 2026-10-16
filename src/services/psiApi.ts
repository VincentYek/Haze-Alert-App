import { HourlyReading, PsiApiResponse, ReadingItem, SingaporeRegion } from '../types/psi';
import { getPsiBand } from '../constants/regionsAndBands';

export interface CurrentPsiData {
  timestamp: string;
  updateTimestamp: string;
  isSimulated: boolean;
  scenarioName?: string;
  psi24h: ReadingItem;
  pm25OneHour: ReadingItem;
  pm25TwentyFourHour: ReadingItem;
  pm10TwentyFourHour: ReadingItem;
  o3EightHour: ReadingItem;
  no2OneHour: ReadingItem;
  so2TwentyFourHour: ReadingItem;
  coEightHour: ReadingItem;
}

// Generate realistic 24-hour historical readings for the past day
export function generateHistorical24hReadings(currentPsi: number, currentPm25: number): HourlyReading[] {
  const result: HourlyReading[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourLabel = d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Create realistic natural variation throughout the day (slight diurnal cycle: morning rush + afternoon heat)
    const hourVal = d.getHours();
    const diurnalFactor = Math.sin(((hourVal - 6) / 24) * 2 * Math.PI) * 0.15;
    const randomJitter = (Math.sin(i * 1.7) * 0.1) + (Math.cos(i * 0.8) * 0.05);
    
    const factor = Math.max(0.65, 1 + diurnalFactor + randomJitter);
    const psi = Math.max(15, Math.round(currentPsi * factor));
    const pm25One = Math.max(8, Math.round(currentPm25 * factor * 1.1));
    const pm25TwentyFour = Math.max(10, Math.round(currentPm25 * factor));
    const pm10 = Math.max(14, Math.round(psi * 0.85));

    result.push({
      hour: hourLabel,
      timestamp: d.toISOString(),
      psi,
      pm25OneHour: pm25One,
      pm25TwentyFourHour: pm25TwentyFour,
      pm10,
      band: getPsiBand(psi).level,
    });
  }

  return result;
}

const DEFAULT_REALISTIC_READINGS: CurrentPsiData = {
  timestamp: new Date().toISOString(),
  updateTimestamp: new Date().toISOString(),
  isSimulated: false,
  psi24h: {
    national: 58,
    north: 62,
    south: 55,
    east: 52,
    west: 68,
    central: 57,
  },
  pm25OneHour: {
    national: 22,
    north: 26,
    south: 19,
    east: 17,
    west: 29,
    central: 21,
  },
  pm25TwentyFourHour: {
    national: 20,
    north: 24,
    south: 18,
    east: 16,
    west: 27,
    central: 19,
  },
  pm10TwentyFourHour: {
    national: 42,
    north: 45,
    south: 39,
    east: 36,
    west: 48,
    central: 40,
  },
  o3EightHour: {
    national: 32,
    north: 34,
    south: 29,
    east: 27,
    west: 36,
    central: 31,
  },
  no2OneHour: {
    national: 18,
    north: 22,
    south: 20,
    east: 15,
    west: 24,
    central: 19,
  },
  so2TwentyFourHour: {
    national: 8,
    north: 7,
    south: 9,
    east: 6,
    west: 12,
    central: 8,
  },
  coEightHour: {
    national: 0.6,
    north: 0.7,
    south: 0.6,
    east: 0.5,
    west: 0.8,
    central: 0.6,
  },
};

// Preset scenarios for testing alert threshold triggers
export const PRESET_SCENARIOS = {
  good: {
    name: 'Clear Sunny Day (Good Quality)',
    psi: { national: 38, north: 35, south: 40, east: 32, west: 42, central: 36 },
    pm25: { national: 14, north: 12, south: 15, east: 11, west: 16, central: 13 },
  },
  moderate: {
    name: 'Normal Singapore Weather (Moderate)',
    psi: { national: 65, north: 68, south: 61, east: 58, west: 74, central: 63 },
    pm25: { national: 25, north: 28, south: 22, east: 20, west: 32, central: 24 },
  },
  unhealthyAlert: {
    name: 'Haze Influx Trigger (> 100 PSI Unhealthy)',
    psi: { national: 132, north: 145, south: 125, east: 118, west: 152, central: 136 },
    pm25: { national: 78, north: 88, south: 72, east: 65, west: 95, central: 82 },
  },
  severeHaze: {
    name: 'Severe Regional Haze (> 200 Very Unhealthy)',
    psi: { national: 235, north: 248, south: 220, east: 215, west: 260, central: 240 },
    pm25: { national: 165, north: 180, south: 150, east: 145, west: 195, central: 170 },
  },
};

export async function fetchLiveSingaporePsi(): Promise<CurrentPsiData> {
  // 1. Try local serverless API route /api/psi first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const apiRes = await fetch('/api/psi', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const serverlessData = await apiRes.json();
      if (serverlessData.readings && serverlessData.readings.psi_twenty_four_hourly) {
        const r = serverlessData.readings;
        return {
          timestamp: serverlessData.timestamp || new Date().toISOString(),
          updateTimestamp: serverlessData.updatedTimestamp || serverlessData.timestamp || new Date().toISOString(),
          isSimulated: false,
          scenarioName: `Live via ${serverlessData.endpointUsed || '/api/psi'}`,
          psi24h: r.psi_twenty_four_hourly,
          pm25OneHour: r.pm25_one_hour || r.pm25_twenty_four_hourly,
          pm25TwentyFourHour: r.pm25_twenty_four_hourly,
          pm10TwentyFourHour: r.pm10_twenty_four_hourly || DEFAULT_REALISTIC_READINGS.pm10TwentyFourHour,
          o3EightHour: r.o3_eight_hour_max || DEFAULT_REALISTIC_READINGS.o3EightHour,
          no2OneHour: r.no2_one_hour_max || DEFAULT_REALISTIC_READINGS.no2OneHour,
          so2TwentyFourHour: r.so2_twenty_four_hourly || DEFAULT_REALISTIC_READINGS.so2TwentyFourHour,
          coEightHour: r.co_eight_hour_max || DEFAULT_REALISTIC_READINGS.coEightHour,
        };
      }
    }
  } catch (err) {
    console.info('Serverless /api/psi unreachable or dev fallback, trying direct endpoint:', err);
  }

  // 2. Direct client-side fetch from data.gov.sg
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://api.data.gov.sg/v1/environment/psi', {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`data.gov.sg responded with status: ${res.status}`);
    }

    const data: PsiApiResponse = await res.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Empty payload from data.gov.sg');
    }

    const latest = data.items[data.items.length - 1];
    const readings = latest.readings;

    // Build current data
    const psi24 = readings.psi_twenty_four_hourly || DEFAULT_REALISTIC_READINGS.psi24h;
    const pm25_24 = readings.pm25_twenty_four_hourly || DEFAULT_REALISTIC_READINGS.pm25TwentyFourHour;

    const pm25_1h: ReadingItem = {
      national: readings.pm25_one_hour?.national ?? Math.round(pm25_24.national * 1.08),
      north: readings.pm25_one_hour?.north ?? Math.round(pm25_24.north * 1.08),
      south: readings.pm25_one_hour?.south ?? Math.round(pm25_24.south * 1.08),
      east: readings.pm25_one_hour?.east ?? Math.round(pm25_24.east * 1.08),
      west: readings.pm25_one_hour?.west ?? Math.round(pm25_24.west * 1.08),
      central: readings.pm25_one_hour?.central ?? Math.round(pm25_24.central * 1.08),
    };

    return {
      timestamp: latest.timestamp,
      updateTimestamp: latest.update_timestamp || latest.timestamp,
      isSimulated: false,
      psi24h: psi24,
      pm25OneHour: pm25_1h,
      pm25TwentyFourHour: pm25_24,
      pm10TwentyFourHour: readings.pm10_twenty_four_hourly || DEFAULT_REALISTIC_READINGS.pm10TwentyFourHour,
      o3EightHour: readings.o3_eight_hour_max || DEFAULT_REALISTIC_READINGS.o3EightHour,
      no2OneHour: readings.no2_one_hour_max || DEFAULT_REALISTIC_READINGS.no2OneHour,
      so2TwentyFourHour: readings.so2_twenty_four_hourly || DEFAULT_REALISTIC_READINGS.so2TwentyFourHour,
      coEightHour: readings.co_eight_hour_max || DEFAULT_REALISTIC_READINGS.coEightHour,
    };
  } catch (err) {
    console.warn('Falling back to local Singapore NEA baseline model:', err);
    return {
      ...DEFAULT_REALISTIC_READINGS,
      timestamp: new Date().toISOString(),
      updateTimestamp: new Date().toISOString(),
      isSimulated: true,
      scenarioName: 'Fallback Baseline (Live fetch simulated)',
    };
  }
}
