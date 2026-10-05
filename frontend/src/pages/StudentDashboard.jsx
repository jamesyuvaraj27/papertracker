import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getFileUrl } from '../api/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge, CategoryBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  FileText,
  Award,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  Users,
  Sparkles,
  TrendingUp,
  FileCheck,
  Calendar,
  Presentation,
  FolderOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Link } from 'react-router-dom';

export const StudentDashboard = ({ onOpenAIModal }) => {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [paperTitle, setPaperTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [changelog, setChangelog] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [teamsRes, subsRes, evalsRes, presRes] = await Promise.all([
        api.get('/teams'),
        api.get('/submissions'),
        api.get('/evaluations'),
        api.get('/presentations'),
      ]);

      if (teamsRes.data.success && teamsRes.data.data.length > 0) {
        setTeamData(teamsRes.data.data[0]);
      }
      if (subsRes.data.success) {
        setSubmissions(subsRes.data.data);
      }
      if (evalsRes.data.success) {
        setEvaluations(evalsRes.data.data);
      }
      if (presRes.data.success) {
        setPresentations(presRes.data.data);
      }
    } catch (err) {
      // Silently catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const latestSubmission = submissions[0] || null;
  const latestEvaluation = evaluations.find((e) => e.submission?._id === latestSubmission?._id) || evaluations[0] || null;

  // Calculate scores
  const paperScore = latestEvaluation ? latestEvaluation.percentage : 0;
  const avgPresentationScore = presentations.length > 0
    ? Number((presentations.reduce((acc, p) => acc + p.percentage, 0) / presentations.length).toFixed(1))
    : 0;
  const finalScore = Number(((paperScore * 0.7) + (avgPresentationScore * 0.3)).toFixed(1));

  // Chart data: Version progression
  const progressLineData = evaluations
    .slice()
    .reverse()
    .map((ev) => ({
      version: `V${ev.version || 1}`,
      score: ev.percentage,
    }));

  // Chart data: Radar categories for latest evaluation
  const categoryAverages = {
    'Research Quality': { total: 0, count: 0 },
    'Writing Quality': { total: 0, count: 0 },
    'Technical Quality': { total: 0, count: 0 },
    'Conference Readiness': { total: 0, count: 0 },
  };

  if (latestEvaluation && latestEvaluation.scores) {
    latestEvaluation.scores.forEach((s) => {
      if (categoryAverages[s.category]) {
        categoryAverages[s.category].total += s.marks;
        categoryAverages[s.category].count += 1;
      }
    });
  }

  const radarData = Object.keys(categoryAverages).map((cat) => ({
    category: cat,
    score: categoryAverages[cat].count > 0
      ? Number(((categoryAverages[cat].total / (categoryAverages[cat].count * 10)) * 100).toFixed(1))
      : 0,
    fullMark: 100,
  }));

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);

    const formData = new FormData();
    formData.append('title', paperTitle || teamData?.projectTitle || 'IEEE Paper Draft');
    formData.append('abstract', abstract);
    formData.append('keywords', keywords);
    formData.append('changelog', changelog);
    if (externalLink) formData.append('externalLink', externalLink);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setIsUploadOpen(false);
        setPaperTitle('');
        setAbstract('');
        setKeywords('');
        setExternalLink('');
        setChangelog('');
        setSelectedFile(null);
        fetchStudentData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Please verify file and inputs.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Student Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
                {teamData?.teamName || 'Project Workspace'}
              </span>
              <span className="text-xs text-slate-500 font-medium">Session {teamData?.academicYear || '2026-2027'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              {teamData?.projectTitle || 'Academic Project Management'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Project Guide: <span className="font-semibold text-slate-700">{teamData?.guide?.name || 'Unassigned'}</span> ({teamData?.guide?.department || 'Department'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAIModal}
              className="saas-btn-secondary"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>AI Abstract Tool</span>
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="saas-btn-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Draft</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Paper Score (70%)"
          value={latestEvaluation ? `${latestEvaluation.percentage}%` : 'Pending'}
          subtitle={latestEvaluation ? `Evaluated ${latestEvaluation.submission?.versionLabel || 'V1'}` : 'Awaiting guide review'}
          icon={Award}
        />
        <StatCard
          title="Presentation Score (30%)"
          value={presentations.length > 0 ? `${avgPresentationScore}%` : 'Pending'}
          subtitle={`${presentations.length} Milestones graded`}
          icon={Presentation}
        />
        <StatCard
          title="Overall Standing"
          value={latestEvaluation || presentations.length > 0 ? `${finalScore}%` : 'Pending'}
          subtitle="Combined weighted score"
          icon={TrendingUp}
        />
        <StatCard
          title="Draft Version"
          value={latestSubmission ? latestSubmission.versionLabel : 'No Drafts'}
          subtitle={latestSubmission ? latestSubmission.status : 'Upload paper draft'}
          icon={FileCheck}
        />
      </div>

      {/* Main Content Grid: Latest Evaluation + Team Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Evaluation Breakdown (2 cols) */}
        <div className="lg:col-span-2 saas-card p-6 bg-white space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Latest IEEE Paper Evaluation Report</h3>
              <p className="text-xs text-slate-500">
                {latestEvaluation
                  ? `Evaluated by ${latestEvaluation.evaluator?.name || 'Guide'} on ${new Date(latestEvaluation.createdAt).toLocaleDateString()}`
                  : 'No evaluations published yet'}
              </p>
            </div>
            {latestEvaluation && <StatusBadge status={latestEvaluation.overallVerdict} />}
          </div>

          {!latestEvaluation ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">No evaluation reports available</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {submissions.length === 0
                  ? 'Upload your first IEEE paper draft to begin the review process.'
                  : 'Your submission is in review by your project supervisor.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Feedback cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Identified Strengths</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {latestEvaluation.strengths || 'Strong foundation and conceptual clarity.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Areas for Improvement</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {latestEvaluation.weaknesses || 'Focus on expanding baseline comparisons in results section.'}
                  </p>
                </div>
              </div>

              {latestEvaluation.suggestions && (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <h4 className="font-semibold text-slate-800 mb-1">Guide Direct Action Items</h4>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {latestEvaluation.suggestions}
                  </p>
                </div>
              )}

              {/* Rubric Category Radar */}
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Rubric Competency Matrix</h4>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Radar name="Score" dataKey="score" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column: Team Roster & Milestone History */}
        <div className="space-y-6">
          {/* Team Roster Card */}
          <div className="saas-card p-5 bg-white space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <span>Team Members</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{teamData?.leader?.name || user?.name}</p>
                  <p className="text-[11px] text-slate-500">{teamData?.leader?.email || user?.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-medium text-[10px] border border-sky-200">
                  Leader
                </span>
              </div>

              {(teamData?.members || []).map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.rollNumber || `Member ${idx + 1}`}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Member</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Chat Link */}
          <div className="saas-card p-5 bg-white space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" />
              <span>Guide Communication</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct communication channel with your faculty supervisor for questions regarding evaluations and paper drafts.
            </p>
            <Link
              to={`/chat/${teamData?._id || 'direct'}`}
              className="mt-2 w-full saas-btn-secondary text-xs"
            >
              <span>Open Guide Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Submission Iteration Archive */}
      <div className="saas-card overflow-hidden bg-white">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Submission & Revision History</h3>
            <p className="text-xs text-slate-500">Chronological history of paper drafts uploaded for guide evaluation</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{submissions.length} Uploads</span>
        </div>

        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Version</th>
                <th>Title & Changelog</th>
                <th>Submission Date</th>
                <th>Format / File</th>
                <th>Review Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <p className="text-sm font-medium text-slate-700">No submissions uploaded yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click 'Upload New Draft' to submit your initial IEEE paper version.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <span className="font-bold text-slate-900">{sub.versionLabel}</span>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-900">{sub.title}</p>
                      <p className="text-xs text-slate-500">{sub.changelog || 'Draft update'}</p>
                    </td>
                    <td className="text-slate-600">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {sub.fileUrl && (
                          <a
                            href={getFileUrl(sub.fileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1"
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
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200"
                            title="External Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/evaluations/${sub._id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                      >
                        View Report →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Draft Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload IEEE Paper Draft"
        subtitle="Submit your paper draft for faculty guide evaluation and rubric scoring"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Paper Title</label>
            <input
              type="text"
              required
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder={teamData?.projectTitle || 'Enter IEEE paper title'}
              className="saas-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Abstract</label>
            <textarea
              rows={4}
              required
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Paste the abstract of this paper draft..."
              className="saas-input leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. Deep Learning, IEEE, Swarm"
                className="saas-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">External Link / Doc URL (Optional)</label>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://overleaf.com/read/..."
                className="saas-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Paper File (PDF recommended)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Changelog / Version Notes</label>
            <input
              type="text"
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Summary of improvements made in this version..."
              className="saas-input"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="saas-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadLoading || (!selectedFile && !externalLink)}
              className="saas-btn-primary"
            >
              {uploadLoading ? 'Uploading Paper...' : 'Submit Draft'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
