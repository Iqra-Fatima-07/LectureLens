import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Lecture, Telemetry, BenchmarkResult } from '../types';

interface LectureLensDB extends DBSchema {
  lectures: {
    key: string;
    value: Lecture;
    indexes: { 'by-created': number; 'by-title': string };
  };
  settings: {
    key: string;
    value: any;
  };
  telemetry: {
    key: string;
    value: Telemetry & { id: string };
    indexes: { 'by-measuredAt': number };
  };
  benchmarks: {
    key: string;
    value: BenchmarkResult;
  };
}

const DB_NAME = 'lecturelens_local_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<LectureLensDB>> | null = null;

export async function getDB(): Promise<IDBPDatabase<LectureLensDB>> {
  if (!dbPromise) {
    dbPromise = openDB<LectureLensDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Lectures store
        if (!db.objectStoreNames.contains('lectures')) {
          const lectureStore = db.createObjectStore('lectures', { keyPath: 'id' });
          lectureStore.createIndex('by-created', 'createdAt');
          lectureStore.createIndex('by-title', 'title');
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        // Telemetry store
        if (!db.objectStoreNames.contains('telemetry')) {
          const telemetryStore = db.createObjectStore('telemetry', { keyPath: 'id' });
          telemetryStore.createIndex('by-measuredAt', 'measuredAt');
        }

        // Benchmarks store
        if (!db.objectStoreNames.contains('benchmarks')) {
          db.createObjectStore('benchmarks', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getStorageEstimate(): Promise<{
  usageMb: number;
  quotaMb: number;
  percentUsed: number;
  isAvailable: boolean;
}> {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      return {
        usageMb: Math.round((usage / (1024 * 1024)) * 10) / 10,
        quotaMb: Math.round((quota / (1024 * 1024)) * 10) / 10,
        percentUsed: Math.min(100, Math.round((usage / quota) * 100)),
        isAvailable: true,
      };
    } catch (e) {
      console.warn('Storage estimate failed:', e);
    }
  }
  return {
    usageMb: 0,
    quotaMb: 0,
    percentUsed: 0,
    isAvailable: false,
  };
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['lectures', 'settings', 'telemetry', 'benchmarks'], 'readwrite');
  await Promise.all([
    tx.objectStore('lectures').clear(),
    tx.objectStore('settings').clear(),
    tx.objectStore('telemetry').clear(),
    tx.objectStore('benchmarks').clear(),
    tx.done,
  ]);
}
