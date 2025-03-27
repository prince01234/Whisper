import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Reusable button component with different variants
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant (primary, secondary, outline, ghost, danger)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.isLoading - Whether button is in loading state
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.leftIcon - Icon to display on the left
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}) => {
  // Base styles always applied
  let buttonClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white focus:ring-violet-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white focus:ring-gray-500',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white focus:ring-gray-500',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  // Disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  buttonClasses = `${buttonClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled || isLoading ? disabledClasses : ''} ${widthClass} ${className}`;
  
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...props}
    >
      {isLoading && (
        <Loader className="w-4 h-4 mr-2 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;