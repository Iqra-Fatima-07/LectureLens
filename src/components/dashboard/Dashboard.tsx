import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { formatTimestamp } from '../../audio/audioProcessor';
import { RecordModal } from '../recording/RecordModal';
import { ImportModal } from '../recording/ImportModal';
import { ExportModal } from '../export/ExportModal';
import { Lecture } from '../../types';
import {
  Mic,
  Upload,
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  Trash2,
  Download,
  HardDrive,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    lectures,
    selectLecture,
    deleteLecture,
    storageUsage,
    demoMode,
    localOnlyMode,
  } = useAppStore();

  const [searchFilter, setSearchFilter] = useState('');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [exportLecture, setExportLecture] = useState<Lecture | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredLectures = useMemo(() => {
    if (!searchFilter.trim()) return lectures;
    const q = searchFilter.toLowerCase();
    return lectures.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.courseSubject.toLowerCase().includes(q) ||
        l.transcript.some((t) => t.text.toLowerCase().includes(q))
    );
  }, [lectures, searchFilter]);

  const handleTrySample = () => {
    // Select the first sample lecture (Operating Systems: Deadlocks)
    const sample = lectures.find((l) => l.id === 'sample_os_deadlocks') || lectures[0];
    if (sample) {
      selectLecture(sample.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] p-6 sm:p-8 overflow-hidden shadow-sm">
        {/* Subtle background red accent glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8102E]/5 dark:bg-[#C8102E]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono-code font-medium bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
              <Cpu className="w-3 h-3" />
              <span>Snapdragon® AI PC Study Copilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
              Your lectures, understood privately.
            </h1>
            <p className="text-sm text-[#666666] dark:text-[#99958F] leading-relaxed">
              Real browser speech recognition with Whisper ONNX (WebGPU/WASM), grounded lecture intelligence, flashcards, and quizzes. Audio stays on your laptop—always.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTrySample}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] hover:bg-[#F0EDE6] dark:hover:bg-[#2A2928] text-[#121212] dark:text-[#F2EFE9] border border-[#E5E0D8] dark:border-[#383531] flex items-center gap-2 transition-all shadow-sm group"
            >
              <Sparkles className="w-4 h-4 text-[#C8102E]" />
              <span>Try Sample Lecture</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#666666] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setIsRecordOpen(true)}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#C8102E] hover:bg-[#A50D25] text-white flex items-center gap-2 shadow-sm transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Record Lecture</span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-white dark:bg-[#252423] hover:bg-black/5 dark:hover:bg-white/5 text-[#121212] dark:text-[#F2EFE9] border border-[#E5E0D8] dark:border-[#33312E] flex items-center gap-2 transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Import Audio/Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Real Local Storage Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] dark:text-[#99958F]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search transcripts, topics, formulas..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] placeholder-[#99958F] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
          />
        </div>

        {/* Real Local Storage Meter */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] text-xs font-mono-code text-[#666666] dark:text-[#99958F]">
          <HardDrive className="w-3.5 h-3.5 text-[#C8102E]" />
          <span>Local IndexedDB:</span>
          <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">
            {storageUsage.isAvailable ? `${storageUsage.usageMb} MB` : 'Active'}
          </span>
          {storageUsage.isAvailable && storageUsage.quotaMb > 0 && (
            <span className="text-[10px] text-[#99958F]">
              ({storageUsage.percentUsed}% of disk allocated)
            </span>
          )}
        </div>
      </div>

      {/* Lectures Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9] tracking-tight flex items-center gap-2">
            <span>Lecture Library</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-mono-code">
              {filteredLectures.length}
            </span>
          </h2>

          {localOnlyMode && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono-code">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local-only mode active</span>
            </div>
          )}
        </div>

        {filteredLectures.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-[#99958F]" />
            <p className="text-sm font-medium text-[#121212] dark:text-[#F2EFE9]">No lectures found</p>
            <p className="text-xs text-[#666666] dark:text-[#99958F] max-w-sm mx-auto">
              {searchFilter
                ? `No lectures match "${searchFilter}". Try another search term.`
                : 'Your library is empty. Click Record or Import to analyze your first lecture.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="group relative flex flex-col justify-between rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] hover:border-[#C8102E]/40 hover:shadow-md transition-all p-5"
              >
                <div>
                  {/* Top line badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono-code uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#666666] dark:text-[#99958F] truncate">
                      {lecture.courseSubject}
                    </span>
                    {lecture.isSample && (
                      <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
                        Sample lecture
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => selectLecture(lecture.id)}
                    className="text-base font-semibold text-[#121212] dark:text-[#F2EFE9] group-hover:text-[#C8102E] cursor-pointer transition-colors line-clamp-2"
                  >
                    {lecture.title}
                  </h3>

                  {/* Metadata Chips */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#666666] dark:text-[#99958F] font-mono-code">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimestamp(lecture.durationSeconds)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(lecture.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{lecture.topics.length} topics</span>
                    </div>
                  </div>

                  {/* Summary Snippet */}
                  {lecture.summary?.tldr && (
                    <p className="mt-3 text-xs text-[#666666] dark:text-[#99958F] line-clamp-2 font-serif-summary">
                      {lecture.summary.tldr}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between">
                  <button
                    onClick={() => selectLecture(lecture.id)}
                    className="text-xs font-semibold text-[#C8102E] hover:text-[#A50D25] flex items-center gap-1 transition-colors"
                  >
                    <span>Open Lecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setExportLecture(lecture)}
                      className="p-1.5 rounded text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Export Markdown & Anki CSV"
                      aria-label="Export lecture"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setConfirmDeleteId(lecture.id)}
                      className="p-1.5 rounded text-[#666666] dark:text-[#99958F] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete lecture"
                      aria-label="Delete lecture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] p-5 space-y-4 shadow-xl">
            <h4 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">Delete Lecture?</h4>
            <p className="text-xs text-[#666666] dark:text-[#99958F]">
              This will remove this lecture and all associated transcript segments, summaries, and flashcards from your local IndexedDB storage.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-xs rounded-md border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteLecture(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-1.5 text-xs rounded-md bg-[#C8102E] hover:bg-[#A50D25] text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <RecordModal isOpen={isRecordOpen} onClose={() => setIsRecordOpen(false)} />
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      {exportLecture && (
        <ExportModal lecture={exportLecture} onClose={() => setExportLecture(null)} />
      )}
    </div>
  );
};
