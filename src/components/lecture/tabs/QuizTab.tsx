import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { QuizQuestion } from '../../../types';
import { parseTimestampToSeconds } from '../../../audio/audioProcessor';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface QuizTabProps {
  quiz: QuizQuestion[];
  lectureId: string;
}

export const QuizTab: React.FC<QuizTabProps> = ({ quiz, lectureId }) => {
  const { answerQuizQuestion, resetQuiz, seekTo } = useAppStore();

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] space-y-3">
        <Sparkles className="w-8 h-8 mx-auto text-[#99958F]" />
        <p className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">No Quiz Questions Available</p>
        <p className="text-xs text-[#666666] dark:text-[#99958F] max-w-sm mx-auto">
          Generate a study guide in the Summary tab to create 8 multiple choice questions with explanations.
        </p>
      </div>
    );
  }

  const answeredCount = quiz.filter((q) => q.userSelected !== undefined).length;
  const correctCount = quiz.filter((q) => q.isCorrect).length;
  const isComplete = answeredCount === quiz.length;

  return (
    <div className="space-y-6">
      {/* Quiz Header with Score */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C8102E]/10 flex items-center justify-center text-[#C8102E]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">Lecture Mastery Quiz</h4>
            <p className="text-[11px] text-[#666666] dark:text-[#99958F] font-mono-code">
              Answered: {answeredCount}/{quiz.length} · Score: {correctCount}/{quiz.length}
            </p>
          </div>
        </div>

        <button
          onClick={() => resetQuiz(lectureId)}
          className="px-2.5 py-1 text-xs font-mono-code rounded-md border border-[#E5E0D8] dark:border-[#2A2825] hover:bg-black/5 dark:hover:bg-white/5 text-[#666666] dark:text-[#99958F] flex items-center gap-1 transition-colors"
          title="Reset quiz answers"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {quiz.map((q, qIndex) => {
          const isAnswered = q.userSelected !== undefined;

          return (
            <div
              key={q.id}
              className="p-5 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-3.5"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span className="font-mono-code text-xs font-semibold text-[#C8102E]">
                    Q{qIndex + 1}.
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-[#121212] dark:text-[#F2EFE9] leading-snug">
                    {q.question}
                  </p>
                </div>

                {isAnswered && (
                  <span className="shrink-0">
                    {q.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = q.userSelected === opt;
                  const isCorrectAnswer =
                    opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  let buttonStyle =
                    'border-[#E5E0D8] dark:border-[#2A2825] bg-[#FAF8F5] dark:bg-[#201F1E] hover:border-[#C8102E]/40 text-[#121212] dark:text-[#EAE6DF]';

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      buttonStyle =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-medium';
                    } else if (isSelected && !q.isCorrect) {
                      buttonStyle =
                        'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200';
                    } else {
                      buttonStyle = 'opacity-60 border-transparent bg-black/5 dark:bg-white/5';
                    }
                  }

                  return (
                    <button
                      key={optIndex}
                      onClick={() => answerQuizQuestion(lectureId, q.id, opt)}
                      disabled={isAnswered}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${buttonStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center font-mono-code text-[10px] shrink-0">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Academic Explanation & Evidence Link */}
              {isAnswered && (
                <div className="p-3.5 rounded-lg bg-black/5 dark:bg-[#242322] border border-[#E5E0D8]/60 dark:border-[#383531] space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-[#121212] dark:text-[#F2EFE9]">
                      Explanation
                    </span>
                    {q.sourceTimestamp && (
                      <button
                        onClick={() => seekTo(parseTimestampToSeconds(q.sourceTimestamp))}
                        className="px-2 py-0.5 rounded text-[11px] font-mono-code bg-white dark:bg-[#1A1918] hover:bg-[#C8102E] hover:text-white text-[#666666] dark:text-[#99958F] border border-[#E5E0D8] dark:border-[#33312E] transition-colors flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Evidence · {q.sourceTimestamp}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-[#666666] dark:text-[#A8A49D] leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
