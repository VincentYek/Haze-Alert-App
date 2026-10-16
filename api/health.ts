import type { Request, Response } from 'express';

/**
 * Serverless Health Check Endpoint
 * GET /api/health
 */
export default async function healthHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'healthy',
    service: 'BreatheSG Air Quality API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime ? Math.floor(process.uptime()) : 0,
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Serverless health and status indicator',
      },
      {
        path: '/api/psi',
        method: 'GET',
        description: 'Live Singapore PSI readings from data.gov.sg (no key required)',
      },
    ],
  });
}
