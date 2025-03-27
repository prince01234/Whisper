import React from 'react';
import { useMessages } from '../../hooks/useMessages';
import ChatHeader from './ChatHeader';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import ChatEmpty from './ChatEmpty';
import LoadingSpinner from '../Common/LoadingSpinner';

/**
 * ChatDetail component displays the selected chat with message history
 * @param {Object} props - Component props
 * @param {Object} props.selectedChat - The currently selected chat object
 * @param {Function} props.onBack - Function to call when back button is clicked (mobile)
 * @param {Function} props.onStartNewChat - Function to start a new chat
 */
const ChatDetail = ({ 
  selectedChat, 
  onBack, 
  onStartNewChat 
}) => {
  // Use the messages hook to manage chat messages with optional parameters
  const { 
    messages, 
    loading, 
    error, 
    hasMore, 
    isTyping, 
    connectedUsers,
    sendMessage,
    loadMoreMessages,
    deleteMessage,
    sendTypingStatus
  } = useMessages({
    chatId: selectedChat?.id,
    autoLoad: !!selectedChat
  });

  // If no chat is selected, show the empty state
  if (!selectedChat) {
    return <ChatEmpty onStartNewChat={onStartNewChat} />;
  }

  // Get chat participants for the header display
  const chatParticipants = selectedChat.participants || [];
  const otherParticipants = chatParticipants.filter(
    p => p.id !== 'current-user' && p.id !== 'you'
  );

  // For private chats, determine the other participant
  const otherParticipant = selectedChat.type === 'private' 
    ? otherParticipants[0] 
    : null;

  // Display name: group name or other participant's username
  const displayName = selectedChat.type === 'group' 
    ? selectedChat.name 
    : otherParticipant?.username || 'Unknown User';

  // Determine avatar and online status for header
  const avatarProps = selectedChat.type === 'group' 
    ? { 
        type: 'group', 
        name: selectedChat.name,
        src: selectedChat.avatar || null
      } 
    : { 
        type: 'user', 
        name: otherParticipant?.username || 'Unknown',
        src: otherParticipant?.profilePicture || null,
        status: otherParticipant?.status || 'offline'
      };

  // Determine subtitle for header
  const subtitle = selectedChat.type === 'group'
    ? `${selectedChat.memberCount || chatParticipants.length} members`
    : otherParticipant?.status === 'online' 
      ? 'Online'
      : otherParticipant?.lastSeen
        ? `Last seen ${formatLastSeen(otherParticipant.lastSeen)}`
        : 'Offline';

  /**
   * Format the last seen timestamp
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted last seen string
   */
  function formatLastSeen(dateString) {
    if (!dateString) return 'a while ago';
    
    try {
      const lastSeen = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
      
      if (diffInMinutes < 1) {
        return 'just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInMinutes < 7 * 24 * 60) {
        const days = Math.floor(diffInMinutes / (24 * 60));
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        // Format as date for older timestamps
        return lastSeen.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: lastSeen.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (e) {
      console.error('Error formatting date', e);
      return 'a while ago';
    }
  }

  /**
   * Handle sending a new message
   * @param {string} content - Message content
   */
  const handleSendMessage = async (content) => {
    if (!content.trim()) return;
    await sendMessage(content);
  };

  /**
   * Handle message deletion
   * @param {string} messageId - ID of the message to delete
   */
  const handleDeleteMessage = async (messageId) => {
    await deleteMessage(messageId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header with participant info */}
      <ChatHeader
        name={displayName}
        subtitle={subtitle}
        avatar={avatarProps}
        isGroup={selectedChat.type === 'group'}
        onBack={onBack}
        connectedUsers={selectedChat.type === 'group' ? connectedUsers : []}
        participants={selectedChat.participants || []}
      />
      
      {/* Main content area with messages */}
      <div className="flex-1 overflow-hidden relative">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full p-4 text-center">
            <p className="text-red-500 mb-3">
              {error || "Couldn't load messages. Please try again."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Reload
            </button>
          </div>
        ) : (
          <ChatHistory
            messages={messages}
            hasMore={hasMore}
            isTyping={isTyping}
            onLoadMore={loadMoreMessages}
            onDeleteMessage={handleDeleteMessage}
            chatType={selectedChat.type}
            participants={selectedChat.participants || []}
          />
        )}
      </div>
      
      {/* Message input area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        onTyping={sendTypingStatus}
        disabled={loading && messages.length === 0}
      />
    </div>
  );
};

export default ChatDetail;