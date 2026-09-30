export type Language = 'auto' | 'en' | 'hi';

export type InferenceBackend = 'webgpu' | 'wasm' | 'cpu' | 'qnn-npu-target';

export type OperatingMode = 'local-only' | 'hybrid';

export interface TranscriptSegment {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  startTimestamp: string; // e.g. "04:15"
  endTimestamp: string;   // e.g. "04:45"
  text: string;
  confidence?: number;
  highlightedTerms?: string[];
}

export interface Topic {
  id: string;
  title: string;
  startTimestamp: string;
  endTimestamp: string;
  summary: string;
}

export interface KeyPoint {
  point: string;
  explanation: string;
  evidenceTimestamp: string;
}

export interface Formula {
  name: string;
  formula: string;
  description: string;
  evidenceTimestamp?: string;
}

export interface Definition {
  term: string;
  definition: string;
  evidenceTimestamp: string;
}

export interface ImportantConcept {
  concept: string;
  details: string;
  prerequisites?: string;
  evidenceTimestamp: string;
}

export interface LectureSummary {
  tldr: string;
  keyPoints: KeyPoint[];
  formulas?: Formula[];
  definitions: Definition[];
  importantConcepts?: ImportantConcept[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  sourceTimestamp: string;
  difficulty: 'easy' | 'medium' | 'hard';
  userRating?: 'again' | 'hard' | 'good' | 'easy';
  lastReviewed?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceTimestamp: string;
  userSelected?: string;
  isCorrect?: boolean;
}

export interface QuizAttempt {
  id: string;
  lectureId: string;
  score: number;
  total: number;
  completedAt: number;
}

export interface Citation {
  timestamp: string;
  snippet: string;
  topic?: string;
}

export interface GroundedAnswer {
  id: string;
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  citations: Citation[];
  followUpSuggestions?: string[];
  createdAt: number;
}

export interface ConceptCard {
  term: string;
  simpleExplanation: string;
  prerequisites: string;
  practicalExample: string;
  evidenceTimestamp: string;
}

export interface Telemetry {
  lectureId?: string;
  modelName: string;
  backendUsed: InferenceBackend;
  audioDurationSeconds: number;
  transcriptionTimeMs: number;
  realTimeFactor: number; // transcriptionTime / audioDuration
  chunksCount: number;
  memoryUsedMb?: number;
  geminiRequestsCount: number;
  geminiLatencyMs?: number;
  measuredAt: number;
}

export interface Lecture {
  id: string;
  title: string;
  courseSubject: string;
  createdAt: number;
  durationSeconds: number;
  audioBlob?: Blob;
  audioUrl?: string; // object URL or preloaded URL
  transcript: TranscriptSegment[];
  topics: Topic[];
  summary?: LectureSummary;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  groundedQA: GroundedAnswer[];
  language: Language;
  isSample?: boolean;
  telemetry?: Telemetry;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  institution: string;
  department: string;
  yearOfStudy: string;
  avatarUrl?: string;
  snapdragonStudentPassId: string;
  joinedAt: number;
}

export interface EngineCapabilities {
  hasWebGPU: boolean;
  webGPUDeviceName?: string;
  hasWasmSIMD: boolean;
  hardwareConcurrency: number;
  estimatedMemoryGb?: number;
  snapdragonNPUTarget: {
    name: string;
    runtime: string;
    status: 'integration-target' | 'unconnected';
    topsRating: string;
    recommendedQuantization: string;
  };
}

export interface ModelSpec {
  id: string;
  name: string;
  sizeMb: number;
  params: string;
  quantization: string;
  description: string;
  isDefault?: boolean;
  hfRepo: string;
  targetNpuRepo?: string;
}

export interface BenchmarkResult {
  id: string;
  testName: string;
  timestamp: number;
  engine: string;
  backend: string;
  audioDurationSec: number;
  processingTimeMs: number;
  realTimeFactor: number;
  memoryMb?: number;
  status: 'completed' | 'not-measured';
}
