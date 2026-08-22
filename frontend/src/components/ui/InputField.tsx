import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; id: string; error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
    <input
      id={id}
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={!!error}
      className={`rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed
        ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
      {...props}
    />
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>}
  </div>
);
export default InputField;
