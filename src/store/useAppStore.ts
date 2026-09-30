import { create } from 'zustand';
import {
  Lecture,
  Flashcard,
  QuizQuestion,
  GroundedAnswer,
  ConceptCard,
  Language,
  UserProfile,
} from '../types';
import { lectureRepository } from '../storage/lectureRepository';
import { settingsRepository } from '../storage/settingsRepository';
import { clearAllLocalData, getStorageEstimate } from '../storage/db';
import { localSearchEngine } from '../search/searchEngine';
import { SAMPLE_LECTURES } from '../seed/sampleLectures';
import { TranscriptionProgress } from '../engine/InferenceEngine';

export type MainView = 'landing' | 'auth' | 'dashboard' | 'lecture' | 'insights' | 'architecture' | 'settings';
export type LectureTab = 'summary' | 'flashcards' | 'quiz' | 'ask';

interface AppState {
  // Navigation & View
  mainView: MainView;
  activeLectureTab: LectureTab;
  currentLectureId: string | null;
  lectures: Lecture[];

  // Authentication
  currentUser: UserProfile | null;

  // Audio Playback
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  seekTarget: number | null; // trigger seek in AudioPlayer
  highlightedSegmentId: string | null;

  // Settings & Toggles
  localOnlyMode: boolean;
  selectedModel: 'whisper-tiny' | 'whisper-base';
  preferredLanguage: Language;
  isDarkMode: boolean;
  demoMode: boolean;

  // Real-time Transcription State
  isTranscribing: boolean;
  transcriptionProgress: TranscriptionProgress | null;

  // Search & Storage
  searchQuery: string;
  storageUsage: { usageMb: number; quotaMb: number; percentUsed: number; isAvailable: boolean };

  // "Explain this" Concept Modal
  conceptCard: ConceptCard | null;
  isConceptModalOpen: boolean;

  // Actions
  initialize: () => Promise<void>;
  setMainView: (view: MainView) => void;
  setActiveLectureTab: (tab: LectureTab) => void;
  selectLecture: (id: string, startTab?: LectureTab) => void;
  createLecture: (lecture: Lecture) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;
  updateLecture: (lecture: Lecture) => Promise<void>;

  // Playback actions
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  seekTo: (seconds: number, segmentId?: string) => void;

  // Transcription actions
  setIsTranscribing: (isTranscribing: boolean) => void;
  setTranscriptionProgress: (progress: TranscriptionProgress | null) => void;

  // Settings actions
  setLocalOnlyMode: (enabled: boolean) => Promise<void>;
  setSelectedModel: (model: 'whisper-tiny' | 'whisper-base') => Promise<void>;
  setPreferredLanguage: (lang: Language) => Promise<void>;
  toggleDarkMode: () => void;
  toggleDemoMode: () => void;

