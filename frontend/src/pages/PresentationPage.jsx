import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { StatusBadge } from '../components/Badge';
import {
  Presentation,
  Save,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Users,
  Award,
  FolderOpen,
} from 'lucide-react';

export const PresentationPage = () => {
  const { teamId } = useParams();
  const { isGuide, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || '');
  const [reviewType, setReviewType] = useState('Review 1');
  const [parameters, setParameters] = useState([]);
  const [scores, setScores] = useState({});
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [recommendation, setRecommendation] = useState('Good - Minor Changes');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [teamsRes, paramsRes] = await Promise.all([
          api.get('/teams'),
          api.get('/evaluations/parameters?isPresentation=true'),
        ]);

        if (teamsRes.data.success) {
          setTeams(teamsRes.data.data);
          if (!selectedTeamId && teamsRes.data.data.length > 0) {
            setSelectedTeamId(teamsRes.data.data[0]._id);
          }
        }
        if (paramsRes.data.success) {
          setParameters(paramsRes.data.data);
        }
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // When team or review type changes, load any existing review
  useEffect(() => {
    if (!selectedTeamId) return;

    const loadReview = async () => {
      try {
        const res = await api.get(`/presentations?teamId=${selectedTeamId}&reviewType=${reviewType}`);
        if (res.data.success && res.data.data.length > 0) {
          const rev = res.data.data[0];
          const mapped = {};
          rev.scores.forEach((s) => {
            mapped[s.parameter || s.paramName] = { marks: s.marks, remarks: s.remarks };
          });
          setScores(mapped);
          setGeneralFeedback(rev.generalFeedback || '');
          setRecommendation(rev.recommendation || 'Good - Minor Changes');
        } else {
          // Initialize default scores
          const defaults = {};
          parameters.forEach((p) => {
            defaults[p._id] = { marks: 8.5, remarks: '' };
          });
          setScores(defaults);
          setGeneralFeedback('');
          setRecommendation('Good - Minor Changes');
        }
      } catch (err) {
        // Silently catch
      }
    };

    if (parameters.length > 0) {
      loadReview();
    }
  }, [selectedTeamId, reviewType, parameters]);

  const handleScoreChange = (paramId, marks) => {
    setScores((prev) => ({
      ...prev,
      [paramId]: {
        ...(prev[paramId] || {}),
        marks: Number(marks),
      },
    }));
  };

  const handleRemarksChange = (paramId, remarks) => {
    setScores((prev) => ({
      ...prev,
      [paramId]: {
        ...(prev[paramId] || {}),
        remarks,
      },
    }));
  };

  const totalMarks = parameters.reduce((sum, p) => {
    const val = scores[p._id]?.marks;
    return sum + (val !== undefined ? Number(val) : 8.5);
  }, 0);
  const maxMarks = parameters.length * 10;
  const livePercentage = maxMarks > 0 ? Number(((totalMarks / maxMarks) * 100).toFixed(1)) : 0;

  const currentTeam = teams.find((t) => t._id === selectedTeamId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formattedScores = parameters.map((p) => ({
        parameter: p._id,
        paramName: p.name,
        marks: scores[p._id]?.marks !== undefined ? scores[p._id].marks : 8.5,
        maxMarks: 10,
        remarks: scores[p._id]?.remarks || '',
      }));

      const res = await api.post('/presentations', {
        teamId: selectedTeamId,
        reviewType,
        scores: formattedScores,
        generalFeedback,
        recommendation,
      });

      if (res.data.success) {
        alert(`${reviewType} review recorded successfully! Score: ${livePercentage}%`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200">
                Presentation Defense
              </span>
              <span className="text-xs text-slate-500 font-medium">30% Institutional Weight</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Semester Presentation & Q&A Defense Scoring
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Evaluate student project demonstrations, technical Q&A defenses, implementation progress, and team synergy.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="saas-btn-secondary py-1.5 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="saas-card p-12 text-center bg-white border border-slate-200">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No project teams registered</p>
          <p className="text-xs text-slate-500 mt-0.5">Presentation defense reviews can be recorded once teams are created.</p>
        </div>
      ) : (
        <>
          {/* Team and Stage Selection Bar */}
          <div className="saas-card p-4 bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Select Team:</span>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="saas-select font-medium text-xs max-w-sm"
                >
                  {teams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.teamName} - {t.projectTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Review Stage:</span>
                <select
                  value={reviewType}
                  onChange={(e) => setReviewType(e.target.value)}
                  className="saas-select font-medium text-xs"
                >
                  <option value="Review 1">Review 1 (Conceptual Design)</option>
                  <option value="Review 2">Review 2 (Implementation Progress)</option>
                  <option value="Review 3">Review 3 (Final Defense)</option>
                </select>
              </div>
            </div>

            {currentTeam && (
              <div className="text-xs text-slate-500">
                Guide: <strong className="text-slate-800">{currentTeam.guide?.name || 'Unassigned'}</strong>
              </div>
            )}
          </div>

          {/* Review Scoring Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Live Score Sticky Ribbon */}
            <div className="saas-card p-4 bg-slate-900 text-white shadow-elevated flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Defense Score (30%)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{livePercentage}%</span>
                    <span className="text-xs text-slate-400">({totalMarks.toFixed(1)} / {maxMarks} Marks)</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-700 hidden sm:block" />

                <div className="hidden sm:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Panel Recommendation</span>
                  <div>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      disabled={!isGuide && !isAdmin}
                      className="mt-0.5 bg-slate-800 border border-slate-700 rounded text-xs px-2.5 py-1 text-white font-semibold focus:outline-none"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Good - Minor Changes">Good - Minor Changes</option>
                      <option value="Major Rework Required">Major Rework Required</option>
                    </select>
                  </div>
                </div>
              </div>

              {(isGuide || isAdmin) && (
                <button
                  type="submit"
                  disabled={saving}
                  className="saas-btn-primary bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : `Publish ${reviewType} Score`}</span>
                </button>
              )}
            </div>

            {/* Rubrics Parameters Table */}
            <div className="saas-card overflow-hidden bg-white">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th className="w-12 text-center">#</th>
                    <th>Rubric Criteria</th>
                    <th>Guideline</th>
                    <th className="w-32 text-center">Marks (0-10)</th>
                    <th>Panel Observations</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((p, idx) => {
                    const currentMarks = scores[p._id]?.marks !== undefined ? scores[p._id].marks : 8.5;
                    const currentRemarks = scores[p._id]?.remarks || '';

                    return (
                      <tr key={p._id}>
                        <td className="text-center font-bold text-slate-400">{idx + 1}</td>
                        <td>
                          <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                        </td>
                        <td>
                          <p className="text-[11px] text-slate-500 max-w-md">{p.description}</p>
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.5"
                            disabled={!isGuide && !isAdmin}
                            value={currentMarks}
                            onChange={(e) => handleScoreChange(p._id, e.target.value)}
                            className="w-16 px-2 py-1 text-center font-bold text-sm bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-sky-600"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Observations..."
                            disabled={!isGuide && !isAdmin}
                            value={currentRemarks}
                            onChange={(e) => handleRemarksChange(p._id, e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Feedback textarea */}
            <div className="saas-card p-5 bg-white space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Review Panel Summary Feedback & Demo Evaluation
              </label>
              <textarea
                rows={4}
                disabled={!isGuide && !isAdmin}
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                placeholder="Provide comprehensive review notes covering presentation delivery, working demonstration proof, algorithmic understanding, and team member participation..."
                className="saas-input leading-relaxed text-xs"
              />
            </div>

            {(isGuide || isAdmin) && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="saas-btn-primary px-6 py-2.5 text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Publishing Review...' : `Save & Publish ${reviewType}`}</span>
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};
