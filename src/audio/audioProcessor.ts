export interface AudioChunk {
  chunkIndex: number;
  startTimeSec: number;
  endTimeSec: number;
  audioData: Float32Array; // 16kHz mono PCM
}

export interface DecodedAudio {
  audioBuffer: AudioBuffer;
  sampleRate: number;
  durationSeconds: number;
  channels: number;
  pcm16kMono: Float32Array;
  waveformPeaks: number[];
}

/**
 * Decodes any audio/video Blob into a 16kHz mono Float32Array for Whisper ONNX inference.
 */
export async function decodeAudioBlob(blob: Blob): Promise<DecodedAudio> {
  const arrayBuffer = await blob.arrayBuffer();
  
  // Use standard offline or real AudioContext to decode
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } catch (err: any) {
    audioContext.close();
    throw new Error(
      `Browser could not decode this audio file. Please ensure it is a valid MP3, WAV, M4A, WebM, or MP4 file. Details: ${err.message}`
    );
  }

  // Resample to 16,000 Hz mono (Whisper requirement)
  const targetSampleRate = 16000;
  const durationSeconds = audioBuffer.duration;
  const targetLength = Math.round(durationSeconds * targetSampleRate);

  const offlineContext = new OfflineAudioContext(1, targetLength, targetSampleRate);
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  const renderedBuffer = await offlineContext.startRendering();
  const pcm16kMono = renderedBuffer.getChannelData(0);

  // Generate waveform peaks (120 buckets for visual rendering)
  const waveformPeaks = computeWaveformPeaks(pcm16kMono, 120);

  audioContext.close();

  return {
    audioBuffer,
    sampleRate: targetSampleRate,
    durationSeconds,
    channels: 1,
    pcm16kMono,
    waveformPeaks,
  };
}

/**
 * Computes normalized RMS/peak values across buckets for visual waveforms
 */
export function computeWaveformPeaks(data: Float32Array, numBuckets = 100): number[] {
  const bucketSize = Math.floor(data.length / numBuckets);
  if (bucketSize <= 0) return new Array(numBuckets).fill(0.1);

  const peaks: number[] = [];
  for (let i = 0; i < numBuckets; i++) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, data.length);
    let sumSquares = 0;
    for (let j = start; j < end; j++) {
      sumSquares += data[j] * data[j];
    }
    const rms = Math.sqrt(sumSquares / (end - start));
    peaks.push(Math.min(1.0, Math.max(0.04, rms * 3.5)));
  }
  return peaks;
}

/**
 * Chunks 16kHz mono audio into 30-second windows for Whisper ONNX
 */
export function chunkAudio16k(
  pcm16k: Float32Array,
  chunkDurationSec = 30
): AudioChunk[] {
  const sampleRate = 16000;
  const samplesPerChunk = chunkDurationSec * sampleRate;
  const totalSamples = pcm16k.length;
  const chunks: AudioChunk[] = [];

  let offset = 0;
  let chunkIndex = 0;

  while (offset < totalSamples) {
    const end = Math.min(offset + samplesPerChunk, totalSamples);
    const slice = pcm16k.subarray(offset, end);
    
    // Pad to full 30s with silence if Whisper requires fixed window or pad end
    const chunkData = new Float32Array(samplesPerChunk);
    chunkData.set(slice);

    const startTimeSec = offset / sampleRate;
    const endTimeSec = end / sampleRate;

    chunks.push({
      chunkIndex,
      startTimeSec,
      endTimeSec,
      audioData: chunkData,
    });

    offset += samplesPerChunk;
    chunkIndex++;
  }

  return chunks;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatTimestamp(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const mStr = String(mins).padStart(2, '0');
  const sStr = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hStr = String(hrs).padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

/**
 * Parses timestamp string "MM:SS" or "HH:MM:SS" into seconds
 */
export function parseTimestampToSeconds(ts: string): number {
  if (!ts) return 0;
  // Handle ranges like "32:14-32:42" or "32:14–32:42" -> take start
  const cleanTs = ts.split(/[-–—]/)[0].trim();
  const parts = cleanTs.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}
