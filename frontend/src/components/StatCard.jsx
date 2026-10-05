import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, trend }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-card hover:border-slate-300 transition-all duration-150">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          {trend && (
            <span className="inline-flex items-center text-xs font-medium text-emerald-600 mt-1">
              {trend}
            </span>
          )}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 shrink-0">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>
        )}
      </div>
    </div>
  );
};
