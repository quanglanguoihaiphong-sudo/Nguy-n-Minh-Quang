import React from 'react';
import { ActiveTab, UserRole } from '../types';
import { Sparkles, Users, GraduationCap, Calendar, Compass, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole: UserRole;
  onToggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  onToggleRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('socratic');
              }}
              className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap"
            >
              Socrates<span className="text-indigo-600">AI</span>
            </a>
          </div>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onSelectTab('socratic')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'socratic'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Gia sư Socratic</span>
            </button>

            <button
              onClick={() => onSelectTab('materials')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'materials'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Chuyển đổi tài liệu</span>
            </button>

            <button
              onClick={() => onSelectTab('planner')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'planner'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Lịch thi thích ứng</span>
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Bản đồ năng lực</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action - Role Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleRole}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                userRole === 'parent'
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Chuyển đổi giữa chế độ Học sinh và Chế độ Phụ huynh / Cố vấn"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{userRole === 'parent' ? 'Chế độ Phụ huynh' : 'Góc Giám sát Phụ huynh'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar for small screens */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-100 gap-4 text-xs font-medium">
          <button
            onClick={() => onSelectTab('socratic')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              activeTab === 'socratic' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Socratic
          </button>
          <button
            onClick={() => onSelectTab('materials')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              activeTab === 'materials' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Tài liệu
          </button>
          <button
            onClick={() => onSelectTab('planner')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              activeTab === 'planner' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Lịch thi
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`whitespace-nowrap px-2.5 py-1 rounded-md ${
              activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
            }`}
          >
            Năng lực
          </button>
        </div>
      </div>
    </header>
  );
};
