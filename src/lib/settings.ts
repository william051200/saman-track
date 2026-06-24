import { Settings, DEFAULT_SETTINGS } from '../types';

const SETTINGS_KEY = 'saman-track:settings';

/** Validate an "HH:mm" 24h time string. */
function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ratePer30Min:
        typeof parsed.ratePer30Min === 'number' && parsed.ratePer30Min >= 0
          ? parsed.ratePer30Min
          : DEFAULT_SETTINGS.ratePer30Min,
      payStart: isValidTime(parsed.payStart) ? parsed.payStart : DEFAULT_SETTINGS.payStart,
      payEnd: isValidTime(parsed.payEnd) ? parsed.payEnd : DEFAULT_SETTINGS.payEnd,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
