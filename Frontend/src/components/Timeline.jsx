import React from 'react';
import { Clock, User, Tag, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const Timeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400">
        No movement history recorded yet.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-emerald-200 ml-4 space-y-6 my-4">
      {history.map((item, idx) => (
        <div key={item.id || idx} className="relative pl-6 group">
          {/* Timeline Dot */}
          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-emerald-600 group-hover:scale-110 transition-transform" />

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                {item.from_stage ? (
                  <>
                    <StatusBadge stageName={item.from_stage.name} />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    <StatusBadge stageName={item.to_stage.name} />
                  </>
                ) : (
                  <StatusBadge stageName={item.to_stage.name} />
                )}
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                item.movement_type === 'ADMIN_CORRECTION'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : item.movement_type === 'AUTOMATIC_SCAN'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {item.movement_type}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
              <div className="flex items-center space-x-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span>Zone: <strong className="text-slate-800">{item.to_location?.name || 'Unknown'}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Operator: <strong className="text-slate-800">{item.technician_username || 'System'}</strong></span>
              </div>
            </div>

            {item.comment && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2 text-xs text-slate-600 italic mb-2">
                "{item.comment}"
              </div>
            )}

            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              <span>{new Date(item.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
