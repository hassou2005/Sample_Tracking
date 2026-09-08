import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message = 'An error occurred while communicating with the server.', onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 flex items-start space-x-3">
      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm text-red-800 font-medium">
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-bold text-red-700 hover:text-red-900 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
