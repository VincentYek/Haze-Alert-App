export type SingaporeRegion = 'national' | 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionInfo {
  id: SingaporeRegion;
  name: string;
  shortName: string;
  estates: string[];
  lat: number;
  lng: number;
  mapCoords: { x: number; y: number };
}

export type PsiBandLevel = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface PsiBand {
  level: PsiBandLevel;
  label: string;
  min: number;
  max: number;
  textColor: string;
  bgLight: string;
  borderColor: string;
  colorHex: string;
  description: string;
  healthImpact: string;
}

export interface ReadingItem {
  national: number;
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
}

export interface PsiApiResponse {
  api_info: {
    status: string;
  };
  region_metadata: Array<{
    name: string;
    label_location: {
      latitude: number;
      longitude: number;
    };
  }>;
  items: Array<{
    timestamp: string;
    update_timestamp: string;
    readings: {
      o3_sub_index: ReadingItem;
      pm10_twenty_four_hourly: ReadingItem;
      pm10_sub_index: ReadingItem;
      co_sub_index: ReadingItem;
      pm25_twenty_four_hourly: ReadingItem;
      so2_sub_index: ReadingItem;
      co_eight_hour_max: ReadingItem;
      no2_one_hour_max: ReadingItem;
      so2_twenty_four_hourly: ReadingItem;
      pm25_sub_index: ReadingItem;
      psi_twenty_four_hourly: ReadingItem;
      o3_eight_hour_max: ReadingItem;
      pm25_one_hour?: ReadingItem;
    };
  }>;
}

export interface HourlyReading {
  hour: string; // e.g., '14:00'
  timestamp: string;
  psi: number;
  pm25OneHour: number;
  pm25TwentyFourHour: number;
  pm10: number;
  band: PsiBandLevel;
}

export interface AlertNotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  region: SingaporeRegion;
  psiValue: number;
  severity: PsiBandLevel;
  read: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission;
  psiThreshold: number; // default 100 (Unhealthy)
  pm25ThresholdEnabled: boolean;
  pm25Threshold: number; // default 55 (Elevated)
  regions: SingaporeRegion[];
  soundEnabled: boolean;
  quietHoursEnabled: boolean;
  quietStart: string; // "23:00"
  quietEnd: string; // "07:00"
  morningBriefing: boolean; // 08:00 AM daily
}
