import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getFileUrl } from '../api/api';
import { StatusBadge, CategoryBadge } from '../components/Badge';
import {
  Award,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

export const EvaluationPage = () => {
  const { submissionId } = useParams();
  const { isGuide, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [submissionsList, setSubmissionsList] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(submissionId || '');
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [scores, setScores] = useState({});
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [overallVerdict, setOverallVerdict] = useState('Revision Required');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Load all submissions for dropdown & all parameters
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [subsRes, paramsRes] = await Promise.all([
          api.get('/submissions'),
          api.get('/evaluations/parameters?isPresentation=false'),
        ]);

        if (subsRes.data.success) {
          setSubmissionsList(subsRes.data.data);
          if (!selectedSubId && subsRes.data.data.length > 0) {
            setSelectedSubId(subsRes.data.data[0]._id);
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

  // When selected submission changes, load submission & any existing evaluation
  useEffect(() => {
    if (!selectedSubId) return;

    const loadSubAndEval = async () => {
      try {
        const [subRes, evalRes] = await Promise.all([
          api.get(`/submissions/${selectedSubId}`),
          api.get(`/evaluations?submissionId=${selectedSubId}`),
        ]);

        if (subRes.data.success) {
          setCurrentSubmission(subRes.data.data);
        }

        if (evalRes.data.success && evalRes.data.data.length > 0) {
          const existingEval = evalRes.data.data[0];
          const mappedScores = {};
          existingEval.scores.forEach((s) => {
            mappedScores[s.parameter || s.paramName] = {
              marks: s.marks,
              remarks: s.remarks,
              suggestion: s.suggestion,
            };
          });
          setScores(mappedScores);
          setStrengths(existingEval.strengths || '');
          setWeaknesses(existingEval.weaknesses || '');
          setSuggestions(existingEval.suggestions || '');
          setOverallVerdict(existingEval.overallVerdict || 'Revision Required');
        } else {
          // Initialize default scores
          const defaultScores = {};
          parameters.forEach((p) => {
            defaultScores[p._id] = { marks: 8, remarks: '', suggestion: '' };
          });
          setScores(defaultScores);
          setStrengths('');
          setWeaknesses('');
          setSuggestions('');
          setOverallVerdict('Revision Required');
        }
      } catch (err) {
        // Silently catch
      }
    };

    if (parameters.length > 0) {
      loadSubAndEval();
    }
  }, [selectedSubId, parameters]);

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

  // Compute live score
  const totalMarks = parameters.reduce((sum, p) => {
    const val = scores[p._id]?.marks;
    return sum + (val !== undefined ? Number(val) : 8);
  }, 0);
  const maxMarks = parameters.length * 10;
  const livePercentage = maxMarks > 0 ? Number(((totalMarks / maxMarks) * 100).toFixed(1)) : 0;

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formattedScores = parameters.map((p) => ({
        parameter: p._id,
        paramName: p.name,
        category: p.category,
        marks: scores[p._id]?.marks !== undefined ? scores[p._id].marks : 8,
        maxMarks: 10,
        remarks: scores[p._id]?.remarks || '',
        suggestion: scores[p._id]?.suggestion || '',
      }));

      const res = await api.post('/evaluations', {
        submissionId: selectedSubId,
        scores: formattedScores,
        strengths,
        weaknesses,
        suggestions,
        overallVerdict,
      });

      if (res.data.success) {
        alert(`Evaluation successfully published! Final Score: ${livePercentage}% (${overallVerdict})`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSaving(false);
    }
  };

  const categories = ['All', 'Research Quality', 'Writing Quality', 'Technical Quality', 'Conference Readiness'];
  const filteredParameters = parameters.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
                Evaluation Workspace
              </span>
              <span className="text-xs text-slate-500 font-medium">Standard 26-Parameter Matrix</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              IEEE Conference Paper Evaluation
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Score academic draft submissions based on research rigor, technical novelty, writing clarity, and IEEE format compliance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="saas-btn-secondary py-1.5 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {submissionsList.length === 0 ? (
        <div className="saas-card p-12 text-center bg-white border border-slate-200">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No paper submissions available</p>
          <p className="text-xs text-slate-500 mt-0.5">When students upload paper drafts, they will be listed here for evaluation.</p>
        </div>
      ) : (
        <>
          {/* Submission Selector & Overview Card */}
          <div className="saas-card p-5 bg-white border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Select Submission:</span>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="saas-select font-medium text-xs max-w-md"
                >
                  {submissionsList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.team?.teamName || 'Team'} - {s.versionLabel}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {currentSubmission && (
                <div className="flex items-center gap-2">
                  <StatusBadge status={currentSubmission.status} />
                  {currentSubmission.fileUrl && (
                    <a
                      href={getFileUrl(currentSubmission.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Document</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {currentSubmission && (
              <div className="space-y-2 text-xs">
                <h3 className="text-sm font-bold text-slate-900">{currentSubmission.title}</h3>
                {currentSubmission.abstract && (
                  <p className="text-slate-600 italic bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    "{currentSubmission.abstract}"
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] pt-1">
                  <span>Team: <strong className="text-slate-800">{currentSubmission.team?.teamName}</strong></span>
                  <span>Supervisor: <strong className="text-slate-800">{currentSubmission.team?.guide?.name || 'Unassigned'}</strong></span>
                  <span>Submitted: {new Date(currentSubmission.submittedAt).toLocaleDateString()}</span>
                  <span>Version: <strong>{currentSubmission.versionLabel}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Evaluation Form Workspace */}
          <form onSubmit={handleSubmitEvaluation} className="space-y-6">
            {/* Live Score Sticky Top Ribbon */}
            <div className="saas-card p-4 bg-slate-900 text-white shadow-elevated flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Live Weighted Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{livePercentage}%</span>
                    <span className="text-xs text-slate-400">({totalMarks} / {maxMarks} Marks)</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-slate-700 hidden sm:block" />

                <div className="hidden sm:block">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evaluation Verdict</span>
                  <div>
                    <select
                      value={overallVerdict}
                      onChange={(e) => setOverallVerdict(e.target.value)}
                      disabled={!isGuide && !isAdmin}
                      className="mt-0.5 bg-slate-800 border border-slate-700 rounded text-xs px-2.5 py-1 text-white font-semibold focus:outline-none"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Revision Required">Revision Required</option>
                      <option value="Needs Significant Improvement">Needs Significant Improvement</option>
                      <option value="Minor Corrections">Minor Corrections</option>
                    </select>
                  </div>
                </div>
              </div>

              {(isGuide || isAdmin) && (
                <button
                  type="submit"
                  disabled={saving}
                  className="saas-btn-primary bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Publish Evaluation'}</span>
                </button>
              )}
            </div>

            {/* Rubrics Parameters Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-subtle'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat} {cat !== 'All' && `(${parameters.filter((p) => p.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Parameters Scoring Table */}
            <div className="saas-card overflow-hidden bg-white">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th className="w-12 text-center">#</th>
                    <th>Parameter & Scope</th>
                    <th>Category</th>
                    <th className="w-32 text-center">Marks (0-10)</th>
                    <th>Evaluator Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParameters.map((p, idx) => {
                    const currentMarks = scores[p._id]?.marks !== undefined ? scores[p._id].marks : 8;
                    const currentRemarks = scores[p._id]?.remarks || '';

                    return (
                      <tr key={p._id}>
                        <td className="text-center font-bold text-slate-400">{idx + 1}</td>
                        <td>
                          <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                          <p className="text-[11px] text-slate-500">{p.description}</p>
                        </td>
                        <td>
                          <CategoryBadge category={p.category} />
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
                            placeholder="Add constructive notes..."
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

            {/* Qualitative Feedback Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="saas-card p-5 bg-white space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Identified Strengths & Original Contributions
                </label>
                <textarea
                  rows={4}
                  disabled={!isGuide && !isAdmin}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Note specific strengths in methodology, experimental metrics, novelty..."
                  className="saas-input leading-relaxed text-xs"
                />
              </div>

              <div className="saas-card p-5 bg-white space-y-2">
                <label className="block text-xs font-semibold text-slate-800">
                  Critical Weaknesses & Missing Elements
                </label>
                <textarea
                  rows={4}
                  disabled={!isGuide && !isAdmin}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="Point out gaps in baseline benchmarks, formatting issues, literature survey..."
                  className="saas-input leading-relaxed text-xs"
                />
              </div>
            </div>

            <div className="saas-card p-5 bg-white space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Actionable Revision Suggestions for Next Version
              </label>
              <textarea
                rows={3}
                disabled={!isGuide && !isAdmin}
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                placeholder="Explicit recommendations for the student team before subsequent upload..."
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
                  <span>{saving ? 'Publishing Evaluation...' : 'Save & Publish Evaluation'}</span>
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};
