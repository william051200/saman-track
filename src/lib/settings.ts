import { Settings, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'saman-track:settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      hourlyRate:
        typeof parsed.hourlyRate === 'number' && parsed.hourlyRate >= 0
          ? parsed.hourlyRate
          : DEFAULT_SETTINGS.hourlyRate,
      peakWindowHours:
        typeof parsed.peakWindowHours === 'number' && parsed.peakWindowHours >= 0
          ? parsed.peakWindowHours
          : DEFAULT_SETTINGS.peakWindowHours,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
