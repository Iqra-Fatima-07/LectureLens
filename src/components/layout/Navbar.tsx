import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Layers,
  Cpu,
  BarChart3,
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  Presentation,
  User,
  LogOut,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    mainView,
    setMainView,
    localOnlyMode,
    setLocalOnlyMode,
    isDarkMode,
    toggleDarkMode,
    demoMode,
    toggleDemoMode,
    currentLectureId,
    lectures,
    currentUser,
    logout,
  } = useAppStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const currentLecture = lectures.find((l) => l.id === currentLectureId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E0D8] dark:border-[#2A2825] bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMainView('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            aria-label="Go to LectureLens Home"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C8102E] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="font-mono-code font-bold text-sm tracking-tighter">L²</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-[#121212] dark:text-[#F2EFE9]">
                  LectureLens
                </span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono-code font-medium bg-[#121212]/5 dark:bg-white/10 text-[#666666] dark:text-[#99958F] border border-black/5 dark:border-white/5">
                  AI PC
                </span>
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <button
              onClick={() => setMainView('landing')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mainView === 'landing'
                  ? 'bg-black/5 dark:bg-white/10 text-[#121212] dark:text-white font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setMainView('dashboard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mainView === 'dashboard'
                  ? 'bg-black/5 dark:bg-white/10 text-[#121212] dark:text-white font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Workspace
            </button>
            {currentLecture && (
              <button
                onClick={() => setMainView('lecture')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  mainView === 'lecture'
                    ? 'bg-black/5 dark:bg-white/10 text-[#121212] dark:text-white font-semibold'
                    : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{currentLecture.title}</span>
              </button>
            )}
            <button
              onClick={() => setMainView('insights')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                mainView === 'insights'
                  ? 'bg-black/5 dark:bg-white/10 text-[#121212] dark:text-white font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Insights
            </button>
            <button
              onClick={() => setMainView('architecture')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                mainView === 'architecture'
                  ? 'bg-black/5 dark:bg-white/10 text-[#121212] dark:text-white font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Qualcomm Arch
            </button>
            <button
              onClick={() => setMainView('settings')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                mainView === 'settings'
                  ? 'bg-black/5 dark:bg-white/10 text-[#121212] dark:text-white font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
          </nav>
        </div>

        {/* Right Section: Privacy Status, User Profile / Auth, Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Honest Privacy Indicator */}
          <div
            onClick={() => setLocalOnlyMode(!localOnlyMode)}
            className="cursor-pointer group flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono-code transition-all border border-[#E5E0D8] dark:border-[#2A2825] bg-white/70 dark:bg-[#1A1918]/80 hover:border-[#C8102E]/40"
            title={
              localOnlyMode
                ? 'Local-only Mode Active: Whisper on-device, Gemini disabled, audio never uploaded'
                : 'Hybrid Mode: Whisper on-device, audio never uploaded, transcript summaries via Gemini'
            }
            role="button"
            tabIndex={0}
            aria-label="Toggle Local-only mode"
          >
            {localOnlyMode ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">LOCAL ONLY</span>
                <span className="hidden sm:inline text-[11px] text-[#666666] dark:text-[#99958F]">· 0b sent</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-[#C8102E]"></span>
                <span className="font-semibold text-[#121212] dark:text-[#F2EFE9]">HYBRID</span>
                <span className="hidden sm:inline text-[11px] text-[#666666] dark:text-[#99958F]">· Audio local</span>
              </>
            )}
          </div>

          {/* Student Auth / Profile Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E5E0D8] dark:border-[#2A2825] bg-white/80 dark:bg-[#1A1918]/80 hover:border-[#C8102E]/50 text-xs font-mono-code transition-colors"
                title={`${currentUser.name} (${currentUser.institution})`}
              >
                <div className="w-4 h-4 rounded-full bg-[#C8102E] text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate text-[#121212] dark:text-[#F2EFE9] font-medium">
                  {currentUser.name}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#181716] border border-[#E5E0D8] dark:border-[#2A2825] shadow-xl p-3 space-y-2 z-50 animate-in fade-in">
                  <div className="border-b border-[#E5E0D8] dark:border-[#2A2825] pb-2">
                    <p className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[11px] font-mono-code text-[#666666] dark:text-[#99958F] truncate">
                      {currentUser.email}
                    </p>
                    <p className="text-[10px] text-[#666666] dark:text-[#99958F] mt-1 font-mono-code">
                      {currentUser.institution.split('(')[0]} · {currentUser.rollNo}
                    </p>
                    <span className="inline-block text-[9px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E] mt-1">
                      {currentUser.snapdragonStudentPassId}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setMainView('auth')}
              className="px-2.5 py-1 rounded-full border border-[#E5E0D8] dark:border-[#2A2825] bg-white/80 dark:bg-[#1A1918]/80 hover:border-[#C8102E]/50 text-xs font-mono-code text-[#121212] dark:text-[#F2EFE9] flex items-center gap-1 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#C8102E]" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`p-1.5 rounded-md border text-xs font-mono-code transition-colors flex items-center gap-1 ${
              demoMode
                ? 'bg-[#C8102E] text-white border-[#C8102E]'
                : 'border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Demo Mode: Quick presentation preset for judges"
            aria-label="Toggle Demo Mode"
          >
            <Presentation className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Demo</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-md border border-[#E5E0D8] dark:border-[#2A2825] text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
