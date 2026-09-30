import { pipeline, env } from '@huggingface/transformers';
import {
  AudioInput,
  TranscriptionProgress,
  TranscriptionResult,
} from './InferenceEngine';
import { TranscriptSegment, Topic } from '../types';
import { detectEngineCapabilities } from './EngineCapabilities';
import { formatTimestamp, chunkAudio16k } from '../audio/audioProcessor';
import { telemetry } from './EngineTelemetry';

// Configure transformers.js environment for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

export class BrowserWhisperEngine {
  readonly id = 'browser-whisper';
  readonly name = 'Browser Whisper (ONNX WebGPU/WASM)';
  readonly type = 'browser-local' as const;

  private transcriberInstance: any = null;
  private currentModelName = '';
  private activeBackend: 'webgpu' | 'wasm' = 'wasm';

  async clearCachedModel(): Promise<void> {
    this.transcriberInstance = null;
    this.currentModelName = '';
    // Clear HuggingFace transformers cache from CacheStorage if accessible
    if (typeof caches !== 'undefined') {
      try {
        const keys = await caches.keys();
        for (const key of keys) {
          if (key.includes('transformers') || key.includes('onnx')) {
            await caches.delete(key);
          }
        }
      } catch (e) {
        console.warn('Could not clear browser model cache:', e);
      }
    }
  }

  async getPipeline(
    modelChoice: 'whisper-tiny' | 'whisper-base',
    onDownloadProgress?: (info: any) => void
  ): Promise<any> {
    const modelRepo =
      modelChoice === 'whisper-base'
        ? 'onnx-community/whisper-base'
        : 'onnx-community/whisper-tiny';

    if (this.transcriberInstance && this.currentModelName === modelRepo) {
      return this.transcriberInstance;
    }

    const caps = await detectEngineCapabilities();
    let backendToUse: 'webgpu' | 'wasm' = caps.hasWebGPU ? 'webgpu' : 'wasm';

    try {
      if (backendToUse === 'webgpu') {
        try {
          this.transcriberInstance = await (pipeline as any)(
            'automatic-speech-recognition',
            modelRepo,
            {
              device: 'webgpu',
              dtype: {
                encoder_model: 'fp32',
                decoder_model_merged: 'q4',
              },
              progress_callback: onDownloadProgress,
            }
          );
          this.activeBackend = 'webgpu';
          this.currentModelName = modelRepo;
          return this.transcriberInstance;
        } catch (gpuError) {
          console.warn('WebGPU pipeline failed, falling back cleanly to WASM:', gpuError);
          backendToUse = 'wasm';
        }
      }

      // WASM fallback
      this.transcriberInstance = await (pipeline as any)(
        'automatic-speech-recognition',
        modelRepo,
        {
          device: 'wasm',
          dtype: 'q8',
          progress_callback: onDownloadProgress,
        }
      );
      this.activeBackend = 'wasm';
      this.currentModelName = modelRepo;
      return this.transcriberInstance;
    } catch (err: any) {
      console.error('Failed to load Whisper ONNX model:', err);
      throw new Error(
        `Failed to download or initialize browser Whisper ONNX model (${modelRepo}). ` +
        `Error: ${err.message || err}. Please verify internet access for initial model download.`
      );
    }
  }

