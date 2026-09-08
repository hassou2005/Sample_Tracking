import React from 'react';

const STAGE_STYLES = {
  RECEPTION: 'bg-blue-950/80 text-blue-300 border-blue-800/80 shadow-xs shadow-blue-500/10',
  OVEN: 'bg-amber-950/80 text-amber-300 border-amber-800/80 shadow-xs shadow-amber-500/10',
  ANALYSIS: 'bg-purple-950/80 text-purple-300 border-purple-800/80 shadow-xs shadow-purple-500/10',
  STORAGE: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80 shadow-xs shadow-emerald-500/10',
};

export const StatusBadge = ({ stageName, className = '' }) => {
  const normalized = stageName ? stageName.toUpperCase() : 'RECEPTION';
  const style = STAGE_STYLES[normalized] || 'bg-slate-900 text-slate-300 border-slate-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${style} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {stageName || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
