import React, { useState, useEffect } from 'react';
import api, { getFileUrl } from '../api/api';
import { StatusBadge } from '../components/Badge';
import { FileText, ExternalLink, Calendar, Award, Search, Filter, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SubmissionsListPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();
  const { isGuide, isAdmin } = useAuth();

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/submissions');
        if (res.data.success) {
          setSubmissions(res.data.data);
        }
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const filtered = submissions.filter((s) => {
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    const matchesSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.team?.teamName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
            Repository
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
          IEEE Paper Submissions & Version Archive
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore complete iteration histories, review uploaded documents, and access evaluation reports.
        </p>
      </div>

      {/* Filters */}
      <div className="saas-card p-4 bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Filter:</span>
          {['All', 'Submitted', 'Under Review', 'Approved', 'Revision Required'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-subtle'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search papers or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-input pl-8 py-1.5"
          />
        </div>
      </div>

      {/* Submissions Grid */}
      {filtered.length === 0 ? (
        <div className="saas-card p-12 text-center bg-white border border-slate-200">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No submissions found</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {search || statusFilter !== 'All' ? 'Try adjusting your filters' : 'Uploaded drafts will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((sub) => (
            <div
              key={sub._id}
              className="saas-card p-5 bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs">
                      {sub.team?.teamName || 'Team'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-xs border border-sky-200">
                      {sub.versionLabel}
                    </span>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>

                <h3 className="font-semibold text-slate-900 text-sm mt-2">{sub.title}</h3>

                {sub.abstract && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {sub.abstract}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Submitted by: {sub.submittedBy?.name || 'Student'}</span>
                </div>
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
                      <span>Download PDF</span>
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
                  <span>{isGuide || isAdmin ? 'Evaluate / View' : 'View Report'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
