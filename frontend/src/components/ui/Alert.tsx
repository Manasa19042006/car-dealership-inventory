import React from 'react';

interface AlertProps { type: 'error' | 'success' | 'info' | 'warning'; message: string; className?: string; }

const styles = {
  error:   'bg-red-50 border-red-300 text-red-700',
  success: 'bg-green-50 border-green-300 text-green-700',
  info:    'bg-blue-50 border-blue-300 text-blue-700',
  warning: 'bg-amber-50 border-amber-300 text-amber-700',
};
const icons = { error: '✕', success: '✓', info: 'ℹ', warning: '⚠' };

const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => (
  <div role="alert" className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${styles[type]} ${className}`}>
    <span aria-hidden="true" className="mt-0.5 font-bold">{icons[type]}</span>
    <span>{message}</span>
  </div>
);
export default Alert;
