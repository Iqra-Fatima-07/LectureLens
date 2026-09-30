import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LiveAudioRecorder } from '../../audio/recorder';
import { decodeAudioBlob, formatTimestamp } from '../../audio/audioProcessor';
import { BrowserWhisperEngine } from '../../engine/BrowserWhisperEngine';
import { GeminiEngine } from '../../engine/GeminiEngine';
import { TranscriptionProgress, TranscriptionResult } from '../../engine/InferenceEngine';
import { Lecture } from '../../types';
import {
  Mic,
  Square,
  Pause,
  Play,
  X,
  AlertCircle,
  Loader2,
  Cpu,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const whisperEngine = new BrowserWhisperEngine();
const geminiEngine = new GeminiEngine();

export const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedModel,
    preferredLanguage,
    localOnlyMode,
    createLecture,
  } = useAppStore();

  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'paused' | 'processing' | 'done'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(24).fill(0.1));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Metadata form
  const [title, setTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('Computer Science');

  // Progressive processing state
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const recorderRef = useRef<LiveAudioRecorder | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRecordState('idle');
      setElapsedSec(0);
      setWaveformBars(new Array(24).fill(0.1));
      setErrorMessage(null);
      setProgress(null);
      setTitle(`Lecture · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
    } else {
      if (recorderRef.current) {
        recorderRef.current.cancel();
        recorderRef.current = null;
      }
    }
  }, [isOpen]);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    try {
      const recorder = new LiveAudioRecorder({
        onTimeUpdate: (sec) => setElapsedSec(sec),
        onWaveformData: (bars) => setWaveformBars(bars),
        onError: (err) => {
          setErrorMessage(err);
          setRecordState('idle');
        },
      });

      recorderRef.current = recorder;
      await recorder.start();
      setRecordState('recording');
    } catch (err: any) {
      setErrorMessage(err.message || 'Microphone access failed.');
      setRecordState('idle');
    }
  };

  const handlePauseResume = () => {
    if (!recorderRef.current) return;
    if (recordState === 'recording') {
      recorderRef.current.pause();
      setRecordState('paused');
    } else if (recordState === 'paused') {
      recorderRef.current.resume();
      setRecordState('recording');
    }
  };

  const handleStopAndTranscribe = async () => {
    if (!recorderRef.current) return;
    try {
      setRecordState('processing');
      setProcessingStatus('Finalizing audio stream & extracting PCM...');
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;

      // Decode audio in browser to 16kHz mono Float32Array
      setProcessingStatus('Decoding audio to 16kHz mono (Web Audio API)...');
      const decoded = await decodeAudioBlob(audioBlob);

      // Run real on-device Whisper transcription
      setProcessingStatus('Starting on-device Whisper ONNX transcription...');
      const transcriptionResult: TranscriptionResult = await whisperEngine.transcribe(
        {
          blob: audioBlob,
          pcm16kMono: decoded.pcm16kMono,
          durationSeconds: decoded.durationSeconds,
        },
        {
          model: selectedModel,
          language: preferredLanguage,
          onProgress: (p) => setProgress(p),
        }
      );

      const transcriptText = transcriptionResult.transcript.map((t) => t.text).join(' ');

      // Build Lecture object
      let summaryData: any = undefined;
      let topicsData = transcriptionResult.topics;
      let flashcardsData: any[] = [];
      let quizData: any[] = [];

      // Cloud Intelligence via Gemini (if not in local-only mode)
      if (!localOnlyMode && transcriptText.trim().length > 30) {
        setProcessingStatus('Generating grounded study guide, flashcards, & quiz (Gemini 2.5 Flash)...');
        try {
          const analysis = await geminiEngine.analyzeLecture(
            transcriptText,
            title || 'Recorded Lecture',
            preferredLanguage,
            false
          );
          summaryData = analysis.summary;
          topicsData = analysis.topics.length > 0 ? analysis.topics : topicsData;
          flashcardsData = analysis.flashcards;
          quizData = analysis.quiz;
        } catch (geminiErr: any) {
          console.warn('Gemini analysis failed or rate limited:', geminiErr);
          // Still save transcript cleanly so student never loses their recorded lecture
        }
      }

      const lectureId = `lec_${Date.now()}`;
      const newLecture: Lecture = {
        id: lectureId,
        title: title || 'Untitled Lecture',
        courseSubject: courseSubject || 'General',
        createdAt: Date.now(),
        durationSeconds: decoded.durationSeconds,
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob),
        transcript: transcriptionResult.transcript,
        topics: topicsData,
        summary: summaryData,
        flashcards: flashcardsData,
        quiz: quizData,
        groundedQA: [],
        language: preferredLanguage,
        telemetry: {
          lectureId,
          modelName: transcriptionResult.modelName,
          backendUsed: transcriptionResult.backendUsed,
          audioDurationSeconds: decoded.durationSeconds,
          transcriptionTimeMs: transcriptionResult.transcriptionTimeMs,
          realTimeFactor: transcriptionResult.realTimeFactor,
          chunksCount: transcriptionResult.transcript.length,
          geminiRequestsCount: localOnlyMode ? 0 : 1,
          measuredAt: Date.now(),
        },
      };

      await createLecture(newLecture);
      onClose();
    } catch (err: any) {
      console.error('Transcription pipeline error:', err);
      setErrorMessage(`Processing error: ${err.message || err}`);
      setRecordState('idle');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#FAF8F5] dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] rounded-xl shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E0D8] dark:border-[#2A2825]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E]">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#121212] dark:text-[#F2EFE9]">Record Lecture</h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F]">On-device audio capture · Never uploaded</p>
            </div>
          </div>
          {recordState !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close record modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#C8102E]" />
            <div className="space-y-1">
              <p className="font-semibold">Recording issue</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Lecture Metadata Inputs */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
              Lecture Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={recordState === 'processing'}
              className="w-full px-3 py-1.5 text-xs rounded-md bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
              placeholder="e.g. Operating Systems: Virtual Memory"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
              Course / Subject
            </label>
            <input
              type="text"
              value={courseSubject}
              onChange={(e) => setCourseSubject(e.target.value)}
              disabled={recordState === 'processing'}
              className="w-full px-3 py-1.5 text-xs rounded-md bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
              placeholder="e.g. CS301, Engineering Maths"
            />
          </div>
        </div>

        {/* Recording State Screen */}
        {recordState !== 'processing' ? (
          <div className="mt-6 flex flex-col items-center justify-center p-6 bg-white dark:bg-[#1E1D1C] border border-[#E5E0D8] dark:border-[#2A2825] rounded-xl">
            {/* Live Waveform Visualizer */}
            <div className="h-16 flex items-center justify-center gap-1.5 w-full max-w-sm px-4">
              {waveformBars.map((height, idx) => (
                <div
                  key={idx}
                  className="w-2 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(6, Math.round(height * 64))}px`,
                    backgroundColor:
                      recordState === 'recording'
                        ? '#C8102E'
                        : recordState === 'paused'
                        ? '#E5A93B'
                        : '#D1CCC4',
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="mt-4 font-mono-code text-2xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
              {formatTimestamp(elapsedSec)}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-[#666666] dark:text-[#99958F]">
              <span
                className={`w-2 h-2 rounded-full ${
                  recordState === 'recording'
                    ? 'bg-[#C8102E] animate-pulse'
                    : recordState === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-zinc-400'
                }`}
              />
              <span className="capitalize">{recordState}</span>
              {recordState === 'recording' && <span>· 16kHz PCM</span>}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              {recordState === 'idle' ? (
                <button
                  onClick={handleStartRecording}
                  className="px-5 py-2.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D25] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all focus:outline-none"
                >
                  <Mic className="w-4 h-4" />
                  Start Recording
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePauseResume}
                    className="px-4 py-2 rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#201F1E] text-xs font-medium text-[#121212] dark:text-[#F2EFE9] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors"
                  >
                    {recordState === 'recording' ? (
                      <>
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" /> Resume
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStopAndTranscribe}
                    className="px-4 py-2 rounded-lg bg-[#C8102E] hover:bg-[#A50D25] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Finish & Transcribe
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Real-time Transcription & Processing telemetry */
          <div className="mt-6 p-6 bg-white dark:bg-[#1E1D1C] border border-[#E5E0D8] dark:border-[#2A2825] rounded-xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#121212] dark:text-[#F2EFE9]">
                <Loader2 className="w-4 h-4 animate-spin text-[#C8102E]" />
                <span>On-Device Transcription in Progress</span>
              </div>
              <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 uppercase">
                {progress?.backendUsed || 'WASM'}
              </span>
            </div>

            <p className="text-xs text-[#666666] dark:text-[#99958F]">{processingStatus}</p>

            {/* Model download progress if downloading */}
            {progress?.stage === 'downloading-model' && progress.modelDownloadPercent !== undefined && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
                  <span>Model Download ({selectedModel})</span>
                  <span>{progress.modelDownloadPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E0D8] dark:bg-[#2A2825] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8102E] transition-all duration-200"
                    style={{ width: `${progress.modelDownloadPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Chunk progress */}
            {progress && progress.totalChunks > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
                  <span>Audio Chunks (30s windows)</span>
                  <span>
                    {progress.chunksCompleted} / {progress.totalChunks}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E5E0D8] dark:bg-[#2A2825] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C8102E] transition-all duration-300"
                    style={{
                      width: `${Math.round((progress.chunksCompleted / progress.totalChunks) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Live Telemetry Data */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E0D8] dark:border-[#2A2825] text-center">
              <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#666666] dark:text-[#99958F]">Elapsed Time</div>
                <div className="font-mono-code text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">
                  {progress ? Math.round(progress.elapsedMs / 1000) : 0}s
                </div>
              </div>
              <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#666666] dark:text-[#99958F]">Real-time Factor</div>
                <div className="font-mono-code text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">
                  {progress?.realTimeFactor ? `${progress.realTimeFactor}x` : 'calculating...'}
                </div>
              </div>
              <div className="p-2 rounded bg-black/5 dark:bg-white/5">
                <div className="text-[10px] text-[#666666] dark:text-[#99958F]">NPU Target</div>
                <div className="font-mono-code text-[11px] font-semibold text-[#C8102E]">
                  45 TOPS QNN
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#666666] dark:text-[#99958F]">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Audio data is strictly processed on-device and never uploaded.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
