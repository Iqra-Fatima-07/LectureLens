import {
  LectureSummary,
  Flashcard,
  QuizQuestion,
  GroundedAnswer,
  ConceptCard,
  Language,
} from '../types';
import { LectureContext, FullAnalysisResult } from './InferenceEngine';
import { telemetry } from './EngineTelemetry';

export class GeminiEngine {
  readonly id = 'gemini-cloud';
  readonly name = 'Gemini 2.5 Flash (Cloud Intelligence)';
  readonly type = 'cloud-gemini' as const;

  async analyzeLecture(
    transcriptText: string,
    title: string,
    language?: Language,
    isLocalOnly = false
  ): Promise<FullAnalysisResult> {
    if (isLocalOnly) {
      throw new Error(
        'Local-only mode is active. Summarization and cloud intelligence are disabled to preserve privacy.'
      );
    }

    telemetry.incrementGeminiRequests();
    const startTime = performance.now();

    const response = await fetch('/api/gemini/analyze-lecture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        transcript: transcriptText,
        language: language || 'auto',
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    const latency = Math.round(performance.now() - startTime);

    // Ensure flashcard IDs and quiz question IDs are present
    const flashcards: Flashcard[] = (data.flashcards || []).map((fc: any, idx: number) => ({
      id: `fc_${idx + 1}`,
      question: fc.question,
      answer: fc.answer,
      sourceTimestamp: fc.sourceTimestamp || '00:00',
      difficulty: fc.difficulty || 'medium',
    }));

    const quiz: QuizQuestion[] = (data.quiz || []).map((q: any, idx: number) => ({
      id: `quiz_${idx + 1}`,
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || '',
      sourceTimestamp: q.sourceTimestamp || '00:00',
    }));

    return {
      summary: data.summary,
      topics: data.topics || [],
      flashcards,
      quiz,
    };
  }

  async answerQuestion(
    question: string,
    context: LectureContext,
    isLocalOnly = false
  ): Promise<GroundedAnswer> {
    if (isLocalOnly) {
      return {
        id: `qa_${Date.now()}`,
        question,
        answer: 'Local-only mode is active. Cloud Q&A is currently disabled. Use the local search bar to search transcript timestamps locally.',
        confidence: 'low',
        citations: [],
        createdAt: Date.now(),
      };
    }

    telemetry.incrementGeminiRequests();

    const response = await fetch('/api/gemini/grounded-ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        title: context.title,
        transcript: context.fullTranscriptText,
        topics: context.topics,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(errData.error || `Server error ${response.status}`);
    }

    const data = await response.json();

    return {
      id: `qa_${Date.now()}`,
      question,
      answer: data.answer || "I couldn't find enough information in this lecture to answer that confidently.",
      confidence: data.confidence || 'medium',
      citations: data.citations || [],
      followUpSuggestions: data.followUpSuggestions || [],
      createdAt: Date.now(),
    };
  }

  async explainConcept(
    selection: string,
    surroundingContext: string,
    title: string,
    isLocalOnly = false
  ): Promise<ConceptCard> {
    if (isLocalOnly) {
      return {
        term: selection.slice(0, 40),
        simpleExplanation: 'Local-only mode is active. Explanations using Gemini are disabled.',
        prerequisites: 'None available in offline mode',
        practicalExample: 'Enable Hybrid Mode in settings to generate concept cards.',
        evidenceTimestamp: '',
      };
    }

    telemetry.incrementGeminiRequests();

    const response = await fetch('/api/gemini/explain-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selection,
        surroundingContext,
        title,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Server error' }));
      throw new Error(err.error || `Server error ${response.status}`);
    }

    return await response.json();
  }
}
