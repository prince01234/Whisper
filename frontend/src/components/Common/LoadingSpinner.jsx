import React from 'react';

/**
 * Reusable loading spinner component
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner (sm, md, lg)
 * @param {string} props.color - Color of the spinner (default: violet)
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'violet',
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };
  
  // Color classes
  const colorClasses = {
    violet: 'border-violet-600',
    blue: 'border-blue-500',  // Add blue option
    gray: 'border-gray-600',
    white: 'border-white'
  };
  
  return (
    <div 
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color] || 'border-violet-600'} // Provide fallback if color isn't found
        rounded-full animate-spin
        border-t-transparent
        ${className}
      `}
      role="status"
      aria-label="Loading"
    ></div>
  );
};

export default LoadingSpinner;