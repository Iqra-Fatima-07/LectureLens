import React, { useState } from 'react';
import { Lecture } from '../../types';
import { formatTimestamp } from '../../audio/audioProcessor';
import { X, Download, FileText, Check, Copy, Layers } from 'lucide-react';

interface ExportModalProps {
  lecture: Lecture;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ lecture, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Generate comprehensive Markdown document
  const generateMarkdown = (): string => {
    let md = `# ${lecture.title}\n\n`;
    md += `**Subject:** ${lecture.courseSubject}  \n`;
    md += `**Duration:** ${formatTimestamp(lecture.durationSeconds)}  \n`;
    md += `**Date:** ${new Date(lecture.createdAt).toLocaleDateString()}  \n\n`;
    md += `---\n\n`;

    // Summary & TL;DR
    if (lecture.summary) {
      md += `## 1. Summary & Core Thesis\n\n`;
      md += `${lecture.summary.tldr}\n\n`;

      if (lecture.summary.keyPoints && lecture.summary.keyPoints.length > 0) {
        md += `### Key Takeaways\n\n`;
        lecture.summary.keyPoints.forEach((kp) => {
          md += `- **${kp.point}** (Evidence: \`${kp.evidenceTimestamp}\`)\n  ${kp.explanation}\n\n`;
        });
      }

      if (lecture.summary.formulas && lecture.summary.formulas.length > 0) {
        md += `### Mathematical & Scientific Formulas\n\n`;
        lecture.summary.formulas.forEach((f) => {
          md += `#### ${f.name} (\`${f.evidenceTimestamp || 'N/A'}\`)\n\`\`\`\n${f.formula}\n\`\`\`\n${f.description}\n\n`;
        });
      }

      if (lecture.summary.definitions && lecture.summary.definitions.length > 0) {
        md += `### Definitions & Terms\n\n`;
        lecture.summary.definitions.forEach((d) => {
          md += `- **${d.term}** (\`${d.evidenceTimestamp}\`): ${d.definition}\n`;
        });
        md += `\n`;
      }
    }

    // Topics Outline
    if (lecture.topics && lecture.topics.length > 0) {
      md += `## 2. Chronological Lecture Outline\n\n`;
      lecture.topics.forEach((t) => {
        md += `### [${t.startTimestamp} - ${t.endTimestamp}] ${t.title}\n${t.summary}\n\n`;
      });
    }

    // Flashcards
    if (lecture.flashcards && lecture.flashcards.length > 0) {
      md += `## 3. High-Yield Flashcards (Anki / Revision)\n\n`;
      lecture.flashcards.forEach((f, idx) => {
        md += `**Card ${idx + 1} (${f.difficulty.toUpperCase()})**  \n`;
        md += `*Q:* ${f.question}  \n`;
        md += `*A:* ${f.answer} *(Source: ${f.sourceTimestamp})*  \n\n`;
      });
    }

    // Quiz Questions
    if (lecture.quiz && lecture.quiz.length > 0) {
      md += `## 4. Multiple Choice Examination Quiz\n\n`;
      lecture.quiz.forEach((q, idx) => {
        md += `### Q${idx + 1}. ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          const letter = String.fromCharCode(65 + oIdx);
          const isCorrect = opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          md += `- [${letter}] ${opt} ${isCorrect ? '✅ *(Correct)*' : ''}\n`;
        });
        md += `\n**Explanation:** ${q.explanation} *(Evidence: \`${q.sourceTimestamp}\`)*\n\n`;
      });
    }

    // Full Transcript
    md += `## 5. Complete Timestamped Transcript\n\n`;
    lecture.transcript.forEach((s) => {
      md += `**[${s.startTimestamp}]** ${s.text}\n\n`;
    });

    return md;
  };

  // Generate Anki importable CSV/TSV format
  const generateAnkiCSV = (): string => {
    const rows = lecture.flashcards.map((f) => {
      const q = f.question.replace(/\t/g, ' ').replace(/"/g, '""');
      const a = `${f.answer} (Evidence: ${f.sourceTimestamp})`.replace(/\t/g, ' ').replace(/"/g, '""');
      const tag = `LectureLens_${lecture.courseSubject.replace(/[^a-zA-Z0-9]/g, '_')}`;
      return `"${q}"\t"${a}"\t"${tag}"`;
    });
    return rows.join('\n');
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lecture.title.replace(/\s+/g, '_')}_Lecture_Notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAnki = () => {
    const tsv = generateAnkiCSV();
    const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lecture.title.replace(/\s+/g, '_')}_Anki_Deck.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setCopiedType('markdown');
      setTimeout(() => setCopiedType(null), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] rounded-xl shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E0D8] dark:border-[#2A2825]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[#C8102E]" />
            <h3 className="text-base font-bold text-[#121212] dark:text-[#F2EFE9]">
              Export Lecture Study Materials
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close export modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#666666] dark:text-[#99958F]">
          Export clean Markdown notes containing the summary, formulas, quiz, and full timestamped transcript, or export flashcards formatted for Anki.
        </p>

        {/* Options */}
        <div className="space-y-3">
          {/* Markdown Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-center text-[#121212] dark:text-[#F2EFE9]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#121212] dark:text-[#F2EFE9]">
                  Markdown Notes (.md)
                </h4>
                <p className="text-[11px] text-[#666666] dark:text-[#99958F]">
                  Complete study guide, formulas, quiz, and transcript
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyMarkdown}
                className="p-2 rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Copy Markdown to clipboard"
                aria-label="Copy Markdown"
              >
                {copiedType === 'markdown' ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={handleDownloadMarkdown}
                className="px-3 py-1.5 rounded-lg bg-[#C8102E] hover:bg-[#A50D25] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Anki Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-center text-[#121212] dark:text-[#F2EFE9]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#121212] dark:text-[#F2EFE9]">
                  Anki Deck File (.txt)
                </h4>
                <p className="text-[11px] text-[#666666] dark:text-[#99958F]">
                  {lecture.flashcards.length} flashcards in standard TSV import format
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadAnki}
              disabled={lecture.flashcards.length === 0}
              className="px-3 py-1.5 rounded-lg bg-[#121212] dark:bg-[#F2EFE9] hover:bg-black/80 dark:hover:bg-white/80 text-white dark:text-[#121212] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-lg border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
