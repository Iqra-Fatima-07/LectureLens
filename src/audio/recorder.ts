export interface RecorderCallbacks {
  onTimeUpdate: (elapsedSeconds: number) => void;
  onWaveformData: (amplitudes: number[]) => void;
  onError: (error: string) => void;
}

export class LiveAudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private timerInterval: number | null = null;
  private elapsedSeconds = 0;
  private isPaused = false;
  private callbacks: RecorderCallbacks;

  constructor(callbacks: RecorderCallbacks) {
    this.callbacks = callbacks;
  }

  async start(): Promise<void> {
    try {
      this.audioChunks = [];
      this.elapsedSeconds = 0;
      this.isPaused = false;

      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
        },
      });

      // Web Audio API for live frequency/amplitude analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      // Determine supported mime type
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', ''];
      const mimeType = mimeTypes.find((t) => !t || MediaRecorder.isTypeSupported(t)) || '';

      this.mediaRecorder = new MediaRecorder(this.mediaStream, mimeType ? { mimeType } : undefined);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.audioChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(250); // Emit chunk every 250ms

      // Start elapsed timer
      this.timerInterval = window.setInterval(() => {
        if (!this.isPaused) {
          this.elapsedSeconds += 1;
          this.callbacks.onTimeUpdate(this.elapsedSeconds);
        }
      }, 1000);

      // Start waveform loop
      this.startWaveformVisualizer();
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      let errorMsg = 'Could not access microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings (Edge/Chrome) to record lectures.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No microphone device found. Please connect a microphone or use the "Import Audio" option.';
      }
      this.callbacks.onError(errorMsg);
      throw new Error(errorMsg);
    }
  }

  private startWaveformVisualizer(): void {
    if (!this.analyser) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const update = () => {
      if (!this.analyser || this.isPaused) {
        this.animFrameId = requestAnimationFrame(update);
        return;
      }
      this.analyser.getByteFrequencyData(dataArray);

      // Normalize to 0..1 values across 24 bars
      const bars = 24;
      const step = Math.floor(bufferLength / bars) || 1;
      const amplitudes: number[] = [];
      for (let i = 0; i < bars; i++) {
        const val = dataArray[i * step] || 0;
        amplitudes.push(Math.max(0.08, val / 255));
      }

      this.callbacks.onWaveformData(amplitudes);
      this.animFrameId = requestAnimationFrame(update);
    };

    this.animFrameId = requestAnimationFrame(update);
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isPaused = false;
    }
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not initialized'));
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        resolve(blob);
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(blob);
      }
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
  }
}
