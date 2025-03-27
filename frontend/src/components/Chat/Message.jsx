import React from 'react';
import { RefreshCw, Check, CheckCheck } from 'lucide-react';
import Avatar from '../Common/Avatar';

const Message = ({ message, time, isOwn, status, onRetry }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} space-x-2`}>
      {!isOwn && (
        <div className="flex-shrink-0">
          <Avatar 
            name={message.sender?.username || 'User'}
            size="sm"
          />
        </div>
      )}
      
      <div className={`max-w-[70%] ${isOwn ? 'order-1' : ''}`}>
        <div 
          className={`p-3 rounded-lg relative break-words ${
            isOwn 
              ? 'bg-blue-500 text-white rounded-br-none' 
              : 'bg-white dark:bg-gray-800 rounded-bl-none'
          }`}
        >
          {message.content}
        </div>
        
        <div className={`flex items-center mt-1 text-xs text-gray-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span>{time}</span>
          
          {isOwn && (
            <div className="ml-1">
              {status === 'sending' && (
                <span className="text-gray-400">
                  <Check size={14} />
                </span>
              )}
              {status === 'sent' && (
                <span className="text-blue-400">
                  <Check size={14} />
                </span>
              )}
              {status === 'delivered' && (
                <span className="text-blue-400">
                  <CheckCheck size={14} />
                </span>
              )}
              {status === 'read' && (
                <span className="text-green-400">
                  <CheckCheck size={14} />
                </span>
              )}
              {status === 'failed' && (
                <button 
                  onClick={onRetry}
                  className="text-red-500 hover:text-red-600"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;