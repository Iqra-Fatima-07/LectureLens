import React, { useState } from 'react';
import { useAppStore, LectureTab } from '../../store/useAppStore';
import { AudioPlayer } from './AudioPlayer';
import { TranscriptView } from './TranscriptView';
import { SummaryTab } from './tabs/SummaryTab';
import { FlashcardsTab } from './tabs/FlashcardsTab';
import { QuizTab } from './tabs/QuizTab';
import { AskTab } from './tabs/AskTab';
import { ExportModal } from '../export/ExportModal';
import { formatTimestamp } from '../../audio/audioProcessor';
import {
  ArrowLeft,
  Download,
  BookOpen,
  Layers,
  HelpCircle,
  Sparkles,
  Clock,
  Calendar,
  Share2,
} from 'lucide-react';

export const LectureView: React.FC = () => {
  const {
    currentLectureId,
    lectures,
    setMainView,
    activeLectureTab,
    setActiveLectureTab,
  } = useAppStore();

  const [isExportOpen, setIsExportOpen] = useState(false);

  const lecture = lectures.find((l) => l.id === currentLectureId);

  if (!lecture) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <p className="text-sm text-[#666666] dark:text-[#99958F]">Lecture not found or was removed.</p>
        <button
          onClick={() => setMainView('dashboard')}
          className="px-4 py-2 rounded-lg bg-[#C8102E] text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const fullTranscriptText = lecture.transcript.map((t) => t.text).join(' ');

  const tabs: { id: LectureTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'summary', label: 'Summary', icon: <BookOpen className="w-3.5 h-3.5" /> },
    {
      id: 'flashcards',
      label: 'Flashcards',
      icon: <Layers className="w-3.5 h-3.5" />,
      badge: lecture.flashcards.length,
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      badge: lecture.quiz.length,
    },
    { id: 'ask', label: 'Ask Grounded AI', icon: <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Bar: Back button, Title & Metadata, Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8] dark:border-[#2A2825]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMainView('dashboard')}
            className="p-2 rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#1A1918] text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F]">
                {lecture.courseSubject}
              </span>
              {lecture.isSample && (
                <span className="text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
                  Sample lecture
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9] mt-0.5">
              {lecture.title}
            </h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="hidden md:flex items-center gap-3 text-xs font-mono-code text-[#666666] dark:text-[#99958F] mr-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTimestamp(lecture.durationSeconds)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(lecture.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <button
            onClick={() => setIsExportOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#1A1918] text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Notes</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Audio Player + Timestamped Transcript */}
        <div className="lg:col-span-6 space-y-4 flex flex-col h-[750px]">
          {/* Audio Player */}
          <AudioPlayer
            durationSeconds={lecture.durationSeconds}
            audioBlob={lecture.audioBlob}
            audioUrl={lecture.audioUrl}
          />

          {/* Interactive Transcript View */}
          <div className="flex-1 min-h-0">
            <TranscriptView
              segments={lecture.transcript}
              lectureTitle={lecture.title}
            />
          </div>
        </div>

        {/* Right Column (6 cols): Study Copilot Tabs (Summary, Flashcards, Quiz, Ask) */}
        <div className="lg:col-span-6 flex flex-col h-[750px] rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm overflow-hidden">
          {/* Tab Navigation Headers */}
          <div className="flex items-center border-b border-[#E5E0D8] dark:border-[#2A2825] px-3 pt-2 bg-[#FAF8F5]/80 dark:bg-[#141312]/80">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveLectureTab(t.id)}
                className={`px-3.5 py-2.5 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeLectureTab === t.id
                    ? 'border-[#C8102E] text-[#121212] dark:text-white font-semibold'
                    : 'border-transparent text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="ml-1 text-[10px] font-mono-code px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-5">
            {activeLectureTab === 'summary' && (
              <SummaryTab
                summary={lecture.summary}
                lectureId={lecture.id}
                lectureTitle={lecture.title}
                transcriptText={fullTranscriptText}
              />
            )}

            {activeLectureTab === 'flashcards' && (
              <FlashcardsTab
                flashcards={lecture.flashcards}
                lectureId={lecture.id}
                lectureTitle={lecture.title}
              />
            )}

            {activeLectureTab === 'quiz' && (
              <QuizTab quiz={lecture.quiz} lectureId={lecture.id} />
            )}

            {activeLectureTab === 'ask' && (
              <AskTab
                lectureId={lecture.id}
                lectureTitle={lecture.title}
                transcript={lecture.transcript}
                topics={lecture.topics}
                groundedQA={lecture.groundedQA || []}
              />
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {isExportOpen && (
        <ExportModal lecture={lecture} onClose={() => setIsExportOpen(false)} />
      )}
    </div>
  );
};
