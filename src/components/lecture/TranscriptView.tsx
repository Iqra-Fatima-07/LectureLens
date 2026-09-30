import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TranscriptSegment } from '../../types';
import { GeminiEngine } from '../../engine/GeminiEngine';
import { Search, Sparkles, HelpCircle, Loader2 } from 'lucide-react';

interface TranscriptViewProps {
  segments: TranscriptSegment[];
  lectureTitle: string;
}

const geminiEngine = new GeminiEngine();

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  segments,
  lectureTitle,
}) => {
  const {
    currentTime,
    seekTo,
    highlightedSegmentId,
    openConceptModal,
    localOnlyMode,
  } = useAppStore();

  const [filterText, setFilterText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Find active segment matching currentTime
  const activeSegmentIndex = useMemo(() => {
    return segments.findIndex(
      (s) => currentTime >= s.start && currentTime <= s.end
    );
  }, [segments, currentTime]);

  // Filtered segments
  const filteredSegments = useMemo(() => {
    if (!filterText.trim()) return segments;
    const q = filterText.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [segments, filterText]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeSegmentIndex !== -1 && containerRef.current) {
      const activeEl = containerRef.current.querySelector(
        `[data-segment-index="${activeSegmentIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeSegmentIndex]);

  // Text selection listener
  const handleMouseUp = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 5 && selection.length < 300) {
      setSelectedText(selection);
    } else {
      setSelectedText('');
    }
  };

  const handleExplainSelection = async (textToExplain: string) => {
    if (!textToExplain) return;
    setIsExplaining(true);
    try {
      // Find surrounding transcript context
      const fullContext = segments.map((s) => s.text).join(' ');
      const concept = await geminiEngine.explainConcept(
        textToExplain,
        fullContext.slice(0, 3000),
        lectureTitle,
        localOnlyMode
      );
      openConceptModal(concept);
    } catch (err) {
      console.error('Failed to explain concept:', err);
    } finally {
      setIsExplaining(false);
      setSelectedText('');
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] overflow-hidden shadow-sm">
      {/* Transcript Header with Search & Text Selection Popover */}
      <div className="p-3.5 border-b border-[#E5E0D8] dark:border-[#2A2825] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9]">Transcript</span>
          <span className="text-[11px] font-mono-code px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F]">
            {segments.length} segments
          </span>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666] dark:text-[#99958F]" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search transcript..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] placeholder-[#99958F] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
          />
        </div>
      </div>

      {/* Floating Selection "Explain This" Banner */}
      {selectedText && (
        <div className="bg-[#FAF8F5] dark:bg-[#252423] border-b border-[#E5E0D8] dark:border-[#2A2825] px-4 py-2 flex items-center justify-between gap-2 animate-in fade-in">
          <p className="text-xs text-[#121212] dark:text-[#F2EFE9] truncate max-w-md">
            Selected: <span className="font-semibold italic">"{selectedText}"</span>
          </p>
          <button
            onClick={() => handleExplainSelection(selectedText)}
            disabled={isExplaining}
            className="px-2.5 py-1 text-xs rounded-md bg-[#C8102E] hover:bg-[#A50D25] text-white font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            {isExplaining ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Explain This</span>
          </button>
        </div>
      )}

      {/* Segments List */}
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#E5E0D8]/40 dark:divide-[#2A2825]/40"
      >
        {filteredSegments.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#666666] dark:text-[#99958F]">
            No transcript segments match "{filterText}".
          </div>
        ) : (
          filteredSegments.map((segment, index) => {
            const isActive =
              currentTime >= segment.start && currentTime <= segment.end;
            const isHighlighted = highlightedSegmentId === segment.id;

            return (
              <div
                key={segment.id}
                data-segment-index={index}
                className={`pt-2.5 rounded-lg px-3 transition-colors ${
                  isHighlighted
                    ? 'bg-[#C8102E]/10 dark:bg-[#C8102E]/20 ring-1 ring-[#C8102E]/50'
                    : isActive
                    ? 'bg-black/5 dark:bg-white/5 font-medium'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Clickable Timestamp Chip */}
                  <button
                    onClick={() => seekTo(segment.start, segment.id)}
                    className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono-code font-semibold bg-black/5 dark:bg-white/10 hover:bg-[#C8102E] hover:text-white dark:hover:bg-[#C8102E] dark:hover:text-white text-[#666666] dark:text-[#99958F] transition-colors"
                    title={`Jump to ${segment.startTimestamp}`}
                  >
                    {segment.startTimestamp}
                  </button>

                  {/* Transcript Content */}
                  <p className="text-xs leading-relaxed text-[#121212] dark:text-[#EAE6DF] select-text">
                    {segment.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
