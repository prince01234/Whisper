import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock, AlertCircle, MoreVertical, Reply, Trash2, Copy, RotateCcw } from 'lucide-react';
import Avatar from '../Common/Avatar';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * ChatMessage component displays a single message in a chat
 * @param {Object} props - Component props
 * @param {Object} props.message - Message data (content, status, timestamp, etc.)
 * @param {Object} props.sender - Sender information (username, profilePicture)
 * @param {boolean} props.isCurrentUser - Whether the message is from the current user
 * @param {string} props.chatType - Type of chat ('private' or 'group')
 * @param {boolean} props.grouped - Whether this message is part of a grouped sequence from the same sender
 * @param {Function} props.onDelete - Function to call when deleting a message
 * @param {Function} props.onRetry - Function to call when retrying to send a failed message
 * @param {boolean} props.isLastMessage - Whether this is the last message in the list
 */
const ChatMessage = ({
  message,
  sender,
  isCurrentUser,
  chatType = 'private',
  grouped = false,
  onDelete,
  onRetry
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useClickOutside(menuRef, () => {
    if (showMenu) {
      setShowMenu(false);
      setConfirmDelete(false);
    }
  });
  
  // Format timestamp for display
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };
  
  // Handle message actions
  const handleCopyText = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setShowMenu(false);
    }
  };
  
  const handleDelete = () => {
    if (confirmDelete) {
      onDelete && onDelete(message.id);
      setShowMenu(false);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };
  
  const handleRetry = () => {
    onRetry && onRetry(message.id);
    setShowMenu(false);
  };
  
  // Get message status icon based on status
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check size={14} className="text-gray-500" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-500" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'sending':
        return <Clock size={14} className="text-gray-400" />;
      case 'failed':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };
  
  // Determine message container classes based on sender
  const messageContainerClasses = isCurrentUser
    ? 'flex flex-col items-end'
    : 'flex flex-col items-start';
  
  // Determine message bubble classes based on sender, status, and grouping
  const messageBubbleClasses = isCurrentUser
    ? `bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl ${
        grouped ? 'rounded-tr-lg mt-1' : 'rounded-tr-none mt-2'
      } ${message.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-300' : ''}`
    : `bg-gray-100 text-gray-800 rounded-t-2xl rounded-br-2xl ${
        grouped ? 'rounded-tl-lg mt-1' : 'rounded-tl-none mt-2'
      }`;
  
  // Determine content classes for different message types
  const contentClasses = 'px-4 py-2 break-words';
  
  // Check if message has attachments
  const hasAttachments = message.attachments && message.attachments.length > 0;
  
  // Determine if we should show sender info (in group chats and not in grouped messages)
  const showSenderInfo = chatType === 'group' && !isCurrentUser && !grouped;
  
  return (
    <div className={messageContainerClasses}>
      {/* Show sender info for group chats */}
      {showSenderInfo && (
        <div className="flex items-center ml-12 mb-1">
          <span className="text-xs font-medium text-gray-700">{sender.username}</span>
        </div>
      )}
      
      <div className="flex max-w-[85%] group">
        {/* Avatar - only show for non-grouped messages from others */}
        {!isCurrentUser && !grouped && (
          <div className="mr-2 flex-shrink-0">
            <Avatar 
              src={sender.profilePicture}
              name={sender.username}
              size="sm"
            />
          </div>
        )}
        
        {/* Message content */}
        <div className={`relative ${grouped && !isCurrentUser ? 'ml-10' : ''}`}>
          <div className={messageBubbleClasses}>
            {/* Regular text message */}
            {message.content && (
              <div className={contentClasses}>
                {message.content}
              </div>
            )}
            
            {/* Attachments */}
            {hasAttachments && (
              <div className={`${message.content ? 'mt-2' : ''} px-4 pb-2`}>
                <div className="flex flex-wrap gap-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={attachment.id || index} className="relative rounded overflow-hidden">
                      {attachment.type?.startsWith('image/') ? (
                        <img 
                          src={attachment.url} 
                          alt="Attachment" 
                          className="max-w-[200px] max-h-[200px] rounded object-cover"
                        />
                      ) : (
                        <div className="bg-white p-3 rounded border flex items-center space-x-2">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs">
                            {attachment.name?.split('.').pop().toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{attachment.size}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Time and status indicators */}
          <div className={`flex items-center text-xs text-gray-500 mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {formatTime(message.createdAt || message.timestamp)}
            
            {isCurrentUser && (
              <span className="ml-1">
                {getStatusIcon()}
              </span>
            )}
          </div>
          
          {/* Retry button for failed messages */}
          {message.status === 'failed' && isCurrentUser && (
            <button
              onClick={handleRetry}
              className="text-xs text-red-600 mt-1 hover:underline focus:outline-none"
            >
              Tap to retry
            </button>
          )}
          
          {/* Message actions menu button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-2 ${isCurrentUser ? 'left-0' : 'right-0'} -translate-x-full ${
              isCurrentUser ? '-translate-x-full' : 'translate-x-full'
            } opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-full bg-white/80 shadow-sm hover:bg-gray-100 transition-opacity`}
          >
            <MoreVertical size={14} />
          </button>
          
          {/* Message actions menu */}
          {showMenu && (
            <div 
              ref={menuRef}
              className={`absolute z-10 top-0 ${
                isCurrentUser ? 'right-full mr-2' : 'left-full ml-2'
              } bg-white rounded-lg shadow-lg border border-gray-200 w-40 py-1 text-sm`}
            >
              <button
                onClick={() => {
                  // Handle reply action
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
              >
                <Reply size={14} className="mr-2" />
                Reply
              </button>
              
              {message.content && (
                <button
                  onClick={handleCopyText}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                >
                  <Copy size={14} className="mr-2" />
                  Copy text
                </button>
              )}
              
              {isCurrentUser && message.status === 'failed' && (
                <button
                  onClick={handleRetry}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100"
                >
                  <RotateCcw size={14} className="mr-2" />
                  Retry sending
                </button>
              )}
              
              {isCurrentUser && (
                <button
                  onClick={handleDelete}
                  className={`flex items-center w-full px-4 py-2 ${
                    confirmDelete ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <Trash2 size={14} className="mr-2" />
                  {confirmDelete ? 'Confirm delete?' : 'Delete'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;