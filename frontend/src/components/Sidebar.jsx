import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileCheck2,
  Award,
  Trophy,
  BarChart3,
  MessageSquare,
  Users,
  GraduationCap,
  Sliders,
  Calendar,
  Presentation,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, isGuide, isStudent } = useAuth();

  const studentLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/submissions', label: 'Submissions', icon: FileCheck2 },
    { to: '/evaluations', label: 'Paper Marks', icon: Award },
    { to: '/presentations', label: 'Presentation Reviews', icon: Presentation },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: `/chat/${user?.team?._id || 'direct'}`, label: 'Guide Discussion', icon: MessageSquare },
  ];

  const guideLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teams', label: 'Assigned Teams', icon: Users },
    { to: '/evaluations', label: 'Paper Evaluation', icon: Award },
    { to: '/presentations', label: 'Presentation Scoring', icon: Presentation },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/chat/all', label: 'Discussions', icon: MessageSquare },
  ];

  const adminLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/teams', label: 'Team Management', icon: Users },
    { to: '/guides', label: 'Faculty Guides', icon: GraduationCap },
    { to: '/rubrics', label: 'Evaluation Rubrics', icon: Sliders },
    { to: '/leaderboard', label: 'Master Leaderboard', icon: Trophy },
    { to: '/analytics', label: 'System Analytics', icon: BarChart3 },
    { to: '/academic-years', label: 'Academic Sessions', icon: Calendar },
  ];

  const links = isAdmin ? adminLinks : isGuide ? guideLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:block min-h-[calc(100vh-64px)] p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {isAdmin ? 'Coordinator' : isGuide ? 'Faculty Workspace' : 'Student Workspace'}
        </div>
        {links.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold border-l-2 border-sky-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-8 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 text-slate-800 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>Evaluation Formula</span>
        </div>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          70% IEEE Paper Score + 30% Presentation Reviews. Passing threshold is 60%.
        </p>
      </div>
    </aside>
  );
};
