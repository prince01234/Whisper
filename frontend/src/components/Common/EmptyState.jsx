import React from 'react';
import { Search, MessageSquare, Users, FileQuestion } from 'lucide-react';
import Button from './Button';

/**
 * Reusable empty state component for when there's no content to display
 * @param {Object} props - Component props
 * @param {string} props.type - Type of empty state (search, chat, group, generic)
 * @param {string} props.title - Title text
 * @param {string} props.message - Additional message
 * @param {Function} props.actionLabel - Label for the call-to-action button
 * @param {Function} props.onAction - Callback for when action button is clicked
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({
  type = 'generic',
  title,
  message,
  actionLabel,
  onAction,
  className = ''
}) => {
  // Define icon based on type
  const getIcon = () => {
    const iconClasses = 'w-12 h-12 text-gray-400 dark:text-gray-500 mb-4';
    
    switch(type) {
      case 'search':
        return <Search className={iconClasses} />;
      case 'chat':
        return <MessageSquare className={iconClasses} />;
      case 'group':
        return <Users className={iconClasses} />;
      default:
        return <FileQuestion className={iconClasses} />;
    }
  };
  
  // Default titles based on type
  const getDefaultTitle = () => {
    switch(type) {
      case 'search':
        return 'No search results';
      case 'chat':
        return 'No conversations yet';
      case 'group':
        return 'No groups yet';
      default:
        return 'Nothing to show';
    }
  };
  
  // Default messages based on type
  const getDefaultMessage = () => {
    switch(type) {
      case 'search':
        return 'Try searching for something else';
      case 'chat':
        return 'Start a new conversation to connect with others';
      case 'group':
        return 'Join or create a group to start collaborating';
      default:
        return 'There are no items to display at this time';
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 ${className}`}>
      {getIcon()}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
        {title || getDefaultTitle()}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {message || getDefaultMessage()}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          variant="primary"
          size="md"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;