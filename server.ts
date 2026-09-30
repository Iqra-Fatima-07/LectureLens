import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const freshKey = process.env.GEMINI_API_KEY;
    if (!freshKey) {
      throw new Error('GEMINI_API_KEY is not configured in server environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: freshKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. Health & Config endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// 2. Full Lecture Analysis (Summary, Topics, Flashcards, Quiz)
app.post('/api/gemini/analyze-lecture', async (req: Request, res: Response) => {
  try {
    const { title, transcript, language } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Missing transcript text' });
    }

    const ai = getAIClient();

    const prompt = `You are LectureLens, a world-class academic study copilot for engineering and college students.
Analyze the following lecture transcript thoroughly.
Lecture Title: "${title || 'Untitled Lecture'}"
Language context: ${language || 'Auto'}

Transcript:
"""
${transcript.slice(0, 45000)}
"""

CRITICAL INSTRUCTIONS:
1. Provide a comprehensive structured study guide based ONLY on this lecture transcript.
2. Every timestamp cited must correspond to actual content in the lecture (format MM:SS or HH:MM:SS if applicable, e.g. "04:15", "12:30"). Do not invent timestamps.
3. Generate:
   - summary:
     - tldr: 2-3 concise sentences capturing the lecture core thesis.
     - keyPoints: Array of 5-8 insightful takeaways with explanation and evidenceTimestamp.
     - formulas: Array of mathematical/scientific/algorithmic equations, notations, or laws mentioned (with LaTeX/plain notation, description, evidenceTimestamp).
     - definitions: Array of 4-8 core terms with clear academic definition and evidenceTimestamp.
     - importantConcepts: Array of 4-6 deep concepts with prerequisite and evidenceTimestamp.
   - topics: Array of 4-8 chronological lecture topics with title, startTimestamp, endTimestamp, summary.
   - flashcards: Exactly 10 high-yield flashcards (question, answer, sourceTimestamp, difficulty: "easy"|"medium"|"hard").
   - quiz: Exactly 8 multiple-choice questions (question, options: array of 4 distinct choices, correctAnswer: string matching one option exactly, explanation: detailed academic explanation, sourceTimestamp).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.OBJECT,
              properties: {
                tldr: { type: Type.STRING },
                keyPoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      point: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      evidenceTimestamp: { type: Type.STRING },
                    },
                    required: ['point', 'explanation', 'evidenceTimestamp'],
                  },
                },
                formulas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      formula: { type: Type.STRING },
                      description: { type: Type.STRING },
                      evidenceTimestamp: { type: Type.STRING },
                    },
                    required: ['name', 'formula', 'description'],
                  },
                },
                definitions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      term: { type: Type.STRING },
                      definition: { type: Type.STRING },
                      evidenceTimestamp: { type: Type.STRING },
                    },
                    required: ['term', 'definition', 'evidenceTimestamp'],
                  },
                },
                importantConcepts: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      concept: { type: Type.STRING },
                      details: { type: Type.STRING },
                      prerequisites: { type: Type.STRING },
                      evidenceTimestamp: { type: Type.STRING },
                    },
                    required: ['concept', 'details', 'evidenceTimestamp'],
                  },
                },
              },
              required: ['tldr', 'keyPoints', 'definitions'],
            },
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  startTimestamp: { type: Type.STRING },
                  endTimestamp: { type: Type.STRING },
                  summary: { type: Type.STRING },
                },
                required: ['title', 'startTimestamp', 'endTimestamp', 'summary'],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  sourceTimestamp: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ['question', 'answer', 'sourceTimestamp', 'difficulty'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  sourceTimestamp: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctAnswer', 'explanation', 'sourceTimestamp'],
              },
            },
          },
          required: ['summary', 'topics', 'flashcards', 'quiz'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini API');
    }
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in analyze-lecture:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze lecture' });
  }
});

// 3. Grounded Q&A (strictly verified from transcript)
app.post('/api/gemini/grounded-ask', async (req: Request, res: Response) => {
  try {
    const { question, transcript, topics, title } = req.body;
    if (!question || !transcript) {
      return res.status(400).json({ error: 'Missing question or transcript' });
    }

    const ai = getAIClient();

    const prompt = `You are LectureLens Grounded Study Copilot.
You must answer the student's question using ONLY the lecture context below.

STRICT GROUNDING RULES:
1. Do NOT hallucinate or bring in external knowledge not present in the lecture.
2. If the lecture transcript does not provide adequate information to answer the question confidently, you MUST return:
   answer: "I couldn't find enough information in this lecture to answer that confidently."
   confidence: "low"
   citations: []
3. When answering from the lecture:
   - Provide a direct, crystal-clear explanation.
   - Include specific timestamp citations (e.g. "12:35", "18:40" or intervals like "12:35–13:10") where the professor discussed this.
   - Quote or reference the exact context in the transcript.
   - Provide 1-3 relevant follow-up questions directly related to this lecture.

Lecture Title: "${title || 'Lecture'}"
Outline Topics:
${JSON.stringify(topics || [])}

Transcript:
"""
${transcript.slice(0, 45000)}
"""

Student Question: "${question}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            confidence: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  topic: { type: Type.STRING },
                },
                required: ['timestamp', 'snippet'],
              },
            },
            followUpSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['answer', 'citations', 'confidence'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from model');
    }
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in grounded-ask:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// 4. "Explain this" concept card endpoint
app.post('/api/gemini/explain-concept', async (req: Request, res: Response) => {
  try {
    const { selection, surroundingContext, title } = req.body;
    if (!selection) {
      return res.status(400).json({ error: 'Missing selection text' });
    }

    const ai = getAIClient();

    const prompt = `You are LectureLens Concept Explainer.
Explain the following highlighted sentence/concept from the lecture "${title || 'Lecture'}".
The explanation must be simple, academic, and grounded in the lecture context.

Highlighted Selection:
"${selection}"

Surrounding Lecture Context:
"""
${surroundingContext || ''}
"""

Generate a compact concept card:
- term: Title of the concept/idea
- simpleExplanation: Clear, jargon-free 2-3 sentence explanation
- prerequisites: Key background concepts needed to understand this
- practicalExample: Real-world engineering / practical example illustrating it
- evidenceTimestamp: Estimated lecture timestamp if discernable from context (or empty)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            simpleExplanation: { type: Type.STRING },
            prerequisites: { type: Type.STRING },
            practicalExample: { type: Type.STRING },
            evidenceTimestamp: { type: Type.STRING },
          },
          required: ['term', 'simpleExplanation', 'prerequisites', 'practicalExample'],
        },
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in explain-concept:', error);
    res.status(500).json({ error: error.message || 'Failed to explain concept' });
  }
});

// Dev / Prod Vite setup
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`LectureLens server running on http://0.0.0.0:${port} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
