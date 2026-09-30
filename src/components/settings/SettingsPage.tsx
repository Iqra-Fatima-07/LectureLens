import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BrowserWhisperEngine } from '../../engine/BrowserWhisperEngine';
import { Language } from '../../types';
import {
  Settings,
  Shield,
  Cpu,
  Globe,
  Trash2,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';

const whisperEngine = new BrowserWhisperEngine();

export const SettingsPage: React.FC = () => {
  const {
    localOnlyMode,
    setLocalOnlyMode,
    selectedModel,
    setSelectedModel,
    preferredLanguage,
    setPreferredLanguage,
    storageUsage,
    refreshStorage,
    deleteAllData,
    demoMode,
    toggleDemoMode,
  } = useAppStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  const handleClearModelCache = async () => {
    await whisperEngine.clearCachedModel();
    setCacheClearedSuccess(true);
    setTimeout(() => setCacheClearedSuccess(false), 3000);
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await deleteAllData();
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5E0D8] dark:border-[#2A2825]">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono-code font-semibold bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F] mb-1.5">
          <Settings className="w-3 h-3" />
          <span>Application Preferences</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
          Settings & Local Data Controls
        </h1>
        <p className="text-xs text-[#666666] dark:text-[#99958F] mt-0.5">
          Configure model parameters, language options, and privacy guardrails.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. Privacy & Local-Only Mode */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C8102E]" />
                <h3 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
                  Local-Only Mode
                </h3>
              </div>
              <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
                When active, all cloud AI features (Gemini summarization, quiz generation, Q&A) are completely disabled. Whisper transcription, audio playback, storage, and local search remain 100% functional on-device with zero bytes sent externally.
              </p>
            </div>

            <button
              onClick={() => setLocalOnlyMode(!localOnlyMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                localOnlyMode ? 'bg-[#C8102E]' : 'bg-[#D1CCC4] dark:bg-[#383531]'
              }`}
              role="switch"
              aria-checked={localOnlyMode}
              aria-label="Toggle Local-Only Mode"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localOnlyMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2 font-mono-code text-xs text-[#666666] dark:text-[#99958F]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Audio recordings are never uploaded under any circumstance.</span>
          </div>
        </div>

        {/* 2. Model Selection */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#C8102E]" />
              <h3 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
                On-Device Speech Recognition Model
              </h3>
            </div>
            <p className="text-xs text-[#666666] dark:text-[#99958F]">
              Select which Whisper ONNX model to execute on your browser (WebGPU/WASM).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setSelectedModel('whisper-tiny')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedModel === 'whisper-tiny'
                  ? 'border-[#C8102E] bg-[#C8102E]/5 dark:bg-[#C8102E]/10 ring-1 ring-[#C8102E]'
                  : 'border-[#E5E0D8] dark:border-[#2A2825] bg-[#FAF8F5] dark:bg-[#201F1E] hover:border-[#C8102E]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#121212] dark:text-[#F2EFE9]">
                  Whisper Tiny (Default)
                </span>
                <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                  ~39 MB
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-[#99958F] mt-1.5 leading-snug">
                Fastest initialization, minimal memory footprint. Recommended for everyday lecture recordings.
              </p>
            </button>

            <button
              onClick={() => setSelectedModel('whisper-base')}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedModel === 'whisper-base'
                  ? 'border-[#C8102E] bg-[#C8102E]/5 dark:bg-[#C8102E]/10 ring-1 ring-[#C8102E]'
                  : 'border-[#E5E0D8] dark:border-[#2A2825] bg-[#FAF8F5] dark:bg-[#201F1E] hover:border-[#C8102E]/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#121212] dark:text-[#F2EFE9]">
                  Whisper Base
                </span>
                <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                  ~74 MB
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-[#99958F] mt-1.5 leading-snug">
                Higher word accuracy for complex STEM formulas, accented lectures, and multilingual audio.
              </p>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleClearModelCache}
              className="text-xs font-mono-code text-[#C8102E] hover:underline"
            >
              Clear downloaded ONNX models from browser cache
            </button>
            {cacheClearedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono-code flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Cache cleared</span>
              </span>
            )}
          </div>
        </div>

        {/* 3. Language Selector */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C8102E]" />
              <h3 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
                Language Preference
              </h3>
            </div>
            <p className="text-xs text-[#666666] dark:text-[#99958F]">
              English, Hindi, and Hinglish lectures are handled through multilingual Whisper transcription.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'auto', label: 'Auto Detect', note: 'Recommended for mixed / Hinglish' },
              { id: 'en', label: 'English', note: 'Enforce English vocabulary' },
              { id: 'hi', label: 'Hindi', note: 'Devanagari script transcription' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setPreferredLanguage(lang.id as Language)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  preferredLanguage === lang.id
                    ? 'border-[#C8102E] bg-[#C8102E]/5 dark:bg-[#C8102E]/10 ring-1 ring-[#C8102E]'
                    : 'border-[#E5E0D8] dark:border-[#2A2825] bg-[#FAF8F5] dark:bg-[#201F1E]'
                }`}
              >
                <div className="text-xs font-bold text-[#121212] dark:text-[#F2EFE9]">{lang.label}</div>
                <div className="text-[10px] text-[#666666] dark:text-[#99958F] mt-1">{lang.note}</div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-[#666666] dark:text-[#99958F] italic">
            * Note: Hinglish lectures are transcribed with best effort multilingual recognition.
          </p>
        </div>

        {/* 4. Local Storage & Danger Zone */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-red-200 dark:border-red-950/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-red-600 dark:text-red-400" />
              <h3 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
                Storage & Data Management
              </h3>
            </div>
            <span className="font-mono-code text-xs text-[#666666] dark:text-[#99958F]">
              IndexedDB: {storageUsage.isAvailable ? `${storageUsage.usageMb} MB` : 'Active'}
            </span>
          </div>

          <p className="text-xs text-[#666666] dark:text-[#99958F]">
            All lectures, transcripts, summaries, flashcard review states, and quiz attempts are saved locally on your device.
          </p>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
              Erase all local lectures and reset to clean state:
            </span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] p-6 space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9]">
              Are you sure you want to delete all data?
            </h4>
            <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
              This will permanently delete all user-recorded lectures, transcripts, and progress from your browser's IndexedDB storage.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 text-xs rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