  async transcribe(
    audio: AudioInput,
    options: {
      model: 'whisper-tiny' | 'whisper-base';
      language: 'auto' | 'en' | 'hi';
      onProgress?: (progress: TranscriptionProgress) => void;
    }
  ): Promise<TranscriptionResult> {
    const startTime = performance.now();
    const pcm = audio.pcm16kMono;
    if (!pcm || pcm.length === 0) {
      throw new Error('Audio PCM data is required for transcription');
    }

    const chunks = chunkAudio16k(pcm, 30);
    const totalChunks = chunks.length;

    options.onProgress?.({
      stage: 'downloading-model',
      chunksCompleted: 0,
      totalChunks,
      backendUsed: this.activeBackend,
      elapsedMs: Math.round(performance.now() - startTime),
    });

    const transcriber = await this.getPipeline(options.model, (info: any) => {
      if (info && info.status === 'progress') {
        const percent = Math.round((info.loaded / (info.total || 1)) * 100);
        options.onProgress?.({
          stage: 'downloading-model',
          modelDownloadPercent: percent,
          downloadedBytes: info.loaded,
          totalBytes: info.total,
          chunksCompleted: 0,
          totalChunks,
          backendUsed: this.activeBackend,
          elapsedMs: Math.round(performance.now() - startTime),
        });
      }
    });

    const segments: TranscriptSegment[] = [];

    // Language configuration
    const generateKwargs: Record<string, any> = {
      task: 'transcribe',
      return_timestamps: true,
    };
    if (options.language && options.language !== 'auto') {
      generateKwargs.language = options.language;
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkStartMs = performance.now();

      const elapsedMs = Math.round(performance.now() - startTime);
      const audioProcessedSec = (i * 30);
      const rtf = audioProcessedSec > 0 ? (elapsedMs / 1000) / audioProcessedSec : 0;

      options.onProgress?.({
        stage: 'transcribing-chunk',
        chunksCompleted: i,
        totalChunks,
        currentChunkTimestamp: formatTimestamp(chunk.startTimeSec),
        backendUsed: this.activeBackend,
        realTimeFactor: Math.round(rtf * 100) / 100,
        elapsedMs,
      });

      try {
        const output = await transcriber(chunk.audioData, generateKwargs);
        const chunkText = typeof output === 'string' ? output : (output.text || '');

        if (chunkText.trim().length > 0) {
          // If timestamps are returned inside chunks
          if (output.chunks && Array.isArray(output.chunks) && output.chunks.length > 0) {
            for (const sub of output.chunks) {
              const subStart = chunk.startTimeSec + (sub.timestamp?.[0] || 0);
              const subEnd = chunk.startTimeSec + (sub.timestamp?.[1] || 30);
              if (sub.text && sub.text.trim()) {
                segments.push({
                  id: `seg_${segments.length + 1}`,
                  start: subStart,
                  end: subEnd,
                  startTimestamp: formatTimestamp(subStart),
                  endTimestamp: formatTimestamp(subEnd),
                  text: sub.text.trim(),
                });
              }
            }
          } else {
            segments.push({
              id: `seg_${segments.length + 1}`,
              start: chunk.startTimeSec,
              end: chunk.endTimeSec,
              startTimestamp: formatTimestamp(chunk.startTimeSec),
              endTimestamp: formatTimestamp(chunk.endTimeSec),
              text: chunkText.trim(),
            });
          }
        }
      } catch (chunkErr) {
        console.warn(`Error transcribing chunk ${i}:`, chunkErr);
        // Add minimal placeholder segment so timestamps don't jump
        segments.push({
          id: `seg_${segments.length + 1}`,
          start: chunk.startTimeSec,
          end: chunk.endTimeSec,
          startTimestamp: formatTimestamp(chunk.startTimeSec),
          endTimestamp: formatTimestamp(chunk.endTimeSec),
          text: `[Audio segment ${formatTimestamp(chunk.startTimeSec)} - ${formatTimestamp(chunk.endTimeSec)}]`,
        });
      }
    }

    const totalElapsedMs = Math.round(performance.now() - startTime);
    const finalRtf = Math.round(((totalElapsedMs / 1000) / Math.max(0.1, audio.durationSeconds)) * 100) / 100;

    options.onProgress?.({
      stage: 'finalizing',
      chunksCompleted: totalChunks,
      totalChunks,
      backendUsed: this.activeBackend,
      realTimeFactor: finalRtf,
      elapsedMs: totalElapsedMs,
    });

    // Generate basic chronological topics from transcript intervals
    const topics: Topic[] = buildTopicsFromSegments(segments);

    await telemetry.recordTranscriptionTelemetry({
      modelName: this.currentModelName || options.model,
      backendUsed: this.activeBackend,
      audioDurationSeconds: audio.durationSeconds,
      transcriptionTimeMs: totalElapsedMs,
      chunksCount: totalChunks,
    });

    return {
      transcript: segments,
      topics,
      durationSeconds: audio.durationSeconds,
      transcriptionTimeMs: totalElapsedMs,
      realTimeFactor: finalRtf,
      backendUsed: this.activeBackend,
      modelName: this.currentModelName || options.model,
    };
  }
}

function buildTopicsFromSegments(segments: TranscriptSegment[]): Topic[] {
  if (segments.length === 0) return [];
  const topics: Topic[] = [];
  const groupSize = Math.max(3, Math.ceil(segments.length / 5));

  for (let i = 0; i < segments.length; i += groupSize) {
    const group = segments.slice(i, i + groupSize);
    const start = group[0].startTimestamp;
    const end = group[group.length - 1].endTimestamp;
    const combined = group.map((g) => g.text).join(' ');
    const titleWords = combined.split(/\s+/).slice(0, 6).join(' ');
    topics.push({
      id: `topic_${topics.length + 1}`,
      title: titleWords.length > 5 ? `${titleWords}...` : `Topic ${topics.length + 1}`,
      startTimestamp: start,
      endTimestamp: end,
      summary: combined.slice(0, 180) + '...',
    });
  }
  return topics;
}