  // Study interaction actions
  rateFlashcard: (lectureId: string, flashcardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
  answerQuizQuestion: (lectureId: string, questionId: string, selectedOption: string) => Promise<void>;
  resetQuiz: (lectureId: string) => Promise<void>;
  addGroundedQA: (lectureId: string, qa: GroundedAnswer) => Promise<void>;
  openConceptModal: (concept: ConceptCard) => void;
  closeConceptModal: () => void;
  setSearchQuery: (query: string) => void;

  // Authentication actions
  login: (profile: UserProfile) => Promise<void>;
  logout: () => Promise<void>;

  // System
  refreshStorage: () => Promise<void>;
  deleteAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  mainView: 'landing',
  activeLectureTab: 'summary',
  currentLectureId: null,
  lectures: [],
  currentUser: null,

  currentTime: 0,
  duration: 0,
  isPlaying: false,
  playbackRate: 1.0,
  seekTarget: null,
  highlightedSegmentId: null,

  localOnlyMode: false,
  selectedModel: 'whisper-tiny',
  preferredLanguage: 'auto',
  isDarkMode: false,
  demoMode: false,

  isTranscribing: false,
  transcriptionProgress: null,

  searchQuery: '',
  storageUsage: { usageMb: 0, quotaMb: 0, percentUsed: 0, isAvailable: false },

  conceptCard: null,
  isConceptModalOpen: false,

  initialize: async () => {
    // 1. Load preferences
    const settings = await settingsRepository.getSettings();
    const savedTheme = typeof localStorage !== 'undefined' ? localStorage.getItem('lecturelens_theme') : null;
    const isDark = savedTheme === 'dark' ? true : savedTheme === 'light' ? false : false; // strictly default to false (light theme)

    set({
      localOnlyMode: settings.localOnlyMode,
      selectedModel: settings.selectedModel,
      preferredLanguage: settings.preferredLanguage,
      isDarkMode: isDark,
      playbackRate: settings.playbackSpeed,
    });

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Load stored lectures
    let loadedLectures = await lectureRepository.getAll();

    // 3. If no lectures exist, preload the 3 seed sample lectures
    if (loadedLectures.length === 0) {
      for (const sample of SAMPLE_LECTURES) {
        await lectureRepository.save(sample);
      }
      loadedLectures = await lectureRepository.getAll();
    }

    // 4. Index in search engine
    for (const lec of loadedLectures) {
      await localSearchEngine.indexLecture(lec);
    }

    // 5. Query storage estimate
    const storageEst = await getStorageEstimate();

    // 6. Load user profile
    const profile = await settingsRepository.getUserProfile();

    set({
      lectures: loadedLectures,
      storageUsage: storageEst,
      currentUser: profile,
    });
  },

  login: async (profile: UserProfile) => {
    await settingsRepository.saveUserProfile(profile);
    set({ currentUser: profile, mainView: 'dashboard' });
  },

  logout: async () => {
    await settingsRepository.saveUserProfile(null);
    set({ currentUser: null, mainView: 'landing' });
  },

  setMainView: (view: MainView) => set({ mainView: view }),

  setActiveLectureTab: (tab: LectureTab) => set({ activeLectureTab: tab }),

  selectLecture: (id: string, startTab: LectureTab = 'summary') => {
    const lecture = get().lectures.find((l) => l.id === id);
    if (lecture) {
      set({
        currentLectureId: id,
        mainView: 'lecture',
        activeLectureTab: startTab,
        currentTime: 0,
        isPlaying: false,
        duration: lecture.durationSeconds,
        highlightedSegmentId: null,
      });
    }
  },

  createLecture: async (lecture: Lecture) => {
    await lectureRepository.save(lecture);
    await localSearchEngine.indexLecture(lecture);
    const updated = await lectureRepository.getAll();
    const storageEst = await getStorageEstimate();
    set({
      lectures: updated,
      currentLectureId: lecture.id,
      mainView: 'lecture',
      activeLectureTab: 'summary',
      currentTime: 0,
      duration: lecture.durationSeconds,
      storageUsage: storageEst,
    });
  },

  deleteLecture: async (id: string) => {
    await lectureRepository.delete(id);
    const updated = await lectureRepository.getAll();
    const storageEst = await getStorageEstimate();
    set({
      lectures: updated,
      currentLectureId: get().currentLectureId === id ? null : get().currentLectureId,
      mainView: get().currentLectureId === id ? 'dashboard' : get().mainView,
      storageUsage: storageEst,
    });
  },

  updateLecture: async (lecture: Lecture) => {
    await lectureRepository.save(lecture);
    await localSearchEngine.indexLecture(lecture);
    const updated = await lectureRepository.getAll();
    set({ lectures: updated });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setDuration: (duration: number) => set({ duration }),

  setIsPlaying: (playing: boolean) => set({ isPlaying: playing }),

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: rate });
    settingsRepository.saveSettings({ playbackSpeed: rate }).catch(() => {});
  },

  seekTo: (seconds: number, segmentId?: string) => {
    set({
      seekTarget: seconds,
      currentTime: seconds,
      highlightedSegmentId: segmentId || null,
    });
    // Auto-clear highlight after 4 seconds
    if (segmentId) {
      setTimeout(() => {
        if (get().highlightedSegmentId === segmentId) {
          set({ highlightedSegmentId: null });
        }
      }, 4000);
    }
  },

  setIsTranscribing: (isTranscribing: boolean) => set({ isTranscribing }),

  setTranscriptionProgress: (progress: TranscriptionProgress | null) =>
    set({ transcriptionProgress: progress }),

  setLocalOnlyMode: async (enabled: boolean) => {
    await settingsRepository.saveSettings({ localOnlyMode: enabled });
    set({ localOnlyMode: enabled });
  },

  setSelectedModel: async (model: 'whisper-tiny' | 'whisper-base') => {
    await settingsRepository.saveSettings({ selectedModel: model });
    set({ selectedModel: model });
  },

  setPreferredLanguage: async (lang: Language) => {
    await settingsRepository.saveSettings({ preferredLanguage: lang });
    set({ preferredLanguage: lang });
  },

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lecturelens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lecturelens_theme', 'light');
    }
    settingsRepository.saveSettings({ darkMode: next }).catch(() => {});
    set({ isDarkMode: next });
  },

  toggleDemoMode: () => {
    set({ demoMode: !get().demoMode });
  },

  rateFlashcard: async (lectureId: string, flashcardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    const lecture = get().lectures.find((l) => l.id === lectureId);
    if (!lecture) return;

    const updatedFlashcards = lecture.flashcards.map((fc) =>
      fc.id === flashcardId ? { ...fc, userRating: rating, lastReviewed: Date.now() } : fc
    );

    const updatedLecture: Lecture = { ...lecture, flashcards: updatedFlashcards };
    await lectureRepository.save(updatedLecture);
    const all = await lectureRepository.getAll();
    set({ lectures: all });
  },

  answerQuizQuestion: async (lectureId: string, questionId: string, selectedOption: string) => {
    const lecture = get().lectures.find((l) => l.id === lectureId);
    if (!lecture) return;

    const updatedQuiz = lecture.quiz.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          userSelected: selectedOption,
          isCorrect: selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase(),
        };
      }
      return q;
    });

    const updatedLecture: Lecture = { ...lecture, quiz: updatedQuiz };
    await lectureRepository.save(updatedLecture);
    const all = await lectureRepository.getAll();
    set({ lectures: all });
  },

  resetQuiz: async (lectureId: string) => {
    const lecture = get().lectures.find((l) => l.id === lectureId);
    if (!lecture) return;

    const resetQuestions = lecture.quiz.map((q) => ({
      ...q,
      userSelected: undefined,
      isCorrect: undefined,
    }));

    const updatedLecture: Lecture = { ...lecture, quiz: resetQuestions };
    await lectureRepository.save(updatedLecture);
    const all = await lectureRepository.getAll();
    set({ lectures: all });
  },

  addGroundedQA: async (lectureId: string, qa: GroundedAnswer) => {
    const lecture = get().lectures.find((l) => l.id === lectureId);
    if (!lecture) return;

    const existingQA = lecture.groundedQA || [];
    const updatedLecture: Lecture = {
      ...lecture,
      groundedQA: [qa, ...existingQA],
    };

    await lectureRepository.save(updatedLecture);
    const all = await lectureRepository.getAll();
    set({ lectures: all });
  },

  openConceptModal: (concept: ConceptCard) => set({ conceptCard: concept, isConceptModalOpen: true }),

  closeConceptModal: () => set({ conceptCard: null, isConceptModalOpen: false }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  refreshStorage: async () => {
    const est = await getStorageEstimate();
    set({ storageUsage: est });
  },

  deleteAllData: async () => {
    await clearAllLocalData();
    // Repopulate samples cleanly so app remains functional
    for (const sample of SAMPLE_LECTURES) {
      await lectureRepository.save(sample);
    }
    const refreshed = await lectureRepository.getAll();
    const est = await getStorageEstimate();
    set({
      lectures: refreshed,
      currentLectureId: null,
      mainView: 'dashboard',
      storageUsage: est,
    });
  },
}));
