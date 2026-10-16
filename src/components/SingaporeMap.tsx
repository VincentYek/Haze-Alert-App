import React from 'react';
import { SingaporeRegion, ReadingItem } from '../types/psi';
import { SINGAPORE_REGIONS, getPsiBand } from '../constants/regionsAndBands';
import { MapPin, Info } from 'lucide-react';

interface SingaporeMapProps {
  selectedRegion: SingaporeRegion;
  onSelectRegion: (region: SingaporeRegion) => void;
  psiReadings: ReadingItem;
  pm25Readings: ReadingItem;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  selectedRegion,
  onSelectRegion,
  psiReadings,
  pm25Readings,
}) => {
  // Region SVG outlines mapped to a 600x380 viewport
  const regionsSvgPaths: Record<Exclude<SingaporeRegion, 'national'>, string> = {
    // North: Woodlands, Yishun, Sembawang along Johor Strait down to Mandai
    north: 'M 210,65 C 240,48 290,45 350,55 C 385,62 390,95 380,120 C 355,130 330,135 295,140 C 265,145 235,135 210,120 C 195,100 195,80 210,65 Z',
    
    // West: Tuas, Jurong, Clementi, Choa Chu Kang
    west: 'M 40,240 C 35,210 70,170 120,135 C 160,110 200,115 215,135 C 220,170 210,210 195,245 C 175,270 140,285 95,280 C 60,275 45,260 40,240 Z',
    
    // Central: Ang Mo Kio, Bishan, Toa Payoh, Novena, Bukit Timah
    central: 'M 215,135 C 255,140 295,140 330,135 C 360,140 375,170 370,200 C 360,225 330,240 295,245 C 260,250 230,240 215,225 C 205,195 205,160 215,135 Z',
    
    // East: Tampines, Bedok, Pasir Ris, Changi
    east: 'M 350,75 C 410,75 490,115 545,140 C 565,155 570,175 550,195 C 500,220 440,230 390,225 C 365,220 365,170 370,145 C 375,120 360,95 350,75 Z',
    
    // South: Marina Bay, Sentosa, Telok Blangah, Tanjong Pagar
    south: 'M 205,240 C 235,245 285,250 340,240 C 380,230 400,245 385,270 C 365,295 315,310 260,305 C 215,300 185,280 180,265 C 190,250 195,245 205,240 Z',
  };

  const interactiveRegions: Array<Exclude<SingaporeRegion, 'national'>> = [
    'north',
    'west',
    'central',
    'east',
    'south',
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            Interactive Regional Air Quality Map
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any zone to focus analytics and advisory. Live 24-hr PSI & 1-hr PM2.5 readings.
          </p>
        </div>

        {/* Region Quick Selector Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 p-1 bg-slate-950/80 rounded-lg border border-slate-800/80">
          {(['national', 'north', 'south', 'east', 'west', 'central'] as SingaporeRegion[]).map((reg) => {
            const isSelected = selectedRegion === reg;
            const psi = psiReadings[reg];
            const band = getPsiBand(psi);
            return (
              <button
                key={reg}
                onClick={() => onSelectRegion(reg)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{SINGAPORE_REGIONS[reg].shortName}</span>
                <span
                  className="font-mono text-[10px] font-semibold px-1 rounded"
                  style={{
                    backgroundColor: `${band.colorHex}22`,
                    color: band.colorHex,
                  }}
                >
                  {psi}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[420px] bg-gradient-to-b from-slate-950/90 to-slate-900/90 rounded-lg border border-slate-800/60 overflow-hidden flex items-center justify-center p-2">
        <svg
          viewBox="0 0 600 360"
          className="w-full h-full select-none"
          style={{ filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4))' }}
        >
          {/* Surrounding Sea / Straits of Malacca & Johor subtle grid pattern */}
          <defs>
            <pattern id="seaGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="600" height="360" fill="url(#seaGrid)" />

          {/* Johor / Malaysia northern border indicator line */}
          <path
            d="M 120,30 Q 300,10 480,25"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
            opacity="0.6"
          />
          <text x="300" y="22" fill="#475569" fontSize="10" textAnchor="middle" letterSpacing="1">
            MALAYSIA (JOHOR)
          </text>

          {/* Singapore Strait label */}
          <text x="300" y="345" fill="#475569" fontSize="10" textAnchor="middle" letterSpacing="1">
            SINGAPORE STRAIT
          </text>

          {/* Offshore Islands (Jurong Island, Sentosa, Pulau Ubin, Pulau Tekong) */}
          {/* Jurong Island */}
          <path
            d="M 140,285 C 160,280 185,290 180,310 C 160,320 135,310 130,295 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1"
          />
          <text x="155" y="300" fill="#64748b" fontSize="8" textAnchor="middle">
            Jurong Is.
          </text>

          {/* Sentosa */}
          <path
            d="M 285,315 C 305,310 325,312 320,324 C 300,328 280,325 285,315 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1"
          />
          <text x="305" y="322" fill="#64748b" fontSize="7" textAnchor="middle">
            Sentosa
          </text>

          {/* Pulau Ubin & Tekong */}
          <path
            d="M 470,70 C 490,65 510,75 500,85 C 480,88 465,80 470,70 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1"
          />
          <path
            d="M 525,60 C 545,55 560,70 550,85 C 530,90 515,75 525,60 Z"
            fill="#1e293b"
            stroke="#334155"
            strokeWidth="1"
          />
          <text x="515" y="60" fill="#64748b" fontSize="7" textAnchor="middle">
            P. Ubin / Tekong
          </text>

          {/* Main 5 Regional Boundaries */}
          {interactiveRegions.map((reg) => {
            const isSelected = selectedRegion === reg;
            const psi = psiReadings[reg];
            const band = getPsiBand(psi);
            const path = regionsSvgPaths[reg];

            return (
              <g
                key={reg}
                className="cursor-pointer transition-all duration-200 group"
                onClick={() => onSelectRegion(reg)}
              >
                <path
                  d={path}
                  fill={isSelected ? `${band.colorHex}30` : '#0f172a'}
                  stroke={isSelected ? band.colorHex : '#334155'}
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  className="transition-all duration-200 hover:fill-slate-800/80"
                  style={{
                    filter: isSelected ? `drop-shadow(0 0 12px ${band.colorHex}55)` : 'none',
                  }}
                />
              </g>
            );
          })}

          {/* Region Marker Pins and Badges */}
          {interactiveRegions.map((reg) => {
            const isSelected = selectedRegion === reg;
            const psi = psiReadings[reg];
            const pm25 = pm25Readings[reg];
            const band = getPsiBand(psi);
            const info = SINGAPORE_REGIONS[reg];
            const { x, y } = info.mapCoords;

            return (
              <g
                key={`badge-${reg}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => onSelectRegion(reg)}
                className="cursor-pointer select-none"
              >
                {/* Ping circle when selected */}
                {isSelected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={band.colorHex}
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Badge Card */}
                <rect
                  x="-46"
                  y="-22"
                  width="92"
                  height="44"
                  rx="6"
                  fill="#090d16"
                  stroke={isSelected ? band.colorHex : '#334155'}
                  strokeWidth={isSelected ? '2' : '1'}
                  opacity="0.95"
                />

                {/* Region Name */}
                <text
                  x="0"
                  y="-6"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="600"
                  letterSpacing="0.5"
                >
                  {info.shortName.toUpperCase()}
                </text>

                {/* PSI & PM2.5 Values */}
                <text
                  x="-8"
                  y="12"
                  textAnchor="middle"
                  fill={band.colorHex}
                  fontSize="14"
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {psi}
                </text>
                <text
                  x="20"
                  y="12"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {pm25} µg
                </text>
                <text
                  x="-8"
                  y="18"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="6"
                >
                  PSI
                </text>
                <text
                  x="20"
                  y="18"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="6"
                >
                  PM2.5
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend / Status Pill In Bottom-Left Corner */}
        <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2 text-xs backdrop-blur-md hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-slate-300">Good (0-50)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span className="text-slate-300">Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-slate-300 font-semibold text-amber-400">Unhealthy (101-200)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span className="text-slate-300">Very Unhealthy (201-300)</span>
          </div>
        </div>

        {/* Selected Region Quick Banner */}
        <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs backdrop-blur-md flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400">Viewing:</span>
          <span className="font-semibold text-slate-200">
            {SINGAPORE_REGIONS[selectedRegion].name}
          </span>
        </div>
      </div>
    </div>
  );
};
