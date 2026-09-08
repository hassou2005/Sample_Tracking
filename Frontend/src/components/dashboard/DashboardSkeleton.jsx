import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 pb-12 animate-pulse motion-reduce:animate-none">
      {/* Header Skeleton */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 bg-slate-800 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-800 rounded-md" />
            <div className="h-3 w-72 bg-slate-800/60 rounded-md" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-28 bg-slate-800/80 rounded-full" />
          <div className="h-9 w-9 bg-slate-800 rounded-xl" />
          <div className="h-9 w-28 bg-slate-800 rounded-xl" />
        </div>
      </div>

      {/* Row 1 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-800 rounded-md" />
              <div className="w-10 h-10 bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-slate-800 rounded-md" />
              <div className="h-3 w-32 bg-slate-800/60 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-slate-800 rounded-md" />
              <div className="w-10 h-10 bg-slate-800 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-16 bg-slate-800 rounded-md" />
              <div className="h-3 w-36 bg-slate-800/60 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Skeleton */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-44 bg-slate-800 rounded-md" />
          <div className="h-6 w-32 bg-slate-800 rounded-lg" />
        </div>
        <div className="h-3.5 w-full bg-slate-950 rounded-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4">
        <div className="h-4 w-36 bg-slate-800 rounded-md" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-950/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

