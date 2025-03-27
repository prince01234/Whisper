import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ChatMessage from './ChatMessage';
import { formatDistanceToNow } from 'date-fns';
import { ArrowDown } from 'lucide-react';

/**
 * ChatHistory component displays the messages in a chat
 * @param {Object} props - Component props
 * @param {Array} props.messages - List of messages to display
 * @param {boolean} props.isTyping - Whether someone is typing
 * @param {boolean} props.hasMore - Whether there are more messages to load
 * @param {Function} props.onLoadMore - Function to call to load more messages
 * @param {Function} props.onDeleteMessage - Function to call to delete a message
 * @param {Function} props.onRetryMessage - Function to retry sending a failed message
 * @param {string} props.chatType - Type of chat ('private' or 'group')
 * @param {Array} props.participants - List of chat participants
 */
const ChatHistory = ({
  messages = [],
  isTyping = false,
  hasMore = false,
  onLoadMore,
  onDeleteMessage,
  onRetryMessage,
  chatType = 'private',
  participants = []
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { user } = useAuth();
  const currentUserId = user?.id;
  
  // Handle scroll to bottom on new messages
  useEffect(() => {
    // Helper to check if we should scroll to bottom
    const shouldScrollToBottom = () => {
      if (!messagesContainerRef.current) return true;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // If we're within 100px of the bottom or it's initial load, scroll down
      return initialLoad || scrollHeight - scrollTop - clientHeight < 100;
    };
    
    // Scroll to bottom only if we're already near the bottom
    if (shouldScrollToBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: initialLoad ? 'auto' : 'smooth' });
      if (initialLoad && messages.length > 0) {
        setInitialLoad(false);
      }
    }
  }, [messages, isTyping, initialLoad]);
  
  // Handle scroll events to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      
      setShowScrollButton(distanceFromBottom > 100);
    };
    
    container.addEventListener('scroll', handleScrollEvent);
    return () => container.removeEventListener('scroll', handleScrollEvent);
  }, []);
  
  // Handle loading more messages when scrolling to top
  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;
    
    // If scrolled near the top
    if (container.scrollTop < 50) {
      setIsLoadingMore(true);
      
      // Store current scroll position and height
      const scrollHeight = container.scrollHeight;
      
      try {
        // Load more messages
        await onLoadMore();
        
        // Restore scroll position after new messages load
        setTimeout(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - scrollHeight;
          setIsLoadingMore(false);
        }, 100);
      } catch (err) {
        // Use err to avoid the error never used warning
        console.error('Error loading more messages:', err);
        setIsLoadingMore(false);
      }
    }
  };
  
  // Scroll to bottom when button is clicked
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Format date for display
  const formatMessageDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return formatDistanceToNow(date, { addSuffix: true });
      }
    } catch (err) {
      // Use err to avoid the error never used warning
      console.error('Error formatting date:', err);
      return '';
    }
  };
  
  // Find the sender info from participants
  const getSender = (senderId) => {
    return participants.find(p => p.id === senderId) || { username: 'Unknown' };
  };
  
  return (
    <div 
      ref={messagesContainerRef} 
      className="flex-1 overflow-y-auto overflow-x-hidden p-4"
      onScroll={handleScroll}
    >
      {/* Loading indicator for more messages */}
      {isLoadingMore && (
        <div className="flex justify-center py-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Show message when there are more messages to load */}
      {hasMore && !isLoadingMore && (
        <div className="text-center text-sm text-gray-500 mb-4">
          Scroll up to load more messages
        </div>
      )}
      
      {/* No messages yet indicator */}
      {messages.length === 0 && !isLoadingMore && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="mb-1">No messages yet</p>
          <p className="text-sm">Send a message to start the conversation</p>
        </div>
      )}
      
      {/* Message list */}
      <div className="space-y-4">
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          
          // Check if this is the first message of a new date
          const messageDate = message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '';
          const prevMessageDate = prevMessage?.createdAt ? new Date(prevMessage.createdAt).toLocaleDateString() : '';
          const isNewDate = messageDate !== prevMessageDate;
          
          // Check if we should group messages (same sender, within 5 minutes)
          const isSameSender = prevMessage && 
                             prevMessage.sender?.id === message.sender?.id;
          
          const timeGap = prevMessage && message.createdAt && prevMessage.createdAt
            ? Math.abs(new Date(message.createdAt) - new Date(prevMessage.createdAt)) / 60000 // in minutes
            : 0;
            
          const shouldGroup = isSameSender && timeGap < 5;
          
          // Get sender information (for display name and avatar)
          const sender = message.sender?.id ? getSender(message.sender.id) : { username: message.sender?.username || 'Unknown' };
          const isCurrentUser = message.sender?.id === currentUserId || 
                               message.sender?.id === 'current-user' || 
                               message.sender?.id === 'you';
          
          return (
            <React.Fragment key={message.id || index}>
              {/* Date separator */}
              {isNewDate && (
                <div className="flex justify-center my-6">
                  <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                    {formatMessageDate(message.createdAt)}
                  </div>
                </div>
              )}
              
              {/* Message component */}
              <ChatMessage
                message={message}
                sender={sender}
                isCurrentUser={isCurrentUser}
                chatType={chatType}
                grouped={shouldGroup}
                onDelete={onDeleteMessage}
                onRetry={onRetryMessage}
                isLastMessage={index === messages.length - 1}
              />
            </React.Fragment>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center pl-2 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-gray-200 mr-2"></div>
            <div className="bg-gray-100 rounded-2xl py-2 px-4 text-gray-500 max-w-xs">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          className="absolute right-6 bottom-6 p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatHistory;