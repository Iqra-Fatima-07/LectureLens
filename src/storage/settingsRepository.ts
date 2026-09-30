import { getDB } from './db';
import { Telemetry, BenchmarkResult, UserProfile } from '../types';

export interface AppSettings {
  localOnlyMode: boolean;
  selectedModel: 'whisper-tiny' | 'whisper-base';
  preferredLanguage: 'auto' | 'en' | 'hi';
  darkMode: boolean;
  autoScrollTranscript: boolean;
  playbackSpeed: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  localOnlyMode: false,
  selectedModel: 'whisper-tiny',
  preferredLanguage: 'auto',
  darkMode: false,
  autoScrollTranscript: true,
  playbackSpeed: 1.0,
};

export const settingsRepository = {
  async getSettings(): Promise<AppSettings> {
    try {
      const db = await getDB();
      const stored = await db.get('settings', 'app_preferences');
      return { ...DEFAULT_SETTINGS, ...(stored?.value || {}) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    const db = await getDB();
    await db.put('settings', { key: 'app_preferences', value: updated });
    return updated;
  },

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const db = await getDB();
      const record = await db.get('settings', 'user_profile');
      return record ? record.value : null;
    } catch {
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile | null): Promise<void> {
    const db = await getDB();
    if (profile) {
      await db.put('settings', { key: 'user_profile', value: profile });
    } else {
      await db.delete('settings', 'user_profile');
    }
  },

  async logTelemetry(item: Telemetry): Promise<void> {
    const db = await getDB();
    const id = `telemetry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await db.put('telemetry', { ...item, id });
  },

  async getRecentTelemetry(limit = 20): Promise<Telemetry[]> {
    try {
      const db = await getDB();
      const all = await db.getAllFromIndex('telemetry', 'by-measuredAt');
      return all.reverse().slice(0, limit);
    } catch {
      return [];
    }
  },

  async saveBenchmark(benchmark: BenchmarkResult): Promise<void> {
    const db = await getDB();
    await db.put('benchmarks', benchmark);
  },

  async getBenchmarks(): Promise<BenchmarkResult[]> {
    try {
      const db = await getDB();
      return await db.getAll('benchmarks');
    } catch {
      return [];
    }
  },
};
