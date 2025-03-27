import React from 'react';
import { User, MessageSquare } from 'lucide-react';
import Avatar from './Avatar';

/**
 * Reusable user item component for lists
 * @param {Object} props - Component props
 * @param {Object} props.user - User object
 * @param {string} props.subtitle - Subtitle text
 * @param {string} props.timestamp - Timestamp for the item
 * @param {boolean} props.isActive - Whether the item is active/selected
 * @param {Function} props.onClick - Callback for when item is clicked
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.rightContent - Content to display on the right
 * @param {React.ReactNode} props.rightIcon - Icon to display on the right
 */
const UserItem = ({
  user,
  subtitle,
  timestamp,
  isActive = false,
  onClick,
  className = '',
  rightContent,
  rightIcon
}) => {
  if (!user) return null;
  
  return (
    <div
      className={`
        flex items-center justify-between p-3 cursor-pointer
        ${isActive ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
        transition-colors rounded-lg
        ${className}
      `}
      onClick={onClick}
    >
      {/* Left side: Avatar and text */}
      <div className="flex items-center flex-1 min-w-0">
        <Avatar
          src={user.profilePicture}
          alt={user.username || 'User'}
          fallback={user.fullName || user.username}
          status={user.status}
        />
        
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.fullName || user.username || 'Unknown User'}
            </p>
            
            {timestamp && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {timestamp}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Right side: Optional content or icon */}
      {(rightContent || rightIcon) && (
        <div className="ml-3 flex-shrink-0">
          {rightContent || rightIcon}
        </div>
      )}
    </div>
  );
};

export default UserItem;