import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAbstractModal } from './components/AIAbstractModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { GuideDashboard } from './pages/GuideDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EvaluationPage } from './pages/EvaluationPage';
import { PresentationPage } from './pages/PresentationPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChatPage } from './pages/ChatPage';
import { SubmissionsListPage } from './pages/SubmissionsListPage';
import { RubricsConfigPage } from './pages/RubricsConfigPage';
import { AcademicYearsPage } from './pages/AcademicYearsPage';

// Protected App Layout Wrapper
const AppLayout = () => {
  const { user, loading, isAdmin, isGuide, isStudent } = useAuth();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Loading Academic Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const renderDashboard = () => {
    if (isAdmin) return <AdminDashboard />;
    if (isGuide) return <GuideDashboard />;
    return <StudentDashboard onOpenAIModal={() => setIsAIModalOpen(true)} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Main Navbar */}
      <Navbar onOpenAIModal={() => setIsAIModalOpen(true)} />

      {/* Body with Sidebar and Main Content */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <Routes>
            <Route path="/" element={renderDashboard()} />
            <Route path="/submissions" element={<SubmissionsListPage />} />
            <Route path="/evaluations" element={<EvaluationPage />} />
            <Route path="/evaluations/:submissionId" element={<EvaluationPage />} />
            <Route path="/presentations" element={<PresentationPage />} />
            <Route path="/presentations/:teamId" element={<PresentationPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:teamId" element={<ChatPage />} />
            <Route path="/rubrics" element={<RubricsConfigPage />} />
            <Route path="/academic-years" element={<AcademicYearsPage />} />
            <Route path="/teams" element={isAdmin ? <AdminDashboard /> : <GuideDashboard />} />
            <Route path="/guides" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* AI Reviewer Modal */}
      <AIAbstractModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
