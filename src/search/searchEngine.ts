import { Lecture, TranscriptSegment, Topic, Definition, KeyPoint } from '../types';

export interface SearchResult {
  lectureId: string;
  lectureTitle: string;
  matchType: 'transcript' | 'topic' | 'definition' | 'summary';
  title: string;
  snippet: string;
  timestamp: string;
  seconds: number;
  score: number;
  highlightWords: string[];
}

export interface SearchEngine {
  indexLecture(lecture: Lecture): Promise<void>;
  search(query: string, lectureFilterId?: string): Promise<SearchResult[]>;
}

class LocalLectureSearchEngine implements SearchEngine {
  private indexedLectures: Map<string, Lecture> = new Map();

  async indexLecture(lecture: Lecture): Promise<void> {
    this.indexedLectures.set(lecture.id, lecture);
  }

  async search(query: string, lectureFilterId?: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.toLowerCase().trim();
    const queryTokens = cleanQuery
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/gi, ''))
      .filter((t) => t.length > 1);

    const results: SearchResult[] = [];
    const lecturesToSearch = lectureFilterId
      ? [this.indexedLectures.get(lectureFilterId)].filter(Boolean) as Lecture[]
      : Array.from(this.indexedLectures.values());

    for (const lecture of lecturesToSearch) {
      // 1. Search in Transcript segments
      for (const seg of lecture.transcript) {
        const segTextLower = seg.text.toLowerCase();
        let matchScore = 0;

        // Exact phrase boost
        if (segTextLower.includes(cleanQuery)) {
          matchScore += 10;
        }

        // Token matches
        for (const token of queryTokens) {
          if (segTextLower.includes(token)) {
            matchScore += 3;
          }
        }

        if (matchScore > 0) {
          results.push({
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            matchType: 'transcript',
            title: `Transcript @ ${seg.startTimestamp}`,
            snippet: highlightSnippet(seg.text, queryTokens),
            timestamp: seg.startTimestamp,
            seconds: seg.start,
            score: matchScore,
            highlightWords: queryTokens,
          });
        }
      }

      // 2. Search in Topics
      for (const topic of lecture.topics || []) {
        const text = `${topic.title} ${topic.summary}`.toLowerCase();
        let matchScore = 0;
        if (text.includes(cleanQuery)) matchScore += 12;
        for (const token of queryTokens) {
          if (text.includes(token)) matchScore += 4;
        }

        if (matchScore > 0) {
          results.push({
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            matchType: 'topic',
            title: `Topic: ${topic.title}`,
            snippet: topic.summary,
            timestamp: topic.startTimestamp,
            seconds: parseTimeToSec(topic.startTimestamp),
            score: matchScore + 2, // topic matches are high yield
            highlightWords: queryTokens,
          });
        }
      }

      // 3. Search in Definitions
      if (lecture.summary?.definitions) {
        for (const def of lecture.summary.definitions) {
          const text = `${def.term}: ${def.definition}`.toLowerCase();
          let matchScore = 0;
          if (text.includes(cleanQuery)) matchScore += 15;
          for (const token of queryTokens) {
            if (text.includes(token)) matchScore += 5;
          }

          if (matchScore > 0) {
            results.push({
              lectureId: lecture.id,
              lectureTitle: lecture.title,
              matchType: 'definition',
              title: `Definition: ${def.term}`,
              snippet: def.definition,
              timestamp: def.evidenceTimestamp,
              seconds: parseTimeToSec(def.evidenceTimestamp),
              score: matchScore + 3,
              highlightWords: queryTokens,
            });
          }
        }
      }

      // 4. Search in Key points
      if (lecture.summary?.keyPoints) {
        for (const kp of lecture.summary.keyPoints) {
          const text = `${kp.point} ${kp.explanation}`.toLowerCase();
          let matchScore = 0;
          if (text.includes(cleanQuery)) matchScore += 8;
          for (const token of queryTokens) {
            if (text.includes(token)) matchScore += 2;
          }

          if (matchScore > 0) {
            results.push({
              lectureId: lecture.id,
              lectureTitle: lecture.title,
              matchType: 'summary',
              title: `Key Point: ${kp.point}`,
              snippet: kp.explanation,
              timestamp: kp.evidenceTimestamp,
              seconds: parseTimeToSec(kp.evidenceTimestamp),
              score: matchScore,
              highlightWords: queryTokens,
            });
          }
        }
      }
    }

    // Sort by descending score
    return results.sort((a, b) => b.score - a.score).slice(0, 30);
  }
}

function parseTimeToSec(ts: string): number {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 2) return (parts[0] || 0) * 60 + (parts[1] || 0);
  if (parts.length === 3) return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  return 0;
}

function highlightSnippet(text: string, tokens: string[]): string {
  if (text.length <= 150) return text;
  // Find first token occurrence
  const lower = text.toLowerCase();
  let firstIdx = -1;
  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx !== -1 && (firstIdx === -1 || idx < firstIdx)) {
      firstIdx = idx;
    }
  }

  if (firstIdx === -1) {
    return text.substring(0, 140) + '...';
  }

  const start = Math.max(0, firstIdx - 35);
  const end = Math.min(text.length, firstIdx + 115);
  return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
}

export const localSearchEngine = new LocalLectureSearchEngine();
