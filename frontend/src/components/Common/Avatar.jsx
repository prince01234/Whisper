import React from 'react';
import { User, Users } from 'lucide-react';

/**
 * Reusable avatar component for users and groups
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for the image
 * @param {string} props.fallback - Text to show when image is not available (initials)
 * @param {string} props.size - Size of the avatar (xs, sm, md, lg, xl)
 * @param {string} props.status - Online status (online, away, offline)
 * @param {boolean} props.isGroup - Whether this is a group avatar
 * @param {string} props.className - Additional CSS classes
 */
const Avatar = ({
  src = null,
  alt = 'User',
  fallback = '',
  size = 'md',
  status = null,
  isGroup = false,
  className = ''
}) => {
  // Determine size classes
  const sizeClasses = {
    'xs': 'w-6 h-6',
    'sm': 'w-8 h-8',
    'md': 'w-10 h-10',
    'lg': 'w-12 h-12',
    'xl': 'w-16 h-16'
  };
  
  // Determine font size for fallback initials
  const fontSizes = {
    'xs': 'text-xs',
    'sm': 'text-sm',
    'md': 'text-base',
    'lg': 'text-lg',
    'xl': 'text-xl'
  };
  
  // Generate initials from fallback text
  const getInitials = () => {
    if (!fallback || typeof fallback !== 'string') return '';
    
    const words = fallback.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) return '';
    
    if (words.length === 1) {
      return fallback.substring(0, 2).toUpperCase();
    }
    
    // Take first letter of first and last words
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };
  
  // Status indicator classes
  const statusClasses = {
    'online': 'bg-green-500',
    'away': 'bg-yellow-500',
    'offline': 'bg-gray-400'
  };
  
  // Safe status class - fall back to offline if status is not recognized
  const statusClass = status && statusClasses[status] ? statusClasses[status] : 'bg-gray-400';
  
  // Safe size class - fall back to medium if size is not recognized
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const fontSize = fontSizes[size] || fontSizes.md;
  
  // Icon sizing based on avatar size
  const getIconSize = () => {
    switch(size) {
      case 'xs': return 'w-3 h-3';
      case 'sm': return 'w-4 h-4';
      case 'md': return 'w-5 h-5';
      case 'lg': return 'w-6 h-6';
      case 'xl': return 'w-8 h-8';
      default: return 'w-5 h-5';
    }
  };
  
  // Status indicator sizing based on avatar size
  const getStatusSize = () => {
    switch(size) {
      case 'xs': return 'w-1.5 h-1.5';
      case 'sm': return 'w-2 h-2';
      case 'md': return 'w-2.5 h-2.5';
      case 'lg': return 'w-3 h-3';
      case 'xl': return 'w-4 h-4';
      default: return 'w-2.5 h-2.5';
    }
  };
  
  return (
    <div className={`relative inline-flex ${className}`}>
      {/* Avatar image or fallback */}
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className={`${sizeClass} rounded-full object-cover`}
          onError={(e) => {
            // If image fails to load, replace with fallback
            e.target.style.display = 'none';
            e.target.onerror = null; // Prevent infinite error loop
          }}
        />
      ) : (
        <div className={`${sizeClass} rounded-full flex items-center justify-center bg-violet-100 dark:bg-violet-900`}>
          {fallback ? (
            <span className={`${fontSize} font-medium text-violet-600 dark:text-violet-300`}>
              {getInitials()}
            </span>
          ) : (
            isGroup ? (
              <Users className={`${getIconSize()} text-violet-600 dark:text-violet-300`} />
            ) : (
              <User className={`${getIconSize()} text-violet-600 dark:text-violet-300`} />
            )
          )}
        </div>
      )}
      
      {/* Online status indicator */}
      {status && (
        <span 
          className={`absolute bottom-0 right-0 block rounded-full ${getStatusSize()} ${statusClass} ring-2 ring-white dark:ring-gray-800`}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default Avatar;