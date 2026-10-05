import React, { useState } from 'react';
import { Modal } from './Modal';
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import api from '../api/api';

export const AIAbstractModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;

    setLoading(true);
    try {
      const parsedKeywords = keywords ? keywords.split(',').map((k) => k.trim()) : [];
      const res = await api.post('/ai/analyze-abstract', {
        title,
        abstract,
        keywords: parsedKeywords,
      });
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err) {
      // Silently catch
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setAbstract('');
    setKeywords('');
    setResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Abstract Reviewer & IEEE Format Validator"
      subtitle="Analyze abstract structure, detect research methodology clarity, and check IEEE compliance"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <form onSubmit={handleAnalyze} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paper / Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scalable Multi-Agent Consensus for Autonomous Edge Networks"
              required
              className="saas-input"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Abstract Text</label>
              <span className="text-[11px] text-slate-500">
                Word Count: {abstract.trim() ? abstract.trim().split(/\s+/).length : 0} (Recommended: 150–250)
              </span>
            </div>
            <textarea
              rows={4}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Paste the abstract draft here for structural IEEE compliance analysis..."
              required
              className="saas-input leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Keywords (Comma-separated)</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Multi-Agent Systems, Edge Computing, Consensus Protocol"
              className="saas-input"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Clear Inputs
            </button>

            <button
              type="submit"
              disabled={loading || !title.trim() || !abstract.trim()}
              className="saas-btn-primary"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Abstract...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze with AI</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Result View */}
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Evaluation Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-extrabold text-slate-900">{result.overallScore}%</span>
                  <span className="text-xs text-slate-500">Readiness:</span>
                  <span className="text-xs font-bold text-sky-700">{result.predictedReadiness}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {result.ieeeChecklist.map((c, i) => (
                  <div
                    key={i}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 ${
                      c.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {c.passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{c.item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <h4 className="font-semibold text-emerald-700 flex items-center gap-1.5 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Detected Strengths</span>
                </h4>
                <ul className="space-y-1 text-slate-600">
                  {result.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <h4 className="font-semibold text-amber-700 flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Recommendations</span>
                </h4>
                <ul className="space-y-1 text-slate-600">
                  {result.recommendations.length === 0 ? (
                    <li>• Abstract is well-balanced and meets IEEE formatting guidelines.</li>
                  ) : (
                    result.recommendations.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
