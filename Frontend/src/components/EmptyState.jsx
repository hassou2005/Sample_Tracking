import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No records found', description = 'There are no matching entries available at this time.', action }) => {
  return (
    <div className="text-center py-12 px-4 bg-white border border-slate-200 rounded-xl my-4">
      <div className="bg-slate-100 text-slate-400 p-3 rounded-full w-fit mx-auto mb-3">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
