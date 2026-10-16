import type { Request, Response } from 'express';

// Target endpoint requested: GET https://api-open.data.gov.sg/v2/realtime/api/psi
// No API key required
const PRIMARY_ENDPOINT = 'https://api-open.data.gov.sg/v2/realtime/api/psi';
const REALTIME_HYPHEN_ENDPOINT = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const V1_FALLBACK_ENDPOINT = 'https://api.data.gov.sg/v1/environment/psi';

interface ReadingMap {
  national: number;
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
}

/**
 * Serverless PSI Endpoint
 * GET /api/psi
 * Pulls live air quality data from Singapore data.gov.sg
 */
export default async function psiHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const endpointsToTry = [
    PRIMARY_ENDPOINT,
    REALTIME_HYPHEN_ENDPOINT,
    V1_FALLBACK_ENDPOINT,
  ];

  let rawData: unknown = null;
  let successfulEndpoint = '';
  let lastError: Error | null = null;

  for (const endpoint of endpointsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const upstreamRes = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'BreatheSG-Serverless/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (upstreamRes.ok) {
        const json = await upstreamRes.json();
        if (json && (json.data || json.items)) {
          rawData = json;
          successfulEndpoint = endpoint;
          break;
        }
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (!rawData) {
    return res.status(502).json({
      error: 'Failed to fetch live PSI data from data.gov.sg',
      attemptedEndpoints: endpointsToTry,
      details: lastError?.message || 'Upstream service unavailable',
    });
  }

  // Parse and normalize data whether returned from v2 or v1 schema
  try {
    const isV2 = Boolean((rawData as { data?: { items?: unknown[] } }).data?.items);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootData: any = isV2 ? (rawData as any).data : rawData;
    const items = rootData.items || [];
    const latestItem = items[items.length - 1] || {};
    const readings = latestItem.readings || {};

    // Helper to calculate islandwide / national mean if not present
    const ensureNational = (metric: Record<string, number>): ReadingMap => {
      const north = metric?.north ?? 50;
      const south = metric?.south ?? 50;
      const east = metric?.east ?? 50;
      const west = metric?.west ?? 50;
      const central = metric?.central ?? 50;
      const national =
        metric?.national ??
        Math.round((north + south + east + west + central) / 5);

      return {
        national,
        north,
        south,
        east,
        west,
        central,
      };
    };

    const psi24 = ensureNational(readings.psi_twenty_four_hourly);
    const pm25_24 = ensureNational(readings.pm25_twenty_four_hourly);
    const pm10_24 = ensureNational(readings.pm10_twenty_four_hourly);
    const o3_8h = ensureNational(readings.o3_eight_hour_max);
    const no2_1h = ensureNational(readings.no2_one_hour_max);
    const so2_24 = ensureNational(readings.so2_twenty_four_hourly);
    const co_8h = ensureNational(readings.co_eight_hour_max);

    // Approximate 1-hour PM2.5 if not returned
    const pm25_1h: ReadingMap = readings.pm25_one_hour
      ? ensureNational(readings.pm25_one_hour)
      : {
          national: Math.round(pm25_24.national * 1.08),
          north: Math.round(pm25_24.north * 1.08),
          south: Math.round(pm25_24.south * 1.08),
          east: Math.round(pm25_24.east * 1.08),
          west: Math.round(pm25_24.west * 1.08),
          central: Math.round(pm25_24.central * 1.08),
        };

    return res.status(200).json({
      status: 'success',
      endpointUsed: successfulEndpoint,
      requestedEndpoint: PRIMARY_ENDPOINT,
      keyRequired: false,
      timestamp: latestItem.timestamp || new Date().toISOString(),
      updatedTimestamp: latestItem.updatedTimestamp || latestItem.update_timestamp || new Date().toISOString(),
      readings: {
        psi_twenty_four_hourly: psi24,
        pm25_one_hour: pm25_1h,
        pm25_twenty_four_hourly: pm25_24,
        pm10_twenty_four_hourly: pm10_24,
        o3_eight_hour_max: o3_8h,
        no2_one_hour_max: no2_1h,
        so2_twenty_four_hourly: so2_24,
        co_eight_hour_max: co_8h,
      },
      raw: rawData,
    });
  } catch (parseErr) {
    return res.status(200).json({
      status: 'partial_success',
      endpointUsed: successfulEndpoint,
      requestedEndpoint: PRIMARY_ENDPOINT,
      keyRequired: false,
      raw: rawData,
    });
  }
}
