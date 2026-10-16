import React, { useState } from 'react';
import { Copy, Check, Terminal, Server, Bell, CheckCircle2, CloudLightning } from 'lucide-react';

export const BackendIntegrationGuide: React.FC = () => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const cloudflareWorkerSnippet = `// Cloudflare Worker: cron-singapore-psi-alert.ts
export default {
  // Triggered every 15 minutes by Cloudflare Cron Triggers ("*/15 * * * *")
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const res = await fetch('https://api.data.gov.sg/v1/environment/psi');
    const { items } = await res.json();
    const psiData = items[0].readings.psi_twenty_four_hourly;

    for (const [region, psi] of Object.entries(psiData)) {
      if (typeof psi === 'number' && psi >= 101) {
        // PSI reached Unhealthy threshold!
        await dispatchWebPushAlert({
          title: \`⚠️ Air Quality Alert: \${region.toUpperCase()} PSI is \${psi}\`,
          body: 'Unhealthy air level detected. Sensitive persons should limit strenuous outdoor activity.',
          icon: '/icon.svg',
          data: { region, psi, url: '/' }
        }, env);
      }
    }
  }
};`;

  const awsLambdaSnippet = `// AWS Lambda / Node.js 20 ESM
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:alerts@breathesg.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const handler = async (event) => {
  const res = await fetch('https://api.data.gov.sg/v1/environment/psi');
  const data = await res.json();
  const latestReadings = data.items[0].readings.psi_twenty_four_hourly;

  // Query user subscription objects stored from the front-end
  // const subs = await getStoredSubscriptions();

  console.log('Current Singapore PSI Levels:', latestReadings);
  return { statusCode: 200, body: JSON.stringify(latestReadings) };
};`;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-teal-400" />
            Serverless Backend Connection Guide
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            The frontend is decoupled and ready to connect to your preferred serverless architecture.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-lg text-teal-300 text-xs font-semibold">
          <CloudLightning className="w-3.5 h-3.5" />
          <span>Front-End Decoupled & Ready</span>
        </div>
      </div>

      {/* Active Endpoints Live Status */}
      <div className="p-4 rounded-lg bg-slate-950/70 border border-teal-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-teal-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Active Serverless Endpoints Mounted in /api</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live serverless functions located at root level <code className="text-slate-300">/api/psi.ts</code> and <code className="text-slate-300">/api/health.ts</code> (No API key required).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
            >
              /api/health ↗
            </a>
            <a
              href="/api/psi"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 text-xs font-mono bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 rounded border border-teal-500/40"
            >
              /api/psi ↗
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-emerald-400 font-bold">GET /api/health</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Returns uptime, status, and health indicators for serverless hosting.
            </p>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-teal-400 font-bold">GET /api/psi</span>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Pulls live data from <code className="text-slate-300">https://api-open.data.gov.sg/v2/realtime/api/psi</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Step Architecture Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-mono text-xs">
              1
            </span>
            <span>Subscribe Endpoint</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Front-end registers service worker and sends <code className="text-teal-400">PushSubscription</code> JSON to your <code className="text-teal-400">POST /api/subscribe</code> endpoint.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-mono text-xs">
              2
            </span>
            <span>Serverless PSI Ingestion</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calls <code className="text-teal-400">api-open.data.gov.sg/v2/realtime/api/psi</code> with zero API key requirement to retrieve latest readings.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1">
            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-mono text-xs">
              3
            </span>
            <span>Threshold Dispatch</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            When PSI &ge; threshold (e.g. 101 Unhealthy), backend fires WebPush payload via VAPID keys to target subscribers.
          </p>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">
                Option A: Cloudflare Worker (Zero Cold-Start Cron)
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(cloudflareWorkerSnippet, 'cf')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
            >
              {copiedSnippet === 'cf' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {cloudflareWorkerSnippet}
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-200">
                Option B: AWS Lambda / Google Cloud Run (Node.js 20)
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(awsLambdaSnippet, 'aws')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
            >
              {copiedSnippet === 'aws' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {awsLambdaSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
