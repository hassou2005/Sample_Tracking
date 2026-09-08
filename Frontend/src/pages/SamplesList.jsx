import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListFilter, FilePlus2, Eye, Search, ExternalLink } from 'lucide-react';
import { sampleService } from '../services/sampleService';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

export const SamplesList = () => {
  const [samples, setSamples] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [stages, setStages] = useState([]);

  const loadData = async () => {
    try {
      const s = await sampleService.getWorkflowStages();
      setStages(s || []);
    } catch (e) {
      console.error('Failed to load workflow stages:', e);
    }
  };

  const fetchSamples = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit: 10,
        ...(q.trim() && { search: q.trim() }),
        ...(selectedStage && { stage_id: selectedStage }),
      };
      const res = await sampleService.getSamples(params);
      setSamples(res.items || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      setError('Failed to fetch sample registry directory from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchSamples();
  }, [page, selectedStage]);

  return (
    <div className="space-y-6 pb-12 relative text-slate-100 font-sans selection:bg-emerald-500 selection:text-white motion-reduce:animate-none">
      {/* Ambient Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-emerald-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* 1. Header Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 animate-in fade-in slide-in-from-top-3 duration-300">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-gradient-to-r from-emerald-600 to-violet-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 shrink-0">
            <ListFilter className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Samples <span className="text-emerald-400">Directory</span> ({total})
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Complete registry & active custody tracking of laboratory specimens
            </p>
          </div>
        </div>

        <Link
          to="/samples/new"
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center space-x-2 text-xs shrink-0 self-start sm:self-auto"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>New Sample</span>
        </Link>
      </div>

      {/* 2. Search & Filter Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          fetchSamples();
        }}
        className="bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-md rounded-2xl p-4 flex flex-wrap items-center gap-3 text-xs relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by barcode, sample name, or project..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl font-mono text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
        </div>

        <select
          value={selectedStage}
          onChange={(e) => {
            setSelectedStage(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="" className="bg-slate-900 text-white">All Stages</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id} className="bg-slate-900 text-white">
              {s.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <Search className="h-4 w-4" />
          <span>Search</span>
        </button>
      </form>

      {/* 3. Error Banner */}
      {error && <ErrorMessage message={error} />}

      {/* 4. Directory Table & Loading / Empty States */}
      {loading ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl text-center">
          <Loading message="Loading sample directory registry..." />
        </div>
      ) : samples.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
          <EmptyState
            title="No Samples Found"
            description="No specimens match your search query or filter selection."
          />
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md relative z-10 hover:border-emerald-500/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 font-mono font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 pl-5">Sample Code</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Specimen Name</th>
                  <th className="p-3.5">Workflow Stage</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {samples.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-800/50 animate-in fade-in slide-in-from-top-1"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* Sample Code */}
                    <td className="p-3.5 pl-5 font-mono font-bold text-emerald-400">
                      <Link
                        to={`/samples/${s.id}`}
                        className="hover:text-emerald-300 hover:underline inline-flex items-center"
                      >
                        <span>{s.sample_code}</span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                      </Link>
                    </td>

                    {/* Project */}
                    <td className="p-3.5 font-medium text-slate-300 max-w-[200px]">
                      <span
                        className="block truncate"
                        title={s.project || '—'}
                      >
                        {s.project || '—'}
                      </span>
                    </td>

                    {/* Specimen Name */}
                    <td className="p-3.5 font-medium text-slate-200">
                      {s.name || s.specimen_name || '—'}
                    </td>

                    {/* Stage Badge */}
                    <td className="p-3.5">
                      <StatusBadge stageName={s.current_stage?.name} />
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pr-5 text-right">
                      <Link
                        to={`/samples/${s.id}`}
                        className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1.5"
                      >
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Bar */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>
              Page <strong className="text-white font-mono">{page}</strong> of <strong className="text-white font-mono">{pages}</strong>
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
              >
                Prev
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamplesList;