import React from 'react';
import { MessageSquarePlus, Users } from 'lucide-react';

/**
 * ChatEmpty component displays when no chat is selected
 * @param {Object} props - Component props
 * @param {Function} props.onStartNewChat - Function to call when "Start new chat" button is clicked
 */
const ChatEmpty = ({ onStartNewChat }) => {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <MessageSquarePlus size={28} className="text-blue-600" />
        </div>
        
        {/* Main heading */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          No conversation selected
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8">
          Select an existing conversation or start a new one to begin messaging.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col space-y-4">
          {/* Start new chat button */}
          <button 
            onClick={onStartNewChat}
            className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <MessageSquarePlus size={20} className="mr-2" />
            Start a new conversation
          </button>
          
          {/* Secondary action button */}
          <button 
            onClick={onStartNewChat} // For group chats (could be a separate function)
            className="flex items-center justify-center w-full px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Users size={20} className="mr-2" />
            Create a group chat
          </button>
        </div>
        
        {/* Tip section */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">
            Quick Tip
          </h3>
          <p className="text-sm text-blue-700">
            Conversations are end-to-end encrypted. Only you and the people you message can read or listen to them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatEmpty;