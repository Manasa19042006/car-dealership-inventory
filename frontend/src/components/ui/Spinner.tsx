import React from 'react';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; }
const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-4' };

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block rounded-full border-current border-t-transparent animate-spin ${sizes[size]} ${className}`}
  />
);
export default Spinner;
