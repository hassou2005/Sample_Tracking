import React from 'react';
import AnimatedNumber from './AnimatedNumber';

const THEMES = {
  indigo: {
    border: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
    title: 'text-slate-400',
    iconBg: 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60',
    val: 'text-white',
    subVal: 'text-indigo-400',
  },
  blue: {
    border: 'border-blue-800/60 hover:border-blue-500/60 hover:shadow-blue-500/10',
    title: 'text-blue-400',
    iconBg: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    val: 'text-blue-400',
    subVal: 'text-blue-300',
  },
  amber: {
    border: 'border-amber-800/60 hover:border-amber-500/60 hover:shadow-amber-500/10',
    title: 'text-amber-400',
    iconBg: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    val: 'text-amber-400',
    subVal: 'text-amber-300',
  },
  purple: {
    border: 'border-purple-800/60 hover:border-purple-500/60 hover:shadow-purple-500/10',
    title: 'text-purple-400',
    iconBg: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
    val: 'text-purple-400',
    subVal: 'text-purple-300',
  },
  emerald: {
    border: 'border-emerald-800/60 hover:border-emerald-500/60 hover:shadow-emerald-500/10',
    title: 'text-emerald-400',
    iconBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    val: 'text-emerald-400',
    subVal: 'text-emerald-300',
  },
};

export const KPICard = ({
  label,
  value,
  icon: Icon,
  subtitle,
  percent,
  theme = 'indigo',
  delayMs = 0,
  isPulsing = false
}) => {
  const t = THEMES[theme] || THEMES.indigo;

  return (
    <div
      className={`p-5 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl ${t.border} hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group animate-in fade-in slide-in-from-bottom-4`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider ${t.title}`}>{label}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${t.iconBg} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className={`text-3xl md:text-4xl font-black ${t.val} tracking-tight transition-colors ${isPulsing ? 'text-indigo-400 animate-pulse' : ''}`}>
          <AnimatedNumber value={value} />
        </div>

        <div className="text-xs text-slate-400 font-medium mt-1">
          {percent !== undefined && percent !== null ? (
            <span>
              <span className={`font-bold ${t.subVal}`}>{percent}%</span> {subtitle}
            </span>
          ) : (
            subtitle
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
