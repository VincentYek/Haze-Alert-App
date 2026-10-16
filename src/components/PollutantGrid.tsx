import React from 'react';
import { CurrentPsiData } from '../services/psiApi';
import { SingaporeRegion } from '../types/psi';
import { Wind, Gauge, Droplets, Activity, ShieldAlert, CloudFog } from 'lucide-react';

interface PollutantGridProps {
  selectedRegion: SingaporeRegion;
  data: CurrentPsiData;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ selectedRegion, data }) => {
  const pm25_1h = data.pm25OneHour[selectedRegion];
  const pm25_24h = data.pm25TwentyFourHour[selectedRegion];
  const pm10 = data.pm10TwentyFourHour[selectedRegion];
  const o3 = data.o3EightHour[selectedRegion];
  const no2 = data.no2OneHour[selectedRegion];
  const so2 = data.so2TwentyFourHour[selectedRegion];
  const co = data.coEightHour[selectedRegion];

  const pollutants = [
    {
      name: '1-hr PM2.5',
      code: 'PM2.5 (1-hr)',
      value: pm25_1h,
      unit: 'µg/m³',
      icon: CloudFog,
      limit: '55 µg/m³ (Normal limit)',
      status: pm25_1h <= 55 ? 'Normal' : pm25_1h <= 150 ? 'Elevated' : 'High',
      statusColor:
        pm25_1h <= 55
          ? 'text-emerald-400'
          : pm25_1h <= 150
          ? 'text-amber-400'
          : 'text-rose-400',
      description: 'Ultra-fine haze particles from smoke & forest fires. Enters bloodstream.',
    },
    {
      name: '24-hr PM2.5',
      code: 'PM2.5 (24-hr)',
      value: pm25_24h,
      unit: 'µg/m³',
      icon: Wind,
      limit: 'WHO Guideline: 15 µg/m³',
      status: pm25_24h <= 35 ? 'Good' : pm25_24h <= 75 ? 'Moderate' : 'Unhealthy',
      statusColor:
        pm25_24h <= 35
          ? 'text-emerald-400'
          : pm25_24h <= 75
          ? 'text-sky-400'
          : 'text-amber-400',
      description: 'Daily continuous weighted exposure to fine particulate matter.',
    },
    {
      name: 'PM10 (Inhalable Particles)',
      code: 'PM10 (24-hr)',
      value: pm10,
      unit: 'µg/m³',
      icon: Gauge,
      limit: '100 µg/m³ (Moderate ceiling)',
      status: pm10 <= 50 ? 'Good' : pm10 <= 100 ? 'Moderate' : 'Unhealthy',
      statusColor:
        pm10 <= 50
          ? 'text-emerald-400'
          : pm10 <= 100
          ? 'text-sky-400'
          : 'text-amber-400',
      description: 'Dust, pollen, and larger smoke particulates trapped in upper airways.',
    },
    {
      name: 'Ozone (8-hr Max)',
      code: 'O₃',
      value: o3,
      unit: 'µg/m³',
      icon: Droplets,
      limit: '100 µg/m³ (Target limit)',
      status: o3 <= 50 ? 'Low' : o3 <= 100 ? 'Moderate' : 'Elevated',
      statusColor:
        o3 <= 50 ? 'text-emerald-400' : o3 <= 100 ? 'text-sky-400' : 'text-amber-400',
      description: 'Formed when vehicular emissions react with tropical sunlight.',
    },
    {
      name: 'Nitrogen Dioxide',
      code: 'NO₂ (1-hr)',
      value: no2,
      unit: 'µg/m³',
      icon: Activity,
      limit: '400 µg/m³ (Short-term limit)',
      status: no2 <= 100 ? 'Good' : 'Elevated',
      statusColor: no2 <= 100 ? 'text-emerald-400' : 'text-amber-400',
      description: 'Emissions from traffic and power generation plants.',
    },
    {
      name: 'Sulfur Dioxide',
      code: 'SO₂ (24-hr)',
      value: so2,
      unit: 'µg/m³',
      icon: ShieldAlert,
      limit: '50 µg/m³ (Daily ceiling)',
      status: so2 <= 20 ? 'Good' : 'Moderate',
      statusColor: so2 <= 20 ? 'text-emerald-400' : 'text-sky-400',
      description: 'Byproduct of fossil fuel combustion from shipping & refineries.',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Sub-Pollutant Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Key NEA environmental parameters measured across Singapore monitoring stations.
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          CO (8-hr Max): <span className="font-semibold text-slate-200">{co} mg/m³</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pollutants.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/50 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-800/60 text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.code}</div>
                  </div>
                </div>

                <div className={`text-xs font-semibold ${item.statusColor}`}>
                  {item.status}
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="font-mono text-xl font-bold text-slate-100 tabular-nums">
                  {item.value}{' '}
                  <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{item.limit}</div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400 leading-tight">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
