import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { LectureView } from './components/lecture/LectureView';
import { InsightsPage } from './components/insights/InsightsPage';
import { ArchitecturePage } from './components/architecture/ArchitecturePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ExplainConceptModal } from './components/lecture/ExplainConceptModal';
import { Presentation, ArrowRight, X, Sparkles } from 'lucide-react';

export default function App() {
  const {
    mainView,
    setMainView,
    initialize,
    demoMode,
    toggleDemoMode,
    selectLecture,
    setActiveLectureTab,
    seekTo,
  } = useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Demo Walkthrough Helpers
  const runDemoStep = (step: number) => {
    if (step === 1) {
      selectLecture('sample_os_deadlocks', 'summary');
    } else if (step === 2) {
      selectLecture('sample_os_deadlocks', 'ask');
    } else if (step === 3) {
      selectLecture('sample_os_deadlocks', 'summary');
      seekTo(1934); // Jump to 32:14 (Circular wait Havender's protocol)
    } else if (step === 4) {
      selectLecture('sample_os_deadlocks', 'flashcards');
    } else if (step === 5) {
      selectLecture('sample_os_deadlocks', 'quiz');
    } else if (step === 6) {
      setMainView('insights');
    } else if (step === 7) {
      setMainView('architecture');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#141312] text-[#121212] dark:text-[#F2EFE9] transition-colors flex flex-col font-sans selection:bg-[#C8102E]/15 selection:text-[#C8102E]">
      {/* Presentation / Demo Mode Guide Banner */}
      {demoMode && (
        <div className="bg-[#C8102E] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-md z-50">
          <div className="flex items-center gap-2 font-mono-code">
            <Presentation className="w-4 h-4 shrink-0" />
            <span className="font-bold">PRESENTATION MODE:</span>
            <span className="opacity-90 hidden sm:inline">
              1-Click Pitch Walkthrough for Judges
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 font-mono-code text-[11px]">
            <button
              onClick={() => runDemoStep(1)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              1. Open Sample
            </button>
            <button
              onClick={() => runDemoStep(2)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              2. Grounded Q&A
            </button>
            <button
              onClick={() => runDemoStep(3)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              3. Wow Citation (32:14)
            </button>
            <button
              onClick={() => runDemoStep(4)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              4. Flashcards
            </button>
            <button
              onClick={() => runDemoStep(5)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              5. Quiz
            </button>
            <button
              onClick={() => runDemoStep(6)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              6. Telemetry
            </button>
            <button
              onClick={() => runDemoStep(7)}
              className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              7. Qualcomm Arch
            </button>
            <button
              onClick={toggleDemoMode}
              className="p-1 rounded bg-black/20 hover:bg-black/40 text-white ml-2"
              title="Close Demo Mode"
              aria-label="Exit Demo Mode"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar />

      {/* Active Screen View */}
      <main className="flex-1">
        {mainView === 'landing' && <LandingPage />}
        {mainView === 'auth' && <AuthPage />}
        {mainView === 'dashboard' && <Dashboard />}
        {mainView === 'lecture' && <LectureView />}
        {mainView === 'insights' && <InsightsPage />}
        {mainView === 'architecture' && <ArchitecturePage />}
        {mainView === 'settings' && <SettingsPage />}
      </main>

      {/* Concept Card Modal ("Explain this") */}
      <ExplainConceptModal />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E5E0D8] dark:border-[#2A2825] py-5 px-4 text-center text-xs text-[#666666] dark:text-[#99958F] font-mono-code bg-[#FAF8F5]/80 dark:bg-[#141312]/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">LectureLens</span>
            <span>· Built for Snapdragon® AI Lab Challenge</span>
          </div>
          <div>
            <span>Target: Qualcomm® Hexagon™ NPU (45 TOPS) · Privacy-First Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
