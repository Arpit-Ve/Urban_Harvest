import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const StatusMessage = ({ type, message }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 fade-in ${
      isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
    }`}>
      {isError ? <AlertCircle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default StatusMessage;
