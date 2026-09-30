import {
  TranscriptSegment,
  LectureSummary,
  Flashcard,
  QuizQuestion,
  GroundedAnswer,
  Topic,
  ConceptCard,
  Language,
} from '../types';

export interface AudioInput {
  blob: Blob;
  pcm16kMono?: Float32Array;
  durationSeconds: number;
}

export interface TranscriptionProgress {
  stage: 'checking-hardware' | 'downloading-model' | 'transcribing-chunk' | 'finalizing';
  modelDownloadPercent?: number;
  downloadedBytes?: number;
  totalBytes?: number;
  chunksCompleted: number;
  totalChunks: number;
  currentChunkTimestamp?: string;
  backendUsed: 'webgpu' | 'wasm' | 'cpu';
  realTimeFactor?: number;
  elapsedMs: number;
}

export interface TranscriptionResult {
  transcript: TranscriptSegment[];
  topics: Topic[];
  durationSeconds: number;
  transcriptionTimeMs: number;
  realTimeFactor: number;
  backendUsed: 'webgpu' | 'wasm' | 'cpu';
  modelName: string;
}

export interface LectureContext {
  lectureId?: string;
  title: string;
  transcript: TranscriptSegment[];
  topics: Topic[];
  fullTranscriptText: string;
}

export interface FullAnalysisResult {
  summary: LectureSummary;
  topics: Topic[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface InferenceEngine {
  readonly id: string;
  readonly name: string;
  readonly type: 'browser-local' | 'cloud-gemini' | 'snapdragon-npu-target';

  transcribe(
    audio: AudioInput,
    options: {
      model: 'whisper-tiny' | 'whisper-base';
      language: Language;
      onProgress?: (progress: TranscriptionProgress) => void;
    }
  ): Promise<TranscriptionResult>;

  summarize(transcriptText: string, title: string): Promise<LectureSummary>;

  generateFlashcards(transcriptText: string, title: string): Promise<Flashcard[]>;

  generateQuiz(transcriptText: string, title: string): Promise<QuizQuestion[]>;

  analyzeLecture(
    transcriptText: string,
    title: string,
    language?: Language
  ): Promise<FullAnalysisResult>;

  answerQuestion(question: string, context: LectureContext): Promise<GroundedAnswer>;

  explainConcept?(
    selection: string,
    surroundingContext: string,
    title: string
  ): Promise<ConceptCard>;
}
