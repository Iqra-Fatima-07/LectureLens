import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { parseTimestampToSeconds } from '../../audio/audioProcessor';
import { X, Sparkles, Clock, ArrowRight, BookOpen } from 'lucide-react';

export const ExplainConceptModal: React.FC = () => {
  const { conceptCard, isConceptModalOpen, closeConceptModal, seekTo } = useAppStore();

  if (!isConceptModalOpen || !conceptCard) return null;

  const handleJumpToEvidence = () => {
    if (conceptCard.evidenceTimestamp) {
      seekTo(parseTimestampToSeconds(conceptCard.evidenceTimestamp));
      closeConceptModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] rounded-xl shadow-2xl p-6 sm:p-7 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] dark:border-[#2A2825]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono-code font-bold tracking-widest px-2 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E] border border-[#C8102E]/20">
              Concept Card
            </span>
          </div>
          <button
            onClick={closeConceptModal}
            className="p-1 rounded-md text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close concept card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Term Title */}
        <h3 className="text-lg font-bold text-[#121212] dark:text-[#F2EFE9] tracking-tight">
          {conceptCard.term}
        </h3>

        {/* Simple Explanation */}
        <div className="space-y-1">
          <span className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F] uppercase font-semibold">
            Simple Explanation:
          </span>
          <p className="text-xs sm:text-sm text-[#121212] dark:text-[#EAE6DF] leading-relaxed font-serif-summary">
            {conceptCard.simpleExplanation}
          </p>
        </div>

        {/* Prerequisites */}
        {conceptCard.prerequisites && (
          <div className="p-3 rounded-lg bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-1">
            <span className="text-[10px] font-mono-code text-[#666666] dark:text-[#99958F] uppercase font-semibold">
              Prerequisites:
            </span>
            <p className="text-xs text-[#121212] dark:text-[#EAE6DF]">
              {conceptCard.prerequisites}
            </p>
          </div>
        )}

        {/* Practical Example */}
        {conceptCard.practicalExample && (
          <div className="p-3 rounded-lg bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-1">
            <span className="text-[10px] font-mono-code text-[#666666] dark:text-[#99958F] uppercase font-semibold">
              Practical Example:
            </span>
            <p className="text-xs text-[#121212] dark:text-[#EAE6DF]">
              {conceptCard.practicalExample}
            </p>
          </div>
        )}

        {/* Evidence Timestamp & Action */}
        <div className="pt-3 border-t border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between">
          {conceptCard.evidenceTimestamp ? (
            <button
              onClick={handleJumpToEvidence}
              className="px-3 py-1.5 rounded-lg text-xs font-mono-code font-semibold bg-[#C8102E] hover:bg-[#A50D25] text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Evidence · {conceptCard.evidenceTimestamp}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={closeConceptModal}
            className="px-4 py-1.5 text-xs rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
