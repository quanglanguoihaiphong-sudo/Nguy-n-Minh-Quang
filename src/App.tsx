import React, { useState } from 'react';
import { ActiveTab, UserRole } from './types';
import { Header } from './components/Header';
import { SocraticTutorView } from './components/SocraticTutorView';
import { DocumentConverterView } from './components/DocumentConverterView';
import { ExamPlannerView } from './components/ExamPlannerView';
import { AnalyticsView } from './components/AnalyticsView';
import { ParentMentorView } from './components/ParentMentorView';
import { GraduationCap, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('socratic');
  const [userRole, setUserRole] = useState<UserRole>('student');

  // Handle fix gap clicked in analytics -> route to Socratic
  const handleFixGap = (topic: string) => {
    setActiveTab('socratic');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top 3-Zone Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (userRole === 'parent') setUserRole('student');
        }}
        userRole={userRole}
        onToggleRole={() =>
          setUserRole((prev) => (prev === 'student' ? 'parent' : 'student'))
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {userRole === 'parent' ? (
          <ParentMentorView onSwitchBack={() => setUserRole('student')} />
        ) : (
          <>
            {activeTab === 'socratic' && (
              <SocraticTutorView />
            )}
            {activeTab === 'materials' && (
              <DocumentConverterView />
            )}
            {activeTab === 'planner' && (
              <ExamPlannerView />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsView onFixGapClicked={handleFixGap} />
            )}
          </>
        )}
      </main>

      {/* Footer conforming to Frontend Design Constitution (clean unboxed text, no pills) */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">SocratesAI</span>
            <span>·</span>
            <span>Phương pháp giải thích Socratic & Ôn thi thích ứng</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Retrieval Practice</span>
            <span>·</span>
            <span>Spaced Repetition</span>
            <span>·</span>
            <span>Adaptive Pacing</span>
          </div>

          <div className="text-slate-400">
            © 2026 SocratesAI · Thiết kế vì năng lực tư duy độc lập
          </div>
        </div>
      </footer>
    </div>
  );
}
