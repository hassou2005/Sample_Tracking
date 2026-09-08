import React from 'react';
import { FlaskConical, Flame, Microscope, Archive } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

export const WorkflowPipeline = ({
  total,
  receptionCount,
  ovenCount,
  analysisCount,
  storageCount,
  isPulsing = false
}) => {
  const calcPercent = (count) => (total > 0 ? Math.round((count / total) * 100) : 0);

  const stages = [
    {
      id: 'reception',
      name: '1. RECEPTION',
      count: receptionCount,
      percent: calcPercent(receptionCount),
      icon: FlaskConical,
      barBg: 'bg-blue-500',
      cardBg: 'bg-blue-950/40 border border-blue-500/40 text-blue-300 shadow-lg shadow-blue-500/10 hover:border-blue-400 hover:shadow-blue-500/20',
      titleColor: 'text-blue-400',
      subColor: 'text-blue-300/80',
    },
    {
      id: 'oven',
      name: '2. OVEN',
      count: ovenCount,
      percent: calcPercent(ovenCount),
      icon: Flame,
      barBg: 'bg-amber-500',
      cardBg: 'bg-amber-950/40 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/10 hover:border-amber-400 hover:shadow-amber-500/20',
      titleColor: 'text-amber-400',
      subColor: 'text-amber-300/80',
    },
    {
      id: 'analysis',
      name: '3. ANALYSIS',
      count: analysisCount,
      percent: calcPercent(analysisCount),
      icon: Microscope,
      barBg: 'bg-purple-500',
      cardBg: 'bg-purple-950/40 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/10 hover:border-purple-400 hover:shadow-purple-500/20',
      titleColor: 'text-purple-400',
      subColor: 'text-purple-300/80',
    },
    {
      id: 'storage',
      name: '4. STORAGE',
      count: storageCount,
      percent: calcPercent(storageCount),
      icon: Archive,
      barBg: 'bg-emerald-500',
      cardBg: 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10 hover:border-emerald-400 hover:shadow-emerald-500/20',
      titleColor: 'text-emerald-400',
      subColor: 'text-emerald-300/80',
    },
  ];

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300 delay-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Workflow Stage Pipeline
          </h2>
          <p className="text-lg font-bold text-white tracking-tight mt-0.5">
            Current Station Progression Distribution
          </p>
        </div>
        <div
          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
            isPulsing
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30 scale-105'
              : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}
        >
          ACTIVE INVENTORY: <span className="text-indigo-400 font-extrabold"><AnimatedNumber value={total} /></span>
        </div>
      </div>

      {/* Progress Bar Split by Stage */}
      <div className="h-3.5 w-full bg-slate-950 rounded-full overflow-hidden flex mb-5 border border-slate-800/80 shadow-inner">
        {stages.map((st) => (
          <div
            key={st.id}
            style={{ width: `${st.percent}%` }}
            className={`${st.barBg} transition-all duration-500`}
            title={`${st.name}: ${st.count} (${st.percent}%)`}
          />
        ))}
      </div>

      {/* 4-Stage Cards Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        {stages.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl transition-all duration-300 ${st.cardBg} hover:-translate-y-0.5`}
            >
              <div className={`flex items-center justify-between text-xs font-bold mb-1 ${st.titleColor}`}>
                <span>{st.name}</span>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-white">
                <AnimatedNumber value={st.count} />
              </div>
              <div className={`text-[11px] font-semibold ${st.subColor}`}>{st.percent}% of total</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowPipeline;
