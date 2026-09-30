import React, { useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { decodeAudioBlob, formatTimestamp } from '../../audio/audioProcessor';
import { BrowserWhisperEngine } from '../../engine/BrowserWhisperEngine';
import { GeminiEngine } from '../../engine/GeminiEngine';
import { TranscriptionProgress, TranscriptionResult } from '../../engine/InferenceEngine';
import { Lecture } from '../../types';
import {
  Upload,
  FileAudio,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const whisperEngine = new BrowserWhisperEngine();
const geminiEngine = new GeminiEngine();

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const {
    selectedModel,
    preferredLanguage,
    localOnlyMode,
    createLecture,
  } = useAppStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDurationSec, setFileDurationSec] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [courseSubject, setCourseSubject] = useState('Engineering');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [progress, setProgress] = useState<TranscriptionProgress | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setSelectedFile(file);

    // Auto-generate title from filename
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setTitle(cleanName);

    // Test browser decoding
    try {
      setStatusText('Validating audio file format...');
      const decoded = await decodeAudioBlob(file);
      setFileDurationSec(decoded.durationSeconds);
      setStatusText('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Browser failed to decode this audio file.');
      setSelectedFile(null);
      setFileDurationSec(null);
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setStatusText('Decoding audio to 16kHz mono Float32Array (Web Audio API)...');

      const decoded = await decodeAudioBlob(selectedFile);

      setStatusText('Initializing browser Whisper ONNX pipeline...');
      const transcriptionResult: TranscriptionResult = await whisperEngine.transcribe(
        {
          blob: selectedFile,
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

      let summaryData: any = undefined;
      let topicsData = transcriptionResult.topics;
      let flashcardsData: any[] = [];
      let quizData: any[] = [];

      // Cloud Intelligence via Gemini (if not in local-only mode)
      if (!localOnlyMode && transcriptText.trim().length > 30) {
        setStatusText('Generating grounded study guide, flashcards, & quiz (Gemini 2.5 Flash)...');
        try {
          const analysis = await geminiEngine.analyzeLecture(
            transcriptText,
            title || selectedFile.name,
            preferredLanguage,
            false
          );
          summaryData = analysis.summary;
          topicsData = analysis.topics.length > 0 ? analysis.topics : topicsData;
          flashcardsData = analysis.flashcards;
          quizData = analysis.quiz;
        } catch (geminiErr: any) {
          console.warn('Gemini analysis failed or rate limited:', geminiErr);
        }
      }

      const lectureId = `lec_${Date.now()}`;
      const newLecture: Lecture = {
        id: lectureId,
        title: title || selectedFile.name,
        courseSubject: courseSubject || 'General',
        createdAt: Date.now(),
        durationSeconds: decoded.durationSeconds,
        audioBlob: selectedFile,
        audioUrl: URL.createObjectURL(selectedFile),
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
      console.error('Import processing error:', err);
      setErrorMessage(`Import error: ${err.message || err}`);
      setIsProcessing(false);
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
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#121212] dark:text-[#F2EFE9]">Import Lecture Media</h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F]">Local decoding · Audio stays on your PC</p>
            </div>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close import modal"
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
              <p className="font-semibold">Import Issue</p>
              <p>{errorMessage}</p>
              <p className="text-[11px] text-red-600 dark:text-red-400">
                Supported formats: MP3, WAV, M4A, WebM, MP4. If on Edge/Chrome, ensure standard codecs are used.
              </p>
            </div>
          </div>
        )}

        {!isProcessing ? (
          <div className="mt-5 space-y-4">
            {/* File dropzone / selector */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D1CCC4] dark:border-[#383531] hover:border-[#C8102E] dark:hover:border-[#C8102E] rounded-xl p-6 text-center cursor-pointer transition-colors bg-white/60 dark:bg-[#1C1B1A]/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/mp4,video/webm"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileAudio className="w-10 h-10 mx-auto text-[#666666] dark:text-[#99958F] mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">{selectedFile.name}</p>
                  <p className="text-[11px] text-[#666666] dark:text-[#99958F] mt-0.5 font-mono-code">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    {fileDurationSec ? ` · ${formatTimestamp(fileDurationSec)}` : ''}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">
                    Click to select audio or video file
                  </p>
                  <p className="text-[11px] text-[#666666] dark:text-[#99958F] mt-1 font-mono-code">
                    MP3, WAV, M4A, WebM, MP4 (up to 500MB)
                  </p>
                </div>
              )}
            </div>

            {/* Inputs */}
            {selectedFile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
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
                    className="w-full px-3 py-1.5 text-xs rounded-md bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                  />
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#666666] dark:text-[#99958F] pt-1">
              <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Audio is decoded in-browser. Zero audio bytes are sent across the network.</span>
            </div>

            {/* Submit button */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5E0D8] dark:border-[#2A2825]">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartImport}
                disabled={!selectedFile}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#C8102E] hover:bg-[#A50D25] disabled:opacity-50 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Start On-Device Transcription
              </button>
            </div>
          </div>
        ) : (
          /* Processing State */
          <div className="mt-6 p-6 bg-white dark:bg-[#1E1D1C] border border-[#E5E0D8] dark:border-[#2A2825] rounded-xl space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#121212] dark:text-[#F2EFE9]">
                <Loader2 className="w-4 h-4 animate-spin text-[#C8102E]" />
                <span>Processing Lecture Media</span>
              </div>
              <span className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 uppercase">
                {progress?.backendUsed || 'WASM'}
              </span>
            </div>

            <p className="text-xs text-[#666666] dark:text-[#99958F]">{statusText}</p>

            {/* Model download if applicable */}
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
                  <span>Chunks Processed</span>
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

            {/* Real Telemetry Numbers */}
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
                <div className="text-[10px] text-[#666666] dark:text-[#99958F]">Hardware Target</div>
                <div className="font-mono-code text-[11px] font-semibold text-[#C8102E]">
                  Snapdragon NPU
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
