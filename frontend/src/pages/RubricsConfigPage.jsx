import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { CategoryBadge } from '../components/Badge';
import { BookOpen, Presentation, CheckCircle, FolderOpen } from 'lucide-react';

export const RubricsConfigPage = () => {
  const [paperParams, setPaperParams] = useState([]);
  const [presParams, setPresParams] = useState([]);
  const [activeTab, setActiveTab] = useState('paper');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        setLoading(true);
        const [paperRes, presRes] = await Promise.all([
          api.get('/evaluations/parameters?isPresentation=false'),
          api.get('/evaluations/parameters?isPresentation=true'),
        ]);

        if (paperRes.data.success) setPaperParams(paperRes.data.data);
        if (presRes.data.success) setPresParams(presRes.data.data);
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };
    fetchParams();
  }, []);

  const currentList = activeTab === 'paper' ? paperParams : presParams;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
            Institutional Rubrics
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
          IEEE Conference Paper & Presentation Evaluation Matrix
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Standard institutional scoring criteria (26 IEEE paper parameters and 12 presentation defense parameters).
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('paper')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'paper'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>IEEE Paper Rubric ({paperParams.length} Parameters)</span>
        </button>

        <button
          onClick={() => setActiveTab('presentation')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'presentation'
              ? 'bg-slate-900 text-white shadow-subtle'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Presentation className="w-4 h-4" />
          <span>Presentation Review Rubric ({presParams.length} Parameters)</span>
        </button>
      </div>

      {/* Table */}
      <div className="saas-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th className="w-12 text-center">#</th>
                <th>Parameter Name</th>
                <th>Category</th>
                <th>Evaluation Scope & Guidelines</th>
                <th className="text-center">Max Marks</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">No evaluation parameters configured</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentList.map((p, idx) => (
                  <tr key={p._id}>
                    <td className="text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="font-semibold text-slate-900 text-xs">{p.name}</td>
                    <td>
                      <CategoryBadge category={p.category} />
                    </td>
                    <td className="text-slate-600 max-w-md text-xs">{p.description}</td>
                    <td className="text-center font-bold text-slate-900 text-xs">
                      {p.maxMarks} Marks
                    </td>
                    <td className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
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
