import { Telemetry, BenchmarkResult, InferenceBackend } from '../types';
import { settingsRepository } from '../storage/settingsRepository';

class TelemetryCollector {
  private activeTimers: Map<string, number> = new Map();
  private geminiRequestCount = 0;

  startTimer(id: string): void {
    this.activeTimers.set(id, performance.now());
  }

  stopTimer(id: string): number {
    const start = this.activeTimers.get(id);
    if (!start) return 0;
    const elapsed = performance.now() - start;
    this.activeTimers.delete(id);
    return Math.round(elapsed);
  }

  incrementGeminiRequests(): number {
    this.geminiRequestCount++;
    return this.geminiRequestCount;
  }

  getGeminiRequestCount(): number {
    return this.geminiRequestCount;
  }

  async recordTranscriptionTelemetry(params: {
    lectureId?: string;
    modelName: string;
    backendUsed: InferenceBackend;
    audioDurationSeconds: number;
    transcriptionTimeMs: number;
    chunksCount: number;
  }): Promise<Telemetry> {
    const audioSec = Math.max(0.1, params.audioDurationSeconds);
    const timeSec = params.transcriptionTimeMs / 1000;
    const realTimeFactor = Math.round((timeSec / audioSec) * 100) / 100;

    let memoryUsedMb: number | undefined;
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      memoryUsedMb = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
    }

    const telemetry: Telemetry = {
      lectureId: params.lectureId,
      modelName: params.modelName,
      backendUsed: params.backendUsed,
      audioDurationSeconds: Math.round(params.audioDurationSeconds * 10) / 10,
      transcriptionTimeMs: params.transcriptionTimeMs,
      realTimeFactor,
      chunksCount: params.chunksCount,
      memoryUsedMb,
      geminiRequestsCount: this.geminiRequestCount,
      measuredAt: Date.now(),
    };

    await settingsRepository.logTelemetry(telemetry);
    return telemetry;
  }

  async recordBenchmark(benchmark: Omit<BenchmarkResult, 'id' | 'timestamp'>): Promise<BenchmarkResult> {
    const result: BenchmarkResult = {
      ...benchmark,
      id: `bench_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };
    await settingsRepository.saveBenchmark(result);
    return result;
  }
}

export const telemetry = new TelemetryCollector();
