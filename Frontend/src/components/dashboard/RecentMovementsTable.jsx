import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, ExternalLink, MapPin, User as UserIcon } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import EmptyState from '../EmptyState';

export const RecentMovementsTable = ({ movements = [], formatDate }) => {
  const getMovementTypeBadge = (type) => {
    switch (type) {
      case 'AUTOMATIC_SCAN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            AUTO SCAN
          </span>
        );
      case 'ADMIN_CORRECTION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-800/60">
            ADMIN CORRECTION
          </span>
        );
      case 'MANUAL':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            MANUAL
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
      {/* Header with Animated Link */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-900">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Movements</h2>
            <p className="text-xs text-slate-400">Live feed of sample workflow progressions</p>
          </div>
        </div>

        {/* View All Movement Logs Link */}
        <Link
          to="/movements"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center transition-colors group relative w-fit"
        >
          <span className="relative py-0.5">
            View all movement logs
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400 transition-all duration-250 ease-out group-hover:w-full" />
          </span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform duration-200" />
        </Link>
      </div>

      {movements && movements.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Sample Code</th>
                <th className="p-3.5">From</th>
                <th className="p-3.5">To</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5">Movement Type</th>
                <th className="p-3.5 pr-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {movements.map((m, idx) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-800/50 transition-colors duration-150 animate-in fade-in slide-in-from-top-1"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Sample Code */}
                  <td className="p-3.5 pl-5">
                    <Link
                      to={`/samples/${m.sample_id}`}
                      className="font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center"
                    >
                      <span>{m.sample_code}</span>
                      <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                    </Link>
                    <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                      {m.sample_name}
                    </div>
                  </td>

                  {/* From Stage */}
                  <td className="p-3.5">
                    {m.from_stage ? (
                      <StatusBadge stageName={m.from_stage} />
                    ) : (
                      <span className="text-slate-500 text-xs italic">Initial Creation</span>
                    )}
                  </td>

                  {/* To Stage */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5">
                      <StatusBadge stageName={m.to_stage} />
                    </div>
                    {m.to_location && (
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center">
                        <MapPin className="h-2.5 w-2.5 mr-0.5 text-slate-500" />
                        <span>{m.to_location}</span>
                      </div>
                    )}
                  </td>

                  {/* Technician */}
                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5 font-medium text-slate-300">
                      <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{m.technician_username}</span>
                    </div>
                  </td>

                  {/* Movement Type */}
                  <td className="p-3.5">
                    {getMovementTypeBadge(m.movement_type)}
                  </td>

                  {/* Date */}
                  <td className="p-3.5 pr-5 text-right font-medium text-slate-400 whitespace-nowrap">
                    <span>{formatDate(m.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <EmptyState
            title="No Movements Recorded Yet"
            description="Use the USB Barcode Scanner or Manual Movement form to log stage transitions."
          />
        </div>
      )}
    </div>
  );
};

export default RecentMovementsTable;
