import React, { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { Flashcard } from '../../../types';
import { parseTimestampToSeconds } from '../../../audio/audioProcessor';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Download,
  Sparkles,
} from 'lucide-react';

interface FlashcardsTabProps {
  flashcards: Flashcard[];
  lectureId: string;
  lectureTitle: string;
}

export const FlashcardsTab: React.FC<FlashcardsTabProps> = ({
  flashcards,
  lectureId,
  lectureTitle,
}) => {
  const { rateFlashcard, seekTo } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] space-y-3">
        <Sparkles className="w-8 h-8 mx-auto text-[#99958F]" />
        <p className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">No Flashcards Available</p>
        <p className="text-xs text-[#666666] dark:text-[#99958F] max-w-sm mx-auto">
          Generate a study guide in the Summary tab to create 10 high-yield lecture flashcards.
        </p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    await rateFlashcard(lectureId, currentCard.id, rating);
    handleNext();
  };

  const handleExportAnki = () => {
    // Generate standard Anki TSV/CSV format: "Front\tBack\tTags"
    const rows = flashcards.map((f) => {
      const q = f.question.replace(/\t/g, ' ').replace(/"/g, '""');
      const a = `${f.answer} (Evidence: ${f.sourceTimestamp})`.replace(/\t/g, ' ').replace(/"/g, '""');
      return `"${q}"\t"${a}"\t"LectureLens ${lectureTitle.replace(/[^a-zA-Z0-9]/g, '_')}"`;
    });
    const content = rows.join('\n');
    const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lectureTitle.replace(/\s+/g, '_')}_Anki_Deck.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reviewedCount = flashcards.filter((f) => f.userRating).length;

  return (
    <div className="space-y-6">
      {/* Progress & Export bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono-code font-semibold text-[#121212] dark:text-[#F2EFE9]">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="text-[11px] font-mono-code px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F]">
            Reviewed: {reviewedCount}/{flashcards.length}
          </span>
        </div>

        <button
          onClick={handleExportAnki}
          className="text-xs font-mono-code text-[#C8102E] hover:underline flex items-center gap-1"
          title="Download Anki importable deck"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Anki (.txt)</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#E5E0D8] dark:bg-[#2A2825] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#C8102E] transition-all duration-300"
          style={{ width: `${Math.round(((currentIndex + 1) / flashcards.length) * 100)}%` }}
        />
      </div>

      {/* Flashcard container with 3D flip effect */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer perspective-1000 min-h-[260px] sm:min-h-[290px] w-full"
      >
        <div
          className={`relative w-full h-full min-h-[260px] sm:min-h-[290px] rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-transform duration-500 transform-style-3d border shadow-sm ${
            isFlipped
              ? 'bg-[#181716] text-[#F2EFE9] border-[#383531]'
              : 'bg-white dark:bg-[#1E1D1C] text-[#121212] dark:text-[#F2EFE9] border-[#E5E0D8] dark:border-[#2A2825]'
          }`}
        >
          {/* Card Top Label */}
          <div className="flex items-center justify-between text-xs font-mono-code text-[#666666] dark:text-[#99958F]">
            <span className="uppercase tracking-wider">
              {isFlipped ? 'Answer' : 'Question'}
            </span>
            <div className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-[#C8102E]" />
              <span className="text-[11px]">Click to flip</span>
            </div>
          </div>

          {/* Card Content */}
          <div className="my-auto py-4">
            {!isFlipped ? (
              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {currentCard.question}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-normal leading-relaxed text-[#EAE6DF]">
                  {currentCard.answer}
                </p>
                {currentCard.sourceTimestamp && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      seekTo(parseTimestampToSeconds(currentCard.sourceTimestamp));
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono-code bg-white/10 hover:bg-[#C8102E] text-white transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    <span>Evidence · {currentCard.sourceTimestamp}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Difficulty & Previous Rating Tag */}
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                currentCard.difficulty === 'easy'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : currentCard.difficulty === 'hard'
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}
            >
              {currentCard.difficulty}
            </span>

            {currentCard.userRating && (
              <span className="text-[11px] text-[#99958F] capitalize">
                Rated: {currentCard.userRating}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rating Buttons */}
      <div className="space-y-2">
        <span className="block text-[11px] font-mono-code text-[#666666] dark:text-[#99958F] text-center">
          Rate recall difficulty (Spaced Repetition):
        </span>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => handleRate('again')}
            className="py-2 px-1 text-xs font-medium rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-700 dark:text-red-300 transition-colors"
          >
            Again
          </button>
          <button
            onClick={() => handleRate('hard')}
            className="py-2 px-1 text-xs font-medium rounded-lg border border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300 transition-colors"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate('good')}
            className="py-2 px-1 text-xs font-medium rounded-lg border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-700 dark:text-blue-300 transition-colors"
          >
            Good
          </button>
          <button
            onClick={() => handleRate('easy')}
            className="py-2 px-1 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 transition-colors"
          >
            Easy
          </button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="px-3.5 py-1.5 rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#1A1918] text-xs font-medium text-[#121212] dark:text-[#F2EFE9] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="px-3.5 py-1.5 rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#1A1918] text-xs font-medium text-[#121212] dark:text-[#F2EFE9] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
