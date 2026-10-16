import React, { useState } from 'react';
import { HourlyReading, SingaporeRegion } from '../types/psi';
import { SINGAPORE_REGIONS, getPsiBand } from '../constants/regionsAndBands';
import { TrendingUp, Clock, Info } from 'lucide-react';

interface HourlyTrendChartProps {
  selectedRegion: SingaporeRegion;
  hourlyData: HourlyReading[];
  psiThreshold: number;
}

export const HourlyTrendChart: React.FC<HourlyTrendChartProps> = ({
  selectedRegion,
  hourlyData,
  psiThreshold,
}) => {
  const [activeMetric, setActiveMetric] = useState<'psi' | 'pm25'>('psi');
  const [hoveredPoint, setHoveredPoint] = useState<HourlyReading | null>(null);

  const regionName = SINGAPORE_REGIONS[selectedRegion].name;

  // Compute max for chart scaling
  const maxVal = Math.max(
    140,
    ...hourlyData.map((d) => (activeMetric === 'psi' ? d.psi : d.pm25OneHour))
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            24-Hour Historical Air Quality Trend
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly progression for {regionName} with threshold trigger boundaries.
          </p>
        </div>

        {/* Metric Segmented Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveMetric('psi')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'psi'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24-hr PSI
          </button>
          <button
            onClick={() => setActiveMetric('pm25')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'pm25'
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1-hr PM2.5 (µg/m³)
          </button>
        </div>
      </div>

      {/* Threshold indicator notice */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500 inline-block border-b border-dashed border-rose-400" />
            Unhealthy Trigger ({psiThreshold} PSI)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-sky-500 inline-block" />
            Moderate Ceiling (100 PSI)
          </span>
        </div>
        <div className="text-[11px] text-slate-500">Hover bars to inspect sub-pollutants</div>
      </div>

      {/* Chart visualization */}
      <div className="relative h-48 w-full pt-6 pb-6 flex items-end gap-1.5 border-b border-slate-800">
        {/* Unhealthy threshold horizontal dashed guideline */}
        {activeMetric === 'psi' && (
          <div
            className="absolute left-0 right-0 border-b border-dashed border-rose-500/60 pointer-events-none z-10 flex items-center justify-end pr-2"
            style={{
              bottom: `${(psiThreshold / maxVal) * 100}%`,
            }}
          >
            <span className="text-[10px] font-mono text-rose-400 bg-slate-950/80 px-1 rounded -translate-y-1/2">
              Alert Level {psiThreshold}
            </span>
          </div>
        )}

        {/* 50 PSI Good boundary line */}
        {activeMetric === 'psi' && (
          <div
            className="absolute left-0 right-0 border-b border-dashed border-emerald-500/30 pointer-events-none z-0"
            style={{
              bottom: `${(50 / maxVal) * 100}%`,
            }}
          />
        )}

        {/* Bars */}
        {hourlyData.map((item, idx) => {
          const val = activeMetric === 'psi' ? item.psi : item.pm25OneHour;
          const heightPercent = Math.min(100, Math.max(12, (val / maxVal) * 100));
          const band = getPsiBand(activeMetric === 'psi' ? item.psi : item.pm25OneHour * 1.5);
          const isBreached = activeMetric === 'psi' && val >= psiThreshold;
          const isHovered = hoveredPoint?.timestamp === item.timestamp;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredPoint(item)}
              onMouseLeave={() => setHoveredPoint(null)}
              className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
            >
              {/* Bar element */}
              <div
                className="w-full rounded-t transition-all duration-200"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isHovered
                    ? '#ffffff'
                    : isBreached
                    ? '#f43f5e'
                    : band.colorHex,
                  opacity: isHovered ? 1 : 0.85,
                }}
              />

              {/* Bottom hour label on every 3rd or 4th item to avoid overlap */}
              {idx % 4 === 0 && (
                <span className="absolute -bottom-6 text-[10px] font-mono text-slate-500 whitespace-nowrap">
                  {item.hour}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover tooltip / Selected details footer */}
      <div className="mt-7 min-h-[48px] bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {hoveredPoint ? (
          <>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-semibold">{hoveredPoint.hour} SGT</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                Air Status: <span className="text-slate-200 font-medium">{getPsiBand(hoveredPoint.psi).label}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono">
              <div>
                <span className="text-slate-400">24h PSI: </span>
                <span className="font-bold text-slate-100">{hoveredPoint.psi}</span>
              </div>
              <div>
                <span className="text-slate-400">1h PM2.5: </span>
                <span className="font-bold text-teal-400">{hoveredPoint.pm25OneHour} µg/m³</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-slate-400">PM10: </span>
                <span className="font-bold text-slate-300">{hoveredPoint.pm10} µg/m³</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Hover over any hourly bar above to view exact readings and sub-pollutant levels.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
