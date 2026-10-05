import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'Approved':
      case 'Completed':
      case 'Excellent':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Submitted':
      case 'Under Review':
      case 'Scheduled':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Revision Required':
      case 'Needs Significant Improvement':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Minor Corrections':
      case 'Good - Minor Changes':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status || 'Pending'}
    </span>
  );
};

export const CategoryBadge = ({ category }) => {
  const getStyles = () => {
    switch (category) {
      case 'Research Quality':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Writing Quality':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Technical Quality':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Conference Readiness':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Presentation Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${getStyles()}`}
    >
      {category}
    </span>
  );
};
