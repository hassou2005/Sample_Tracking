import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading = ({ message = 'Loading laboratory data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default Loading;
