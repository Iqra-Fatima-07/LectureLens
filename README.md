# LectureLens — Privacy-First AI Study Copilot for Snapdragon® AI PCs

**Built for the Snapdragon® AI Lab Build & Present Challenge by Qualcomm**

LectureLens is an end-to-end, privacy-first lecture intelligence workstation tailored for Indian college students. It transforms long, complex STEM lectures (English, Hindi, and Hinglish) into interactive timestamped transcripts, editorial summaries, high-yield flashcards, practice quizzes, and strictly grounded lecture Q&A.

Designed specifically for AI PCs (such as Snapdragon® X Elite and Snapdragon® X Plus powered laptops like the HP OmniBook X).

---

## 1. Core Product Principles & Honesty Rules

- **«Your lecture audio stays on your laptop—always.»** Audio is recorded or imported via browser Web Audio APIs and transcribed directly on-device using ONNX models (`@huggingface/transformers` Whisper Tiny / Base). Zero audio bytes leave the device.
- **Strict Distinction between Runtimes:**
  - **Browser Local Mode:** Active and fully operational in Google Chrome / Microsoft Edge on Windows on Arm using WebGPU hardware acceleration with clean WASM SIMD fallback.
  - **Cloud Demo Mode:** Uses server-proxied Gemini 2.5 Flash API with strict JSON schema for summarization, flashcards, MCQs, and grounded Q&A.
  - **Snapdragon NPU Path:** An architected and documented adapter slot (`QualcommNPUEngine`) targeting Qualcomm AI Hub models, ONNX Runtime with QNN Execution Provider (ort-qnn), and the Qualcomm Hexagon NPU (45 TOPS). This path is labeled **«Snapdragon NPU integration target»** and is never falsely represented as active in a standard web browser.
- **No Hallucinations or AI Slop:**
  - The "Ask" feature answers using **only** the lecture transcript. If the lecture does not contain adequate evidence, it states: *"I couldn't find enough information in this lecture to answer that confidently."*
  - Every answer provides clickable timestamp citations (e.g. `Source Lecture · 32:14`) that instantly seek the audio player and highlight the transcript segment.

---

## 2. Architecture & Data Flow

### Current In-Browser Execution Path (Shipped & Active)
```
User Audio (Mic / File)
      ↓
Web Audio API (16,000 Hz Mono Float32Array)
      ↓
30-second Audio Slices
      ↓
Hugging Face Transformers.js (Whisper ONNX)
      ↓
WebGPU Acceleration (WASM SIMD Fallback)
      ↓
Timestamped Transcript Segments
      ↓
IndexedDB (idb) & Local Client-Side Lexical Search
      ↓ (Optional Hybrid Mode)
Gemini 2.5 Flash Server Proxy (JSON Structured Output)
      ↓
TL;DR + Formulas + 10 Flashcards + 8 MCQs + Outline
```

### Snapdragon NPU Deployment Target Path
```
Audio Input Stream
      ↓
Native Windows on Arm C++ / Electron / Edge Native Bridge
      ↓
ONNX Runtime with QNN Execution Provider (ort-qnn)
      ↓
Qualcomm® AI Engine Direct SDK (HTP Backend)
      ↓
Qualcomm® Hexagon™ NPU (45 TOPS Dedicated AI Silicon)
      ↓
Sub-watt, Ultra-Low-Latency On-Device ASR & Local SLM
```

---

## 3. Verified Qualcomm AI Hub Model Matrix

| Task | Model | Source | Runtime | Quantization | In-Browser Support | Snapdragon Target | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Speech Recognition** | Whisper Tiny | Qualcomm AI Hub / HF | ONNX Runtime (QNN) | INT8 (W8A8) | Yes (WebGPU / WASM) | Hexagon NPU | Verified on AI Hub |
| **Multilingual ASR** | Whisper Base | Qualcomm AI Hub / HF | ONNX Runtime (QNN) | INT8 (W8A8) | Yes (WebGPU / WASM) | Hexagon NPU | Verified on AI Hub |
| **Offline Summarization** | Llama 3.2 3B Instruct | Qualcomm AI Hub | Qualcomm AI Runtime | INT4 (W4A16) | Verification required | Hexagon NPU | Verified on AI Hub |
| **Reasoning & Math** | Phi-3.5-mini Instruct | Qualcomm AI Hub | ONNX Runtime (QNN) | INT4 (W4A16) | Verification required | Hexagon NPU | Verified on AI Hub |

---

## 4. Key Features Implemented

1. **Live Recording & Import:**
   - Real `MediaRecorder` audio capture with live Web Audio API frequency waveform visualizer.
   - Support for importing MP3, WAV, M4A, WebM, and MP4 files with client-side audio decoding.
2. **Real On-Device Transcription:**
   - Whisper ONNX (Tiny / Base) running via `@huggingface/transformers`.
   - Real-time download progress bar and 30-second chunk progress.
   - Measured Real-Time Factor (RTF) computed with `performance.now()`.
3. **Preloaded Impressive University Samples:**
   - *Operating Systems:* Deadlocks (Coffman conditions, Havender's protocol, Banker's algorithm).
   - *Database Management Systems:* Relational Normalization (1NF through BCNF, functional dependencies).
   - *Engineering Mathematics:* Laplace Transforms (Frequency shift, derivatives, IVP solutions).
4. **Interactive Audio Player & Transcript:**
   - Seekbar, speed toggles (0.75x to 2x), rewind/fast-forward, spacebar shortcut.
   - Clickable timestamp chips that seek audio playback.
   - Automatic transcript scrolling tracking playback position.
   - "Explain this" concept card popover on any selected sentence.
5. **Study Copilot Modes:**
   - **Summary:** Editorial TL;DR, core takeaways with evidence chips, mathematical equations, glossary.
   - **Flashcards:** 3D flip card with spaced repetition rating (Again, Hard, Good, Easy) and Anki export.
   - **Quiz:** 8 multiple-choice questions with instant validation, explanations, and evidence seek links.
   - **Ask:** Grounded Q&A with strict evidence citations.
6. **Local-Only vs Hybrid Mode:**
   - **Local-Only:** Disables all cloud endpoints. Search, audio, transcript, and IndexedDB persist with zero external bytes.
   - **Hybrid:** Audio remains strictly local; transcript text is sent to Gemini 2.5 Flash for deep academic study materials.
7. **Storage & Exports:**
   - Real IndexedDB persistence using `idb`.
   - True storage quota queries via `navigator.storage.estimate()`.
   - Export full lecture notes as Markdown (`.md`).
   - Export flashcards as standard Anki-importable deck (`.txt`).
   - "Delete all data" with double-confirmation dialog.

---

## 5. Local Setup & Production Run

### Prerequisites
- Node.js 18+ or 20+
- Modern browser: Microsoft Edge or Google Chrome (with WebGPU enabled)

### Environment Variables
Set your Gemini API key in `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
```

### Installation & Development
```bash
npm install
npm run dev
```
The application will launch at `http://localhost:3000`.

### Production Build & Launch
```bash
npm run build
npm start
```

---

## 6. Keyboard Shortcuts

- `Space` — Play / Pause audio playback
- `Left Arrow` — Rewind 10 seconds
- `Right Arrow` — Forward 10 seconds
- `/` — Focus search bar
- `Esc` — Close active modal dialog

---

## 7. License & Credits

Built for the **Qualcomm Snapdragon® AI Lab Build & Present Challenge**.
Designed for students at Indian engineering universities preparing for semester examinations and GATE.
