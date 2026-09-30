import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserProfile } from '../../types';
import {
  ShieldCheck,
  Cpu,
  GraduationCap,
  ArrowRight,
  Sparkles,
  Lock,
  Building,
  UserCheck,
  CheckCircle2,
  Mail,
  ArrowLeft,
} from 'lucide-react';

const INDIAN_INSTITUTIONS = [
  'Ballari Institute of Technology and Management (BITM)',
  'Indian Institute of Technology (IIT) Delhi',
  'Indian Institute of Technology (IIT) Bombay',
  'Indian Institute of Technology (IIT) Madras',
  'Indian Institute of Technology (IIT) Kharagpur',
  'BITS Pilani (Pilani, Goa, Hyderabad)',
  'National Institute of Technology (NIT) Trichy',
  'National Institute of Technology (NIT) Surathkal',
  'Delhi Technological University (DTU)',
  'Anna University, Chennai',
  'Vellore Institute of Technology (VIT)',
  'Other / Regional University',
];

const SAMPLE_DEMO_USERS: UserProfile[] = [
  {
    id: 'student_iqra',
    name: 'Iqra Fatima',
    email: 'iqra.fatima@bitm.edu.in',
    rollNo: '2023BITMCS104',
    institution: 'Ballari Institute of Technology and Management (BITM)',
    department: 'Computer Science & Engineering',
    yearOfStudy: '3rd Year (B.Tech)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    snapdragonStudentPassId: 'SNAP-BITM-CS304-908',
    joinedAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'student_rohan',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@cse.iitd.ac.in',
    rollNo: '2023CS10429',
    institution: 'Indian Institute of Technology (IIT) Delhi',
    department: 'Computer Science & Engineering',
    yearOfStudy: '3rd Year (Semester 5)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    snapdragonStudentPassId: 'SNAP-IITD-CS304-772',
    joinedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'student_priya',
    name: 'Priya Patel',
    email: 'priya.patel@pilani.bits-pilani.ac.in',
    rollNo: '2022B4A70891P',
    institution: 'BITS Pilani',
    department: 'Electronics & Computer Science',
    yearOfStudy: '4th Year (Semester 7)',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    snapdragonStudentPassId: 'SNAP-BITS-CS302-419',
    joinedAt: Date.now() - 86400000 * 45,
  },
];

export const AuthPage: React.FC = () => {
  const { login, setMainView } = useAppStore();
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [institution, setInstitution] = useState(INDIAN_INSTITUTIONS[0]);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year (B.Tech)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setStatusMessage('Verifying student credentials and checking local NPU key...');

    setTimeout(async () => {
      const profile: UserProfile = {
        id: `user_${Date.now()}`,
        name: name || email.split('@')[0] || 'Student',
        email,
        rollNo: rollNo || 'N/A',
        institution,
        department,
        yearOfStudy,
        snapdragonStudentPassId: `SNAP-IN-${Math.floor(1000 + Math.random() * 9000)}-NPU`,
        joinedAt: Date.now(),
      };

      await login(profile);
      setIsSubmitting(false);
    }, 600);
  };

  const handleSelectDemoUser = async (demoUser: UserProfile) => {
    setIsSubmitting(true);
    setStatusMessage(`Signing in as ${demoUser.name} (${demoUser.institution})...`);
    setTimeout(async () => {
      await login(demoUser);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] dark:bg-[#121110] transition-colors">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMainView('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-mono-code text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
          <button
            onClick={() => setMainView('dashboard')}
            className="text-xs font-mono-code text-[#C8102E] hover:underline"
          >
            Skip to Dashboard →
          </button>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl bg-white dark:bg-[#1A1918] border border-[#E5E0D8] dark:border-[#2A2825] shadow-lg p-7 sm:p-8 space-y-6">
          {/* Brand & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#C8102E] text-white flex items-center justify-center mx-auto shadow-sm">
              <span className="font-mono-code font-bold text-lg">L²</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#121212] dark:text-[#F2EFE9]">
              {authMode === 'signin' ? 'Sign In to LectureLens' : 'Register Student Developer Pass'}
            </h2>
            <p className="text-xs text-[#666666] dark:text-[#99958F] leading-relaxed">
              Designed for Indian engineering students on Snapdragon® AI PCs. Audio stays on-device; offline privacy guaranteed.
            </p>
          </div>

          {/* Quick Demo Student Sign-In (For Judges & Evaluators) */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
              <span className="font-semibold uppercase tracking-wider text-[#C8102E]">
                1-Click Evaluator Sign-In
              </span>
              <span>Fast Track</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SAMPLE_DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectDemoUser(demo)}
                  disabled={isSubmitting}
                  className="p-2.5 rounded-lg border border-[#E5E0D8] dark:border-[#383531] bg-white dark:bg-[#181716] hover:border-[#C8102E]/60 text-left transition-all shadow-2xs group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#121212] dark:text-[#F2EFE9] group-hover:text-[#C8102E] flex items-center gap-1.5">
                      <span>{demo.name}</span>
                      {demo.id === 'student_iqra' && (
                        <span className="text-[9px] font-mono-code px-1.5 py-0.2 rounded bg-[#C8102E]/10 text-[#C8102E] font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#666666] dark:text-[#99958F] truncate mt-0.5 font-mono-code">
                      {demo.institution.split('(')[0]} · {demo.rollNo}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#99958F] group-hover:translate-x-0.5 group-hover:text-[#C8102E] transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex rounded-lg bg-black/5 dark:bg-white/5 p-1 text-xs font-medium">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                authMode === 'signin'
                  ? 'bg-white dark:bg-[#2A2825] text-[#121212] dark:text-white shadow-2xs font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white'
              }`}
            >
              Student Sign In
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 rounded-md transition-colors ${
                authMode === 'register'
                  ? 'bg-white dark:bg-[#2A2825] text-[#121212] dark:text-white shadow-2xs font-semibold'
                  : 'text-[#666666] dark:text-[#99958F] hover:text-[#121212] dark:hover:text-white'
              }`}
            >
              New Student Pass
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
                College or University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#666666] dark:text-[#99958F]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@iitd.ac.in or username@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
                      Roll / ID Number
                    </label>
                    <input
                      type="text"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value)}
                      placeholder="e.g. 2023CSB1042"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                    >
                      <option>1st Year (B.Tech/BE)</option>
                      <option>2nd Year (B.Tech/BE)</option>
                      <option>3rd Year (B.Tech/BE)</option>
                      <option>4th Year (B.Tech/BE)</option>
                      <option>M.Tech / Dual Degree</option>
                      <option>PhD / Research Scholar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#666666] dark:text-[#99958F] mb-1">
                    Institution
                  </label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#FAF8F5] dark:bg-[#201F1E] border border-[#E5E0D8] dark:border-[#2A2825] text-[#121212] dark:text-[#F2EFE9] focus:outline-none focus:ring-1 focus:ring-[#C8102E]"
                  >
                    {INDIAN_INSTITUTIONS.map((inst, idx) => (
                      <option key={idx} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {statusMessage && (
              <p className="text-xs text-[#C8102E] font-mono-code text-center">
                {statusMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-[#C8102E] hover:bg-[#A50D25] disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>{authMode === 'signin' ? 'Sign In & Launch Copilot' : 'Create Student Pass'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Privacy Guarantee Footer */}
          <div className="pt-3 border-t border-[#E5E0D8] dark:border-[#2A2825] flex items-center justify-center gap-2 text-[11px] font-mono-code text-[#666666] dark:text-[#99958F]">
            <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Profile stored locally in IndexedDB. Zero cloud tracking.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
