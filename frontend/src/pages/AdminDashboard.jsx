import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/Badge';
import { Modal } from '../components/Modal';
import {
  Users,
  GraduationCap,
  FileText,
  Award,
  Plus,
  Trash2,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [guides, setGuides] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' | 'guides' | 'intervention'
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [teamSearch, setTeamSearch] = useState('');
  const [guideSearch, setGuideSearch] = useState('');

  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // New Team Form State
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPassword, setLeaderPassword] = useState('');
  const [membersInput, setMembersInput] = useState('');

  // New Guide Form State
  const [guideName, setGuideName] = useState('');
  const [guideEmail, setGuideEmail] = useState('');
  const [guidePassword, setGuidePassword] = useState('');
  const [guideDept, setGuideDept] = useState('Computer Science and Engineering');
  const [guideDesig, setGuideDesig] = useState('Assistant Professor');
  const [guidePhone, setGuidePhone] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [teamsRes, guidesRes, analyticsRes, yearsRes] = await Promise.all([
        api.get('/teams'),
        api.get('/users/guides'),
        api.get('/analytics'),
        api.get('/academic-years'),
      ]);

      if (teamsRes.data.success) setTeams(teamsRes.data.data);
      if (guidesRes.data.success) {
        setGuides(guidesRes.data.data);
        if (guidesRes.data.data.length > 0 && !selectedGuideId) {
          setSelectedGuideId(guidesRes.data.data[0]._id);
        }
      }
      if (analyticsRes.data.success) setStats(analyticsRes.data.data);
      if (yearsRes.data.success) setAcademicYears(yearsRes.data.data);
    } catch (err) {
      // Silently catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const parsedMembers = membersInput
        .split(',')
        .filter((m) => m.trim())
        .map((m, i) => {
          const trimmed = m.trim();
          const hasRoll = trimmed.includes('(') && trimmed.includes(')');
          return {
            name: hasRoll ? trimmed.split('(')[0].trim() : trimmed,
            rollNumber: hasRoll ? trimmed.split('(')[1].replace(')', '').trim() : `ST${i + 1}`,
            department,
          };
        });

      const res = await api.post('/teams', {
        teamName,
        projectTitle,
        academicYear,
        department,
        guideId: selectedGuideId,
        leaderName,
        leaderEmail,
        leaderPassword,
        members: parsedMembers,
      });

      if (res.data.success) {
        setIsTeamModalOpen(false);
        setTeamName('');
        setProjectTitle('');
        setLeaderName('');
        setLeaderEmail('');
        setLeaderPassword('');
        setMembersInput('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create team');
    }
  };

  const handleCreateGuide = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/guides', {
        name: guideName,
        email: guideEmail,
        password: guidePassword,
        department: guideDept,
        designation: guideDesig,
        phoneNumber: guidePhone,
      });

      if (res.data.success) {
        setIsGuideModalOpen(false);
        setGuideName('');
        setGuideEmail('');
        setGuidePassword('');
        setGuidePhone('');
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create guide');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team and its associated records?')) {
      try {
        await api.delete(`/teams/${teamId}`);
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const handleToggleGuideStatus = async (guideId) => {
    try {
      await api.patch(`/users/${guideId}/toggle-status`);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Status toggle failed');
    }
  };

  const filteredTeams = teams.filter((t) => {
    if (!teamSearch) return true;
    const q = teamSearch.toLowerCase();
    return (
      t.teamName.toLowerCase().includes(q) ||
      t.projectTitle.toLowerCase().includes(q) ||
      (t.guide?.name || '').toLowerCase().includes(q) ||
      (t.leader?.name || '').toLowerCase().includes(q)
    );
  });

  const filteredGuides = guides.filter((g) => {
    if (!guideSearch) return true;
    const q = guideSearch.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      (g.department || '').toLowerCase().includes(q)
    );
  });

  const weakTeams = teams.filter((t) => (t.finalScore !== null && t.finalScore < 60) || t.finalScore === 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                Institutional Coordinator
              </span>
              <span className="text-xs text-slate-500 font-medium">Session 2026-2027</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Academic Project & Review Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Oversee academic cohorts, faculty guides, project teams, IEEE paper rubric marks, and institutional analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsTeamModalOpen(true)}
              className="saas-btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create Team</span>
            </button>
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="saas-btn-secondary"
            >
              <Plus className="w-4 h-4" />
              <span>Add Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Project Teams"
          value={teams.length}
          subtitle="Registered Teams"
          icon={Users}
        />
        <StatCard
          title="Faculty Guides"
          value={guides.length}
          subtitle="Project Supervisors"
          icon={GraduationCap}
        />
        <StatCard
          title="Paper Submissions"
          value={stats?.summary?.totalSubmissions || 0}
          subtitle="Draft iterations logged"
          icon={FileText}
        />
        <StatCard
          title="Reviews Conducted"
          value={(stats?.summary?.totalEvaluations || 0) + (stats?.summary?.totalPresentations || 0)}
          subtitle="Paper + Presentation reviews"
          icon={Award}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'teams'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Team Management ({teams.length})
        </button>
        <button
          onClick={() => setActiveTab('guides')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'guides'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Faculty Guides ({guides.length})
        </button>
        <button
          onClick={() => setActiveTab('intervention')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
            activeTab === 'intervention'
              ? 'bg-rose-600 text-white shadow-subtle'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>At-Risk Teams ({weakTeams.length})</span>
        </button>
      </div>

      {/* Tab 1: Teams Management */}
      {activeTab === 'teams' && (
        <div className="saas-card overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Project Teams</h3>
              <p className="text-xs text-slate-500">List of all student research teams</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search teams, projects, guides..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                className="saas-input pl-8 py-1.5"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Team Name & Project</th>
                  <th>Assigned Guide</th>
                  <th>Team Leader</th>
                  <th>Session</th>
                  <th>Latest Version</th>
                  <th>Final Score</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderOpen className="w-8 h-8 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700">No project teams found</p>
                        <p className="text-xs text-slate-500">
                          {teamSearch ? 'Try a different search query' : 'Create the first team using the button above'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <p className="font-semibold text-slate-900">{t.teamName}</p>
                        <p className="text-xs text-slate-500 max-w-xs truncate">{t.projectTitle}</p>
                      </td>
                      <td>
                        <span className="font-medium text-slate-900">{t.guide?.name || 'Unassigned'}</span>
                        <p className="text-[11px] text-slate-500">{t.guide?.department}</p>
                      </td>
                      <td>
                        <p className="font-medium text-slate-900">{t.leader?.name || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500">{t.leader?.email}</p>
                      </td>
                      <td>
                        <span className="text-xs text-slate-600">{t.academicYear}</span>
                      </td>
                      <td>
                        <span className="text-xs font-semibold text-slate-700">{t.latestVersion || 'None'}</span>
                        <div className="mt-0.5"><StatusBadge status={t.latestSubmissionStatus} /></div>
                      </td>
                      <td>
                        {t.finalScore !== null ? (
                          <span className="font-bold text-slate-900 text-sm">{t.finalScore}%</span>
                        ) : (
                          <span className="text-xs text-slate-400">Not Graded</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteTeam(t._id)}
                          className="saas-btn-danger"
                          title="Delete Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Faculty Guides */}
      {activeTab === 'guides' && (
        <div className="saas-card overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Faculty Project Guides</h3>
              <p className="text-xs text-slate-500">Registered department faculty supervisors</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search faculty guides..."
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                className="saas-input pl-8 py-1.5"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Assigned Teams</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <GraduationCap className="w-8 h-8 text-slate-400" />
                        <p className="text-sm font-medium text-slate-700">No faculty guides registered</p>
                        <p className="text-xs text-slate-500">Click 'Add Guide' to register faculty members</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGuides.map((g) => (
                    <tr key={g._id}>
                      <td>
                        <p className="font-semibold text-slate-900">{g.name}</p>
                      </td>
                      <td className="text-slate-600">{g.email}</td>
                      <td className="text-slate-600">{g.department}</td>
                      <td className="text-slate-600">{g.designation}</td>
                      <td>
                        <span className="font-semibold text-slate-900">{g.assignedTeamsCount || 0} Teams</span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            g.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {g.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleToggleGuideStatus(g._id)}
                          className="saas-btn-secondary py-1 text-xs"
                        >
                          {g.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Intervention / At-Risk */}
      {activeTab === 'intervention' && (
        <div className="saas-card p-6 bg-white space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>At-Risk Teams Requiring Academic Intervention</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Teams with final combined score below 60% or missing critical reviews
            </p>
          </div>

          {weakTeams.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900">All Teams are on Track</p>
              <p className="text-xs text-slate-500 mt-0.5">No teams are currently falling below the 60% threshold.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weakTeams.map((t) => (
                <div key={t._id} className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{t.teamName}</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                        Score: {t.finalScore !== null ? `${t.finalScore}%` : '0%'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{t.projectTitle}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      Supervisor: <span className="font-medium text-slate-700">{t.guide?.name || 'Unassigned'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 text-xs">
                    <span className="text-rose-700 font-medium">Immediate counseling recommended</span>
                    <Link
                      to={`/chat/${t._id}`}
                      className="text-sky-600 hover:text-sky-800 font-semibold"
                    >
                      Open Discussion →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Team */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Register Project Team"
        subtitle="Create a student project team and assign faculty guide"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Team Name</label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Team VisionAI"
                className="saas-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Academic Session</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="saas-input"
              >
                {academicYears.map((y) => (
                  <option key={y._id} value={y.year}>
                    {y.label || y.year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Project / Paper Title</label>
            <input
              type="text"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus in Multi-Agent Swarm Systems"
              className="saas-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="saas-input"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication">Electronics and Communication</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assign Faculty Guide</label>
              <select
                required
                value={selectedGuideId}
                onChange={(e) => setSelectedGuideId(e.target.value)}
                className="saas-input"
              >
                {guides.length === 0 ? (
                  <option value="">No guides available - create a guide first</option>
                ) : (
                  guides.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.department})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-semibold text-slate-800">Team Leader Account Credentials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Leader Name</label>
                <input
                  type="text"
                  required
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Student Name"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Leader Email</label>
                <input
                  type="email"
                  required
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  placeholder="student@institution.edu"
                  className="saas-input"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={leaderPassword}
                  onChange={(e) => setLeaderPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="saas-input"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Team Members (Optional, comma-separated with optional Roll No)
            </label>
            <input
              type="text"
              value={membersInput}
              onChange={(e) => setMembersInput(e.target.value)}
              placeholder="e.g. Jane Doe (CS202601), John Smith (CS202602)"
              className="saas-input"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsTeamModalOpen(false)}
              className="saas-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={guides.length === 0}
              className="saas-btn-primary"
            >
              Register Team
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Guide */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title="Add Faculty Project Guide"
        subtitle="Create faculty login account for paper evaluation and review"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateGuide} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Name</label>
              <input
                type="text"
                required
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
                placeholder="Dr. John Doe"
                className="saas-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={guideEmail}
                onChange={(e) => setGuideEmail(e.target.value)}
                placeholder="faculty@institution.edu"
                className="saas-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={guideDept}
                onChange={(e) => setGuideDept(e.target.value)}
                className="saas-input"
              >
                <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication">Electronics and Communication</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <select
                value={guideDesig}
                onChange={(e) => setGuideDesig(e.target.value)}
                className="saas-input"
              >
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Head of Department">Head of Department</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={guidePassword}
                onChange={(e) => setGuidePassword(e.target.value)}
                placeholder="Set secure password"
                className="saas-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={guidePhone}
                onChange={(e) => setGuidePhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="saas-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(false)}
              className="saas-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="saas-btn-primary"
            >
              Create Guide Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
