import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, MapPin, Tag } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import EmptyState from '../EmptyState';

export const RecentSamplesTable = ({ samples = [], formatDate }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
      {/* Header with Animated Link */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-900">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Samples</h2>
            <p className="text-xs text-slate-400">Recently registered laboratory specimens</p>
          </div>
        </div>

        <Link
          to="/samples"
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center transition-colors group relative w-fit"
        >
          <span className="relative py-0.5">
            View all samples directory
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400 transition-all duration-250 ease-out group-hover:w-full" />
          </span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1.5 transition-transform duration-200" />
        </Link>
      </div>

      {samples && samples.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">Sample Code</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Current Stage</th>
                <th className="p-3.5">Current Location</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {samples.map((s, idx) => (
                <tr
                  key={s.id}
                  className="hover:bg-slate-800/50 transition-colors duration-150 animate-in fade-in slide-in-from-top-1"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Sample Code */}
                  <td className="p-3.5 pl-5 font-mono font-bold text-indigo-400">
                    <Link
                      to={`/samples/${s.id}`}
                      className="hover:underline inline-flex items-center"
                    >
                      <span>{s.sample_code}</span>
                    </Link>
                  </td>

                  {/* Project */}
                  <td className="p-3.5 text-slate-300 max-w-[180px] truncate">
                    {s.project || '—'}
                  </td>

                  {/* Name */}
                  <td className="p-3.5 font-medium text-slate-200 max-w-[180px] truncate">
                    {s.name}
                  </td>

                  {/* Current Stage */}
                  <td className="p-3.5">
                    <StatusBadge stageName={s.current_stage} />
                  </td>

                  {/* Current Location */}
                  <td className="p-3.5 text-slate-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{s.current_location}</span>
                    </div>
                  </td>

                  {/* Registered Date */}
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    <span>{formatDate(s.created_at)}</span>
                  </td>

                  {/* Action */}
                  <td className="p-3.5 pr-5 text-right">
                    <Link
                      to={`/samples/${s.id}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all inline-flex items-center text-xs"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-3 w-3 ml-1 text-indigo-400" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center">
          <EmptyState
            title="No Specimens Registered Yet"
            description="Use the Sidebar navigation to register your first laboratory specimen."
          />
        </div>
      )}
    </div>
  );
};

export default RecentSamplesTable;
