import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Calendar, Plus, CheckCircle, FolderOpen } from 'lucide-react';
import { Modal } from '../components/Modal';

export const AcademicYearsPage = () => {
  const [years, setYears] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [yearInput, setYearInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const res = await api.get('/academic-years');
      if (res.data.success) {
        setYears(res.data.data);
      }
    } catch (err) {
      // Silently catch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!yearInput.trim()) return;

    try {
      const res = await api.post('/academic-years', {
        year: yearInput.trim(),
        label: labelInput.trim() || `Academic Session ${yearInput.trim()}`,
        isActive,
      });
      if (res.data.success) {
        setIsOpen(false);
        setYearInput('');
        setLabelInput('');
        setIsActive(false);
        fetchYears();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add academic session');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="saas-card p-6 bg-white border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200">
                Academic Management
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Academic Sessions & Cohorts
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure academic project batches and specify active review cycles.
            </p>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="saas-btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {years.length === 0 ? (
        <div className="saas-card p-12 text-center bg-white border border-slate-200">
          <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700">No academic sessions found</p>
          <p className="text-xs text-slate-500 mt-0.5">Click 'Add Session' to configure an academic cycle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {years.map((y) => (
            <div
              key={y._id}
              className={`saas-card p-5 bg-white border flex items-center justify-between transition ${
                y.isActive
                  ? 'border-sky-300 ring-1 ring-sky-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">{y.year}</h3>
                  {y.isActive && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                      Active Session
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{y.label || `Batch ${y.year}`}</p>
              </div>

              <div className="text-right text-xs text-slate-400">
                <span className="block text-[10px] text-slate-400">Created</span>
                <span className="font-medium text-slate-600">
                  {new Date(y.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Academic Session"
        subtitle="Create a new cohort cycle for student paper evaluations"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              required
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              placeholder="e.g. 2027-2028"
              className="saas-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Session Label (Optional)</label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="e.g. Academic Batch 2027-2028"
              className="saas-input"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <label htmlFor="isActiveCheck" className="text-slate-700 font-medium cursor-pointer">
              Set as current active academic session
            </label>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="saas-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="saas-btn-primary"
            >
              Save Session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
