import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Bell,
  BookOpen,
  LogOut,
  Sparkles,
  Award,
  CheckCircle,
  FileText,
  MessageSquare,
  User as UserIcon,
} from 'lucide-react';
import api from '../api/api';
import { Link } from 'react-router-dom';

export const Navbar = ({ onOpenAIModal }) => {
  const { user, logout } = useAuth();
  const { notifications: liveNotifs } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      // Silently handle error
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, liveNotifs]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      // Silently handle error
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return <span className="bg-slate-100 text-slate-800 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Administrator</span>;
    }
    if (user?.role === 'guide') {
      return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Project Guide</span>;
    }
    return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full font-medium">Team Leader</span>;
  };

  return (
    <nav className="bg-white sticky top-0 z-40 border-b border-slate-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-subtle">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <Link to="/" className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>IEEE Paper Tracker</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">Portal</span>
              </Link>
              <p className="text-[11px] text-slate-500 hidden sm:block">Academic Project & Conference Review Management</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAIModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition"
              title="Open AI Paper Abstract Evaluator"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>AI Abstract Tool</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-elevated border border-slate-200 p-4 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-600" />
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="text-[11px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-medium border border-sky-200">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id || Math.random()}
                          className={`p-3 rounded-lg border text-xs transition ${
                            n.read
                              ? 'bg-slate-50/60 border-slate-100 text-slate-500'
                              : 'bg-sky-50/40 border-sky-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.type === 'submission' && <FileText className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                            {n.type === 'evaluation' && <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                            {n.type === 'message' && <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                            {n.type === 'system' && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                            <div>
                              <p className="font-semibold text-slate-900">{n.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-slate-600">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-slate-900 leading-tight">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{user?.designation || user?.role}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-elevated border border-slate-200 p-3 z-50 animate-in fade-in duration-150">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-2">
                    <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <div className="mt-2">{getRoleBadge()}</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
