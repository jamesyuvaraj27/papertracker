import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getFileUrl } from '../api/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/Badge';
import {
  Users,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  MessageSquare,
  TrendingUp,
  Presentation,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const GuideDashboard = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGuideData = async () => {
    try {
      setLoading(true);
      const [teamsRes, subsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/submissions'),
      ]);

      if (teamsRes.data.success) {
        setTeams(teamsRes.data.data);
      }
      if (subsRes.data.success) {
        setSubmissions(subsRes.data.data);
      }
    } catch (err) {
      // Silently catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuideData();
  }, []);

  const pendingSubmissions = submissions.filter(
    (s) => s.status === 'Submitted' || s.status === 'Under Review'
  );
  const reviewedSubmissions = submissions.filter(
    (s) => s.status === 'Approved' || s.status === 'Revision Required'
  );

  const avgTeamScore = teams.length > 0
    ? Number((teams.reduce((acc, t) => acc + (t.finalScore || 0), 0) / teams.length).toFixed(1))
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Guide Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
                Faculty Guide Workspace
              </span>
              <span className="text-xs text-slate-500 font-medium">{user?.department}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review IEEE paper submissions, conduct presentation milestone evaluations, and provide feedback to assigned teams.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/leaderboard"
              className="saas-btn-secondary"
            >
              <span>View Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Teams"
          value={teams.length}
          subtitle="Active project teams"
          icon={Users}
        />
        <StatCard
          title="Pending Reviews"
          value={pendingSubmissions.length}
          subtitle="Drafts awaiting evaluation"
          icon={Clock}
        />
        <StatCard
          title="Evaluations Done"
          value={reviewedSubmissions.length}
          subtitle="Versions reviewed"
          icon={CheckCircle2}
        />
        <StatCard
          title="Average Score"
          value={`${avgTeamScore}%`}
          subtitle="Assigned batch average"
          icon={TrendingUp}
        />
      </div>

      {/* Pending Reviews Priority Section */}
      {pendingSubmissions.length > 0 && (
        <div className="saas-card p-6 bg-white border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Submissions Awaiting Your Review</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              {pendingSubmissions.length} Pending
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSubmissions.map((sub) => (
              <div
                key={sub._id}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-sky-300 transition flex flex-col justify-between gap-3 shadow-card"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">{sub.team?.teamName}</span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[11px] border border-sky-200">
                      {sub.versionLabel}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-1">{sub.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {sub.abstract || 'No abstract preview provided.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Submitted by: {sub.submittedBy?.name || 'Student'} on {new Date(sub.submittedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sub.fileUrl && (
                      <a
                        href={getFileUrl(sub.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>
                    )}
                    {sub.externalLink && (
                      <a
                        href={sub.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200"
                        title="External Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/evaluations/${sub._id}`)}
                    className="saas-btn-primary py-1 text-xs"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Evaluate Paper</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Teams Table */}
      <div className="saas-card overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Your Assigned Teams</h3>
            <p className="text-xs text-slate-500">Student teams under your project supervision</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{teams.length} Teams</span>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Team Name & Project</th>
                <th>Leader Contact</th>
                <th>Submissions</th>
                <th>Latest Version</th>
                <th>Paper Score</th>
                <th>Presentation</th>
                <th>Final Score</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">No teams assigned yet</p>
                      <p className="text-xs text-slate-500">The project coordinator will assign student teams to you.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                teams.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <p className="font-semibold text-slate-900">{t.teamName}</p>
                      <p className="text-xs text-slate-500 max-w-xs truncate">{t.projectTitle}</p>
                    </td>
                    <td>
                      <p className="font-medium text-slate-900">{t.leader?.name || 'N/A'}</p>
                      <p className="text-[11px] text-slate-500">{t.leader?.email}</p>
                    </td>
                    <td>
                      <span className="font-semibold text-slate-900">{t.submissionCount || 0} Drafts</span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-700">{t.latestVersion || 'None'}</span>
                      <div className="mt-0.5"><StatusBadge status={t.latestSubmissionStatus} /></div>
                    </td>
                    <td>
                      {t.paperScore !== null ? (
                        <span className="font-bold text-slate-900">{t.paperScore}%</span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td>
                      {t.presentationScore !== null ? (
                        <span className="font-bold text-slate-900">{t.presentationScore}%</span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td>
                      {t.finalScore !== null ? (
                        <span className="font-bold text-sky-700 text-sm">{t.finalScore}%</span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          to={`/presentations/${t._id}`}
                          className="saas-btn-secondary py-1 text-xs"
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                        <Link
                          to={`/chat/${t._id}`}
                          className="saas-btn-secondary py-1 text-xs"
                          title="Team Discussion"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
