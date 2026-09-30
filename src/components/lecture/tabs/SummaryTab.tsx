import React, { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { LectureSummary } from '../../../types';
import { GeminiEngine } from '../../../engine/GeminiEngine';
import { parseTimestampToSeconds } from '../../../audio/audioProcessor';
import {
  BookOpen,
  Sparkles,
  Key,
  FunctionSquare,
  HelpCircle,
  Clock,
  Loader2,
  Lock,
} from 'lucide-react';

interface SummaryTabProps {
  summary?: LectureSummary;
  lectureId: string;
  lectureTitle: string;
  transcriptText: string;
}

const geminiEngine = new GeminiEngine();

export const SummaryTab: React.FC<SummaryTabProps> = ({
  summary,
  lectureId,
  lectureTitle,
  transcriptText,
}) => {
  const { seekTo, localOnlyMode, updateLecture, lectures } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateStudyGuide = async () => {
    if (localOnlyMode) {
      setErrorMsg('Cannot generate cloud summary while Local-only mode is active. Disable Local-only mode in Settings to use Gemini.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const result = await geminiEngine.analyzeLecture(transcriptText, lectureTitle, 'auto', false);
      const current = lectures.find((l) => l.id === lectureId);
      if (current) {
        await updateLecture({
          ...current,
          summary: result.summary,
          topics: result.topics.length > 0 ? result.topics : current.topics,
          flashcards: result.flashcards.length > 0 ? result.flashcards : current.flashcards,
          quiz: result.quiz.length > 0 ? result.quiz : current.quiz,
        });
      }
    } catch (err: any) {
      setErrorMsg(`Failed to generate summary: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSeekEvidence = (evidenceTs?: string) => {
    if (!evidenceTs) return;
    const sec = parseTimestampToSeconds(evidenceTs);
    seekTo(sec);
  };

  if (!summary) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] space-y-4">
        <BookOpen className="w-10 h-10 mx-auto text-[#99958F]" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">No Summary Available Yet</h4>
          <p className="text-xs text-[#666666] dark:text-[#99958F] max-w-sm mx-auto">
            {localOnlyMode
              ? 'Local-only mode is active. Cloud summarization with Gemini 2.5 Flash is disabled to keep all data strictly on-device.'
              : 'Generate an editorial TL;DR, key takeaways, mathematical formulas, and definitions from this lecture transcript.'}
          </p>
        </div>

        {errorMsg && (
          <div className="text-xs text-red-600 dark:text-red-400 p-2 rounded bg-red-50 dark:bg-red-950/40">
            {errorMsg}
          </div>
        )}

        {!localOnlyMode ? (
          <button
            onClick={handleGenerateStudyGuide}
            disabled={isGenerating || !transcriptText}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C8102E] hover:bg-[#A50D25] disabled:opacity-50 text-white flex items-center gap-2 mx-auto shadow-sm transition-colors"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Generate Study Guide (Gemini 2.5 Flash)</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono-code bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-3.5 h-3.5" />
            <span>0 bytes sent externally</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-y-auto pr-1">
      {/* TL;DR Section */}
      <div className="rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C8102E] uppercase tracking-wider font-mono-code">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lecture Overview & TL;DR</span>
        </div>
        <p className="font-serif-summary text-sm sm:text-base leading-relaxed text-[#121212] dark:text-[#F2EFE9] font-normal">
          {summary.tldr}
        </p>
      </div>

      {/* Key Points / Takeaways */}
      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] p-5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] uppercase tracking-wider font-mono-code">
            <Key className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Core Takeaways</span>
          </div>
          <div className="space-y-3">
            {summary.keyPoints.map((kp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">
                    {kp.point}
                  </h4>
                  {kp.evidenceTimestamp && (
                    <button
                      onClick={() => handleSeekEvidence(kp.evidenceTimestamp)}
                      className="shrink-0 px-2 py-0.5 rounded text-[11px] font-mono-code font-medium bg-white dark:bg-[#2B2927] hover:bg-[#C8102E] hover:text-white dark:hover:bg-[#C8102E] text-[#666666] dark:text-[#99958F] border border-[#E5E0D8] dark:border-[#33312E] transition-colors flex items-center gap-1"
                      title="Seek audio to evidence citation"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{kp.evidenceTimestamp}</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#666666] dark:text-[#A8A49D] leading-relaxed">
                  {kp.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulas & Mathematical Theorems */}
      {summary.formulas && summary.formulas.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] p-5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] uppercase tracking-wider font-mono-code">
            <FunctionSquare className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Formulas & Mathematical Laws</span>
          </div>
          <div className="space-y-3">
            {summary.formulas.map((f, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">
                    {f.name}
                  </span>
                  {f.evidenceTimestamp && (
                    <button
                      onClick={() => handleSeekEvidence(f.evidenceTimestamp)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-white dark:bg-[#2B2927] text-[#666666] dark:text-[#99958F] hover:bg-[#C8102E] hover:text-white transition-colors"
                    >
                      {f.evidenceTimestamp}
                    </button>
                  )}
                </div>
                <div className="p-2.5 rounded bg-black/5 dark:bg-black/40 font-mono-code text-xs text-[#C8102E] dark:text-red-400 font-semibold overflow-x-auto">
                  {f.formula}
                </div>
                <p className="text-xs text-[#666666] dark:text-[#A8A49D]">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Definitions */}
      {summary.definitions && summary.definitions.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] p-5 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] uppercase tracking-wider font-mono-code">
            <HelpCircle className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Glossary & Definitions</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {summary.definitions.map((def, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">
                    {def.term}
                  </span>
                  {def.evidenceTimestamp && (
                    <button
                      onClick={() => handleSeekEvidence(def.evidenceTimestamp)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-white dark:bg-[#2B2927] text-[#666666] dark:text-[#99958F] hover:bg-[#C8102E] hover:text-white transition-colors"
                    >
                      {def.evidenceTimestamp}
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#666666] dark:text-[#A8A49D]">
                  {def.definition}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
