import React, { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { GroundedAnswer, TranscriptSegment, Topic } from '../../../types';
import { GeminiEngine } from '../../../engine/GeminiEngine';
import { parseTimestampToSeconds } from '../../../audio/audioProcessor';
import {
  Sparkles,
  Send,
  Clock,
  AlertCircle,
  HelpCircle,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AskTabProps {
  lectureId: string;
  lectureTitle: string;
  transcript: TranscriptSegment[];
  topics: Topic[];
  groundedQA: GroundedAnswer[];
}

const geminiEngine = new GeminiEngine();

export const AskTab: React.FC<AskTabProps> = ({
  lectureId,
  lectureTitle,
  transcript,
  topics,
  groundedQA,
}) => {
  const { seekTo, addGroundedQA, localOnlyMode } = useAppStore();
  const [questionInput, setQuestionInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fullTranscriptText = transcript.map((t) => `[${t.startTimestamp}] ${t.text}`).join('\n');

  // Suggested high-yield questions based on lecture title
  const suggestedQuestions = [
    'Why does deadlock occur in this lecture?',
    'What are the key formulas or laws explained?',
    'Summarize the professor\'s main conclusion.',
  ];

  const handleAsk = async (query: string) => {
    if (!query.trim() || isLoading) return;
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await geminiEngine.answerQuestion(
        query.trim(),
        {
          lectureId,
          title: lectureTitle,
          transcript,
          topics,
          fullTranscriptText,
        },
        localOnlyMode
      );

      await addGroundedQA(lectureId, response);
      setQuestionInput('');
    } catch (err: any) {
      setErrorMsg(`Failed to answer: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitationClick = (citationTimestamp: string) => {
    const sec = parseTimestampToSeconds(citationTimestamp);
    // Find matching segment ID
    const matchingSeg = transcript.find(
      (s) => Math.abs(s.start - sec) <= 15 || (sec >= s.start && sec <= s.end)
    );
    seekTo(sec, matchingSeg?.id);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Grounding banner */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm flex items-center justify-between text-xs font-mono-code text-[#666666] dark:text-[#99958F]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C8102E]" />
          <span>Strictly Grounded in this Lecture Only</span>
        </div>
        {localOnlyMode && (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Local-only mode active
          </span>
        )}
      </div>

      {/* Suggested prompts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
          Suggested lecture inquiries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuestionInput(q);
                handleAsk(q);
              }}
              disabled={isLoading}
              className="text-left text-xs px-2.5 py-1 rounded-md bg-white dark:bg-[#1A1918] hover:bg-[#FAF8F5] dark:hover:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] hover:border-[#C8102E]/40 text-[#121212] dark:text-[#EAE6DF] transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(questionInput);
        }}
        className="relative"
      >
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          placeholder={
            localOnlyMode
              ? 'Local-only mode active (Cloud Q&A disabled)'
              : 'Ask a question grounded in this lecture...'
          }
          disabled={isLoading || localOnlyMode}
          className="w-full pl-4 pr-11 py-2.5 text-xs rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] placeholder-[#99958F] focus:outline-none focus:ring-1 focus:ring-[#C8102E] shadow-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!questionInput.trim() || isLoading || localOnlyMode}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#C8102E] hover:bg-[#A50D25] disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs"
          aria-label="Submit question"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#C8102E]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grounded Answers List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {groundedQA.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-[#99958F]" />
            <p className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">No Questions Asked Yet</p>
            <p className="text-xs text-[#666666] dark:text-[#99958F] max-w-sm mx-auto">
              Ask any concept or click one of the suggested prompts above. Answers will cite verified lecture timestamps that seek the audio player when clicked.
            </p>
          </div>
        ) : (
          groundedQA.map((qa) => (
            <div
              key={qa.id}
              className="p-5 rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-3"
            >
              {/* Question */}
              <div className="flex items-start gap-2">
                <span className="font-mono-code text-xs font-semibold text-[#C8102E]">Q:</span>
                <p className="text-xs sm:text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
                  {qa.question}
                </p>
              </div>

              {/* Grounded Answer */}
              <div className="space-y-2.5 pl-4 border-l-2 border-[#C8102E]/30">
                <p className="text-xs sm:text-sm leading-relaxed text-[#121212] dark:text-[#EAE6DF]">
                  {qa.answer}
                </p>

                {/* Evidence Citations (Click to seek audio + highlight transcript) */}
                {qa.citations && qa.citations.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
                      Evidence:
                    </span>
                    {qa.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleCitationClick(c.timestamp)}
                        className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-code font-semibold bg-[#FAF8F5] dark:bg-[#201F1E] hover:bg-[#C8102E] text-[#C8102E] hover:text-white dark:text-red-400 dark:hover:text-white border border-[#E5E0D8] dark:border-[#33312E] hover:border-[#C8102E] transition-all shadow-2xs"
                        title={`Click to jump audio to ${c.timestamp} and highlight transcript`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>Source Lecture · {c.timestamp}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
