import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { StatusBadge } from '../components/Badge';
import {
  Trophy,
  Download,
  Search,
  FolderOpen,
} from 'lucide-react';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let url = `/leaderboard?academicYear=${selectedYear}`;
      if (selectedDept !== 'All') {
        url += `&department=${encodeURIComponent(selectedDept)}`;
      }

      const [lbRes, yrsRes] = await Promise.all([
        api.get(url),
        api.get('/academic-years'),
      ]);

      if (lbRes.data.success) {
        setLeaderboard(lbRes.data.data);
      }
      if (yrsRes.data.success) {
        setAcademicYears(yrsRes.data.data);
      }
    } catch (err) {
      // Silently catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedYear, selectedDept]);

  const filteredList = leaderboard.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.teamName.toLowerCase().includes(q) ||
      item.projectTitle.toLowerCase().includes(q) ||
      (item.guide?.name || '').toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    const headers = ['Rank,Team Name,Project Title,Guide,Paper Score (70%),Presentation Score (30%),Final Score,Verdict\n'];
    const rows = filteredList.map(
      (t) => `"${t.rank}","${t.teamName}","${t.projectTitle.replace(/"/g, '""')}","${t.guide?.name || 'Unassigned'}","${t.paperScore}%","${t.presentationScore}%","${t.finalScore}%","${t.paperVerdict}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IEEE_Leaderboard_${selectedYear}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Academic Merit Standings</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">IEEE 70/30 Formula</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              College Project & Paper Leaderboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Transparent institutional rankings based on 70% IEEE paper evaluation + 30% semester presentation reviews.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredList.length === 0}
            className="saas-btn-secondary"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="saas-card p-4 bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Academic Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Session:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="saas-select py-1 text-xs"
            >
              {academicYears.length > 0 ? (
                academicYears.map((y) => (
                  <option key={y._id} value={y.year}>
                    {y.label || y.year}
                  </option>
                ))
              ) : (
                <option value="2026-2027">2026-2027</option>
              )}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="saas-select py-1 text-xs"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science and Engineering">Computer Science (CSE)</option>
              <option value="Information Technology">Information Technology (IT)</option>
              <option value="Electronics and Communication">Electronics (ECE)</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teams, projects, guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="saas-input pl-8 py-1.5"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="saas-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="saas-table">
            <thead>
              <tr>
                <th className="w-16 text-center">Rank</th>
                <th>Team & Project Title</th>
                <th>Guide</th>
                <th>Department</th>
                <th>Paper (70%)</th>
                <th>Defense (30%)</th>
                <th>Final Score</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="w-8 h-8 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">No leaderboard entries found</p>
                      <p className="text-xs text-slate-500">Rankings will be calculated as teams receive paper and presentation evaluations.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((entry) => {
                  const isFirst = entry.rank === 1;
                  const isSecond = entry.rank === 2;
                  const isThird = entry.rank === 3;

                  return (
                    <tr key={entry.teamId}>
                      <td className="text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            isFirst
                              ? 'bg-amber-100 text-amber-800'
                              : isSecond
                              ? 'bg-slate-200 text-slate-800'
                              : isThird
                              ? 'bg-amber-50 text-amber-700'
                              : 'text-slate-500 font-semibold'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td>
                        <p className="font-semibold text-slate-900">{entry.teamName}</p>
                        <p className="text-xs text-slate-500 max-w-sm truncate">{entry.projectTitle}</p>
                      </td>
                      <td>
                        <span className="font-medium text-slate-800">{entry.guide?.name || 'Unassigned'}</span>
                      </td>
                      <td className="text-slate-600 text-xs">{entry.department}</td>
                      <td>
                        <span className="font-medium text-slate-800">{entry.paperScore}%</span>
                        <p className="text-[10px] text-slate-400">{entry.latestVersion}</p>
                      </td>
                      <td>
                        <span className="font-medium text-slate-800">{entry.presentationScore}%</span>
                        <p className="text-[10px] text-slate-400">{entry.presentationReviewsCount} Reviews</p>
                      </td>
                      <td>
                        <span className="text-base font-black text-slate-900">{entry.finalScore}%</span>
                      </td>
                      <td>
                        <StatusBadge status={entry.paperVerdict} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
