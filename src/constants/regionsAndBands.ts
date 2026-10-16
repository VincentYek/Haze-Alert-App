import { SingaporeRegion, RegionInfo, PsiBandLevel, PsiBand } from '../types/psi';

export const SINGAPORE_REGIONS: Record<SingaporeRegion, RegionInfo> = {
  national: {
    id: 'national',
    name: 'Singapore (Overall)',
    shortName: 'National',
    estates: ['Whole Island', 'Islandwide Average'],
    lat: 1.3521,
    lng: 103.8198,
    mapCoords: { x: 300, y: 190 },
  },
  central: {
    id: 'central',
    name: 'Central Region',
    shortName: 'Central',
    estates: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Orchard', 'Novena', 'Bukit Merah'],
    lat: 1.3573,
    lng: 103.82,
    mapCoords: { x: 295, y: 185 },
  },
  north: {
    id: 'north',
    name: 'Northern Region',
    shortName: 'North',
    estates: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Marsiling'],
    lat: 1.418,
    lng: 103.82,
    mapCoords: { x: 290, y: 105 },
  },
  south: {
    id: 'south',
    name: 'Southern Region',
    shortName: 'South',
    estates: ['Marina Bay', 'Tanjong Pagar', 'Sentosa', 'Telok Blangah', 'Pasir Panjang'],
    lat: 1.2958,
    lng: 103.82,
    mapCoords: { x: 295, y: 260 },
  },
  east: {
    id: 'east',
    name: 'Eastern Region',
    shortName: 'East',
    estates: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Paya Lebar', 'Marine Parade'],
    lat: 1.3571,
    lng: 103.94,
    mapCoords: { x: 440, y: 175 },
  },
  west: {
    id: 'west',
    name: 'Western Region',
    shortName: 'West',
    estates: ['Jurong East', 'Jurong West', 'Tuas', 'Clementi', 'Bukit Batok', 'Choa Chu Kang'],
    lat: 1.3573,
    lng: 103.7,
    mapCoords: { x: 145, y: 195 },
  },
};

export const PSI_BANDS: Record<PsiBandLevel, PsiBand> = {
  good: {
    level: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    textColor: 'text-emerald-400',
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    colorHex: '#10b981',
    description: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
    healthImpact: 'Normal outdoor activities can continue for everyone.',
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate',
    min: 51,
    max: 100,
    textColor: 'text-sky-400',
    bgLight: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    colorHex: '#0ea5e9',
    description: 'Air quality is acceptable. Very few sensitive people may experience minor discomfort.',
    healthImpact: 'Normal outdoor activities can continue for general public and vulnerable groups.',
  },
  unhealthy: {
    level: 'unhealthy',
    label: 'Unhealthy',
    min: 101,
    max: 200,
    textColor: 'text-amber-400',
    bgLight: 'bg-amber-500/15',
    borderColor: 'border-amber-500/40',
    colorHex: '#f59e0b',
    description: 'Aggravation of symptoms in persons with heart or lung ailments; irritation in healthy persons.',
    healthImpact: 'Healthy persons: reduce prolonged strenuous outdoor exertion. Vulnerable groups: minimise outdoor exertion.',
  },
  very_unhealthy: {
    level: 'very_unhealthy',
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    textColor: 'text-rose-400',
    bgLight: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40',
    colorHex: '#f43f5e',
    description: 'Significant aggravation of symptoms and reduced exercise tolerance in persons with lung/heart diseases.',
    healthImpact: 'Healthy persons: avoid prolonged strenuous outdoor exertion. Vulnerable groups: stay indoors.',
  },
  hazardous: {
    level: 'hazardous',
    label: 'Hazardous',
    min: 301,
    max: 500,
    textColor: 'text-purple-400',
    bgLight: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    colorHex: '#a855f7',
    description: 'Premature onset of illnesses. Serious aggravation of symptoms in elderly and ill persons.',
    healthImpact: 'Everyone: avoid outdoor exertion. Stay indoors with windows closed and air cleaners operating.',
  },
};

export function getPsiBand(value: number): PsiBand {
  if (value <= 50) return PSI_BANDS.good;
  if (value <= 100) return PSI_BANDS.moderate;
  if (value <= 200) return PSI_BANDS.unhealthy;
  if (value <= 300) return PSI_BANDS.very_unhealthy;
  return PSI_BANDS.hazardous;
}

export function getPm25Band(value: number): { label: string; color: string; desc: string } {
  if (value <= 55) {
    return { label: 'Normal (Band I)', color: 'text-emerald-400', desc: '0 - 55 µg/m³' };
  }
  if (value <= 150) {
    return { label: 'Elevated (Band II)', color: 'text-amber-400', desc: '56 - 150 µg/m³' };
  }
  if (value <= 250) {
    return { label: 'High (Band III)', color: 'text-rose-400', desc: '151 - 250 µg/m³' };
  }
  return { label: 'Very High (Band IV)', color: 'text-purple-400', desc: '> 250 µg/m³' };
}
