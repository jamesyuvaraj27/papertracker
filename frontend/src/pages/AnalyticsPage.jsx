import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { StatCard } from '../components/StatCard';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Users,
  Award,
  Clock,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        // Silently catch
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
            Institutional Analytics
          </span>
          <span className="text-xs text-slate-500 font-medium">Session 2026-2027</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
          Academic Research & Review Analytics Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics across paper versions, category rubric scores, status breakdowns, and faculty guide workloads.
        </p>
      </div>

      {/* KPI Stats */}
      {data?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Teams"
            value={data.summary.totalTeams}
            subtitle="Registered Project Teams"
            icon={Users}
          />
          <StatCard
            title="Paper Submissions"
            value={data.summary.totalSubmissions}
            subtitle="Draft versions logged"
            icon={TrendingUp}
          />
          <StatCard
            title="Paper Evaluations"
            value={data.summary.totalEvaluations}
            subtitle="IEEE rubric reviews"
            icon={Award}
          />
          <StatCard
            title="Presentation Reviews"
            value={data.summary.totalPresentations}
            subtitle="Milestones evaluated"
            icon={CheckCircle2}
          />
        </div>
      )}

      {/* Charts Row 1: Line Progression + Category Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Score Improvement Trend */}
        <div className="saas-card p-6 bg-white border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>Score Progression by Version (V1 → V2 → V3)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Average, highest, and lowest scores as student drafts iterate</p>
          </div>

          <div className="h-64 w-full">
            {data?.versionTrendData && data.versionTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.versionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="version" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" name="Average Score %" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="highestScore" name="Top Score %" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <FolderOpen className="w-6 h-6 mb-1 text-slate-300" />
                <span>No version score trends available yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Strength Radar */}
        <div className="saas-card p-6 bg-white border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <span>IEEE Rubric Category Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Performance breakdown across 4 core academic criteria</p>
          </div>

          <div className="h-64 w-full">
            {data?.categoryRadarData && data.categoryRadarData.some((c) => c.score > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data.categoryRadarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Category Score" dataKey="score" stroke="#0284c7" fill="#38bdf8" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <FolderOpen className="w-6 h-6 mb-1 text-slate-300" />
                <span>No evaluation category scores available yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Status Pie Chart + Guide Review Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie */}
        <div className="saas-card p-6 bg-white border border-slate-200 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-700" />
              <span>Paper Status Distribution</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Current review status of submitted papers</p>
          </div>

          <div className="h-56 w-full">
            {data?.submissionStatusPie && data.submissionStatusPie.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.submissionStatusPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data.submissionStatusPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <span>No submission status data</span>
              </div>
            )}
          </div>
        </div>

        {/* Supervisor Performance & Workload Table */}
        <div className="lg:col-span-2 saas-card overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Faculty Supervisor Review Workload</h3>
            <p className="text-xs text-slate-500">Track review throughput and pending evaluations across guides</p>
          </div>

          <div className="overflow-x-auto">
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Faculty Guide</th>
                  <th>Department</th>
                  <th className="text-center">Assigned Teams</th>
                  <th className="text-center">Total Drafts</th>
                  <th className="text-center">Completed</th>
                  <th className="text-center">Pending</th>
                </tr>
              </thead>
              <tbody>
                {!data?.guidePerformance || data.guidePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                      No faculty guide workload data available
                    </td>
                  </tr>
                ) : (
                  data.guidePerformance.map((g, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold text-slate-900">{g.guideName}</td>
                      <td className="text-slate-600 text-xs">{g.department}</td>
                      <td className="text-center font-bold text-slate-900">{g.assignedTeams}</td>
                      <td className="text-center text-slate-700">{g.totalSubmissions}</td>
                      <td className="text-center font-semibold text-emerald-600">{g.completedReviews}</td>
                      <td className="text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            g.pendingReviews > 0
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {g.pendingReviews}
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
    </div>
  );
};
