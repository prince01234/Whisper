import React from 'react';
import { Link } from 'react-router-dom';
import { User, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Card component for displaying message information in search results
 * @param {Object} props - Component props
 * @param {Object} props.post - Message object (we're keeping the prop name "post" for compatibility)
 * @param {string} props.className - Additional CSS classes (optional)
 */
const PostCard = ({ post, className = '' }) => {
  // Safety check for required properties
  if (!post || !post.id) {
    return null;
  }

  // Safely access message properties
  const sender = post.sender || post.author || {};
  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true });
  
  // Determine if this is a chat message or a group post
  const isChat = post.chatId || post.recipientId;
  const recipient = post.recipient || {};
  const group = post.group || {};

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-md ${className}`}>
      <div className="p-4">
        {/* Sender information */}
        <div className="flex items-center mb-3">
          <Link 
            to={`/profile/${sender.username || 'unknown'}`} 
            className="flex items-center hover:opacity-90 transition-opacity"
          >
            {sender.profilePicture ? (
              <img 
                src={sender.profilePicture} 
                alt={sender.username || 'User'} 
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {sender.fullName || sender.username || 'Unknown User'}
              </p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Message destination info (chat or group) */}
        {isChat && recipient.username && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span>Message to</span>
            <ArrowRight className="w-3 h-3 mx-1" />
            <Link 
              to={`/profile/${recipient.username}`}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              {recipient.fullName || recipient.username}
            </Link>
          </div>
        )}
        
        {group && group.name && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <span>Posted in</span>
            <ArrowRight className="w-3 h-3 mx-1" />
            <Link 
              to={`/groups/${group.id}`}
              className="font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              {group.name}
            </Link>
          </div>
        )}
        
        {/* Message content */}
        <Link to={isChat ? `/chats/${post.chatId || recipient.id}` : `/groups/${group.id}/posts/${post.id}`} className="block group">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-2">
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
              {post.content}
            </p>
            
            {post.image && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img 
                  src={post.image} 
                  alt="Message attachment" 
                  className="max-h-32 object-cover transform transition-transform group-hover:scale-[1.02]"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="text-sm text-right">
            <span className="text-violet-600 dark:text-violet-400 font-medium group-hover:underline">
              View full conversation
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PostCard;