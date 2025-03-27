import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Plus, MoreVertical } from 'lucide-react';
import Avatar from '../Common/Avatar';

/**
 * ChatList component displays a list of the user's chats
 * @param {Object} props - Component props
 * @param {Array} props.chats - Array of chat objects
 * @param {string} props.selectedChatId - ID of the currently selected chat
 * @param {Function} props.onSelectChat - Function to call when a chat is selected
 * @param {Function} props.onNewChat - Function to call when new chat button is clicked
 * @param {boolean} props.loading - Whether chats are loading
 */
const ChatList = ({ 
  chats = [], 
  selectedChatId = null, 
  onSelectChat, 
  onNewChat,
  loading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState(chats);
  
  // Filter chats when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(chat => {
      // For group chats, search in the name
      if (chat.type === 'group' && chat.name) {
        return chat.name.toLowerCase().includes(query);
      }
      
      // For private chats, search in the other participant's username
      const otherParticipant = chat.participants?.find(p => 
        p.id !== 'current-user' && p.id !== 'you'
      );
      
      if (otherParticipant?.username) {
        return otherParticipant.username.toLowerCase().includes(query);
      }
      
      return false;
    });
    
    setFilteredChats(filtered);
  }, [searchQuery, chats]);
  
  /**
   * Format relative time for messages (e.g., "2h ago", "Yesterday")
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted relative time
   */
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInHours < 24) {
        if (diffInHours === 0) {
          return 'Just now';
        }
        return `${diffInHours}h ago`;
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return format(date, 'EEEE'); // Day name (e.g., "Monday")
      } else {
        return format(date, 'MMM d'); // Month and day (e.g., "Aug 23")
      }
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };
  
  // Render empty state when no chats
  if (!loading && chats.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <button 
            onClick={onNewChat}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            aria-label="New chat"
          >
            <Plus size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations"
              className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Plus size={24} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No conversations yet</h3>
          <p className="text-gray-500 mb-6">Start a new conversation to connect with people</p>
          <button
            onClick={onNewChat}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Start a new chat
          </button>
        </div>
      </div>
    );
  }
  
  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="p-2 bg-gray-200 rounded-full animate-pulse">
            <Plus size={20} className="text-gray-400" />
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        {[...Array(5)].map((_, index) => (
          <div key={index} className="p-4 border-b border-gray-100 flex items-center animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Main render with chat list
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
        <button 
          onClick={onNewChat}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label="New chat"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full py-2 pl-10 pr-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <p className="text-gray-500 mb-2">No results found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-500 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredChats.map(chat => {
            // For private chats, determine the other participant
            const otherParticipant = chat.type === 'private' 
              ? chat.participants?.find(p => p.id !== 'current-user' && p.id !== 'you')
              : null;
            
            // Display name: group name or other participant's username
            const displayName = chat.type === 'group' 
              ? chat.name 
              : otherParticipant?.username || 'Unknown User';
            
            // Get the last message sender name
            const lastMessageSender = chat.lastMessage?.sender?.username || '';
            const isOwnLastMessage = chat.lastMessage?.sender?.id === 'current-user' || 
                                     chat.lastMessage?.sender?.id === 'you';
            
            // Create truncated message preview
            const messagePreview = chat.lastMessage?.content 
              ? (chat.lastMessage.content.length > 30 
                  ? `${chat.lastMessage.content.substring(0, 30)}...` 
                  : chat.lastMessage.content)
              : 'No messages yet';
              
            return (
              <div 
                key={chat.id}
                className={`p-4 border-b border-gray-100 flex items-center cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedChatId === chat.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <Avatar 
                  src={chat.type === 'group' ? null : otherParticipant?.profilePicture}
                  name={displayName}
                  size="lg"
                  type={chat.type}
                  status={chat.type === 'private' && otherParticipant?.status}
                />
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium text-gray-900 truncate">{displayName}</h3>
                    {chat.lastMessage?.timestamp && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatMessageTime(chat.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {chat.lastMessage ? (
                        <>
                          {chat.type === 'group' && !isOwnLastMessage && (
                            <span className="font-medium">{lastMessageSender}: </span>
                          )}
                          {isOwnLastMessage ? (
                            <span className="text-gray-500">You: {messagePreview}</span>
                          ) : (
                            messagePreview
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">No messages yet</span>
                      )}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                
                <button className="p-1 text-gray-400 hover:text-gray-600 ml-2 focus:outline-none">
                  <MoreVertical size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatList;