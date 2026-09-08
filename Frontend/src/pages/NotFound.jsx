import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl mb-4">
        <FileQuestion className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-1">Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        The requested laboratory view or record does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center shadow-xs transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFound;

