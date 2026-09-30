import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SiliconNeuralCore } from '../3d/SiliconNeuralCore';
import {
  Mic,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  BookOpen,
  Lock,
  Layers,
  Clock,
  CheckCircle2,
  Play,
  RotateCw,
  Terminal,
  Laptop,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setMainView, selectLecture, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'privacy' | 'hardware' | 'multilingual'>('privacy');

  const handleOpenSample = () => {
    selectLecture('sample_os_deadlocks', 'ask');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121110] text-[#121212] dark:text-[#F2EFE9] transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#E5E0D8] dark:border-[#2A2825]">
        {/* Ambient subtle glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#C8102E]/5 dark:bg-[#C8102E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Editorial Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              {/* Category Kicker */}
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#666666] dark:text-[#99958F]">
                <span className="text-[#C8102E] font-semibold">Qualcomm® Snapdragon® AI Lab</span>
                <span aria-hidden="true">·</span>
                <span>Built for Indian AI PCs</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9] leading-[1.08]">
                Your lectures, understood{' '}
                <span className="text-[#C8102E] font-serif-summary italic font-normal">
                  privately
                </span>{' '}
                on your laptop.
              </h1>

              {/* Subhead */}
              <p className="text-sm sm:text-base text-[#666666] dark:text-[#A8A49D] leading-relaxed max-w-2xl">
                Transform long English, Hindi, and Hinglish lectures into searchable knowledge, formulas, flashcards, and grounded Q&A. Real browser speech recognition with Whisper ONNX (WebGPU/WASM). Your audio never touches the cloud.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleOpenSample}
                  className="px-5 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A50D25] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all group"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Try Sample Lecture (OS Deadlocks)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setMainView('dashboard')}
                  className="px-5 py-3 rounded-xl border border-[#E5E0D8] dark:border-[#383531] bg-white dark:bg-[#1A1918] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] flex items-center gap-2 transition-colors shadow-2xs"
                >
                  <Laptop className="w-4 h-4" />
                  <span>Launch Workspace</span>
                </button>

                {!currentUser && (
                  <button
                    onClick={() => setMainView('auth')}
                    className="px-4 py-3 rounded-xl text-xs font-mono-code text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white transition-colors"
                  >
                    Student Pass Sign-In →
                  </button>
                )}
              </div>

              {/* Proof Metric Line */}
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-mono-code text-[#666666] dark:text-[#99958F] border-t border-[#E5E0D8]/60 dark:border-[#2A2825]/60">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>0b Audio Uploaded</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#C8102E]" />
                  <span>45 TOPS Hexagon NPU Target</span>
                </div>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Offline Campus Ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Silicon Neural Core */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full aspect-square max-w-[420px] rounded-3xl bg-white/40 dark:bg-[#181716]/40 border border-[#E5E0D8] dark:border-[#2A2825] p-3 shadow-xl backdrop-blur-xs flex items-center justify-center overflow-hidden">
                <SiliconNeuralCore className="w-full h-full" />
              </div>
              <p className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F] text-center mt-3">
                Drag to rotate 3D Hexagon Core · Real-time WebGPU / WASM execution
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE "WOW MOMENT" LIVE CITATION INTERACTION */}
      <section className="py-16 border-b border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#161514]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#C8102E] font-semibold">
              Grounded Lecture Intelligence
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
              Answers cite timestamps that seek your audio.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#99958F]">
              Unlike generic LLM chatbots that hallucinate textbook facts, LectureLens restricts itself strictly to the professor's spoken words. Every claim links to an exact second in the lecture.
            </p>
          </div>

          {/* Interactive Simulation Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D1C1B] border border-[#E5E0D8] dark:border-[#2A2825] space-y-5 shadow-sm max-w-4xl">
            {/* Student Inquiry */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center font-mono-code text-xs font-bold text-[#121212] dark:text-white shrink-0">
                Q
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[#121212] dark:text-[#F2EFE9]">
                  "Why does deadlock occur in this lecture?"
                </p>
                <p className="text-[11px] text-[#666666] dark:text-[#99958F] font-mono-code mt-0.5">
                  Operating Systems · CS304
                </p>
              </div>
            </div>

            {/* Copilot Response */}
            <div className="pl-10 space-y-3">
              <p className="text-xs sm:text-sm leading-relaxed text-[#121212] dark:text-[#EAE6DF] font-serif-summary">
                "According to the lecture, a deadlock occurs because four conditions hold simultaneously: Mutual Exclusion (non-shareable resources), Hold and Wait (processes holding resources while seeking others), No Preemption (resources cannot be forcibly taken), and Circular Wait (a closed dependency loop). The professor emphasizes that breaking Circular Wait via Havender's linear ordering prevents deadlock."
              </p>

              {/* Clickable Citation Pill */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
                  Verified Evidence:
                </span>
                <button
                  onClick={handleOpenSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code font-semibold bg-[#C8102E] text-white hover:bg-[#A50D25] shadow-sm transition-all"
                  title="Click to experience the live seek to 32:14 in the sample lecture"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Source Lecture · 32:14–32:42</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ARCHITECTURAL SUPERIORITY: ON-DEVICE VS CLOUD */}
      <section className="py-16 border-b border-[#E5E0D8] dark:border-[#2A2825]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono-code uppercase tracking-wider text-[#C8102E] font-semibold">
              The AI PC Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
              Engineered for Snapdragon® AI PCs.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#99958F]">
              Why Indian engineering students need local silicon inference over cloud-dependent models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9]">
                Absolute Audio Privacy
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
                Raw lecture audio files never leave your laptop. Transcription runs in WebGPU/WASM through ONNX. You can enable Local-Only mode to block 100% of external traffic.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9]">
                Works in Offline Campus Auditoriums
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
                Indian university lecture halls frequently suffer from congested Wi-Fi. LectureLens transcribes, indexes, and searches offline using local IndexedDB storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#C8102E] flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9]">
                Snapdragon® Hexagon™ NPU Target
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
                Designed with a documented adapter slot for the Qualcomm AI Hub and QNN Execution Provider (45 TOPS) for sub-watt energy efficiency on HP OmniBook X laptops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE PRELOADED UNIVERSITY SYLLABI */}
      <section className="py-16 border-b border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#161514]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono-code uppercase tracking-wider text-[#C8102E] font-semibold">
                Instant Verification
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
                Explore 3 Preloaded Engineering Lectures
              </h2>
            </div>
            <button
              onClick={() => setMainView('dashboard')}
              className="text-xs font-mono-code text-[#C8102E] hover:underline flex items-center gap-1"
            >
              <span>View full library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lecture 1 */}
            <div
              onClick={() => selectLecture('sample_os_deadlocks')}
              className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D1C1B] border border-[#E5E0D8] dark:border-[#2A2825] hover:border-[#C8102E]/60 cursor-pointer transition-all shadow-2xs group"
            >
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F]">
                Operating Systems · CS304
              </span>
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9] group-hover:text-[#C8102E] transition-colors mt-2">
                Deadlock Characterization & Prevention
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F] line-clamp-2 mt-1.5 font-serif-summary">
                Coffman conditions, Resource Allocation Graphs, Havender's protocol, and Banker's safety state algorithms.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between text-xs font-mono-code text-[#C8102E]">
                <span>Open Lecture</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Lecture 2 */}
            <div
              onClick={() => selectLecture('sample_dbms_normalization')}
              className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D1C1B] border border-[#E5E0D8] dark:border-[#2A2825] hover:border-[#C8102E]/60 cursor-pointer transition-all shadow-2xs group"
            >
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F]">
                DBMS · CS302
              </span>
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9] group-hover:text-[#C8102E] transition-colors mt-2">
                Relational Normalization (1NF to BCNF)
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F] line-clamp-2 mt-1.5 font-serif-summary">
                Modification anomalies, functional dependencies, Armstrong's axioms, and lossless-join decompositions.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between text-xs font-mono-code text-[#C8102E]">
                <span>Open Lecture</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Lecture 3 */}
            <div
              onClick={() => selectLecture('sample_math_laplace')}
              className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1D1C1B] border border-[#E5E0D8] dark:border-[#2A2825] hover:border-[#C8102E]/60 cursor-pointer transition-all shadow-2xs group"
            >
              <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F]">
                Mathematics · MA201
              </span>
              <h3 className="text-sm font-bold text-[#121212] dark:text-[#F2EFE9] group-hover:text-[#C8102E] transition-colors mt-2">
                Laplace Transforms & Circuit IVPs
              </h3>
              <p className="text-xs text-[#666666] dark:text-[#99958F] line-clamp-2 mt-1.5 font-serif-summary">
                Unilateral integral transforms, frequency shifting theorems, derivative operational laws, and RLC differential equations.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-between text-xs font-mono-code text-[#C8102E]">
                <span>Open Lecture</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C8102E] text-white flex items-center justify-center mx-auto shadow-md">
            <span className="font-mono-code font-bold text-lg">L²</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
            Ready to study with total on-device privacy?
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#99958F] max-w-lg mx-auto">
            Launch LectureLens now. Record a lecture, import media, or test our preloaded university coursework in seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setMainView('dashboard')}
              className="px-6 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A50D25] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <span>Launch LectureLens Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {!currentUser && (
              <button
                onClick={() => setMainView('auth')}
                className="px-5 py-3 rounded-xl border border-[#E5E0D8] dark:border-[#2A2825] bg-white dark:bg-[#1A1918] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] transition-colors"
              >
                Sign In with Student ID
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
