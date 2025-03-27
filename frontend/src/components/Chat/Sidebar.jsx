import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import Avatar from '../Common/Avatar';
import Loading from '../Common/Loading';

const Sidebar = ({ 
  conversations, 
  selectedConversationId, 
  onSelectConversation, 
  onNewChat,
  loading 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conversation) => 
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conversation.lastMessage && 
        conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Format time (simplified version - create a proper dateUtils.js later)
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    // Today
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Within last week
    const diffDays = Math.round((now - messageDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">Messages</h1>
        <button 
          onClick={onNewChat}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>
      
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading size="lg" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <Avatar 
                  name={conversation.name}
                  size="md"
                  status={conversation.isGroup ? undefined : (conversation.participants[0]?.status || 'offline')}
                  isGroup={conversation.isGroup}
                />
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-blue-500 text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;