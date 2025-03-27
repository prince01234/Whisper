import React from 'react';
import { Link } from 'react-router-dom';
import { User, MessageSquare, AlertCircle, ArrowRight, Search as SearchIcon } from 'lucide-react';

/**
 * Displays search results in a dropdown
 * @param {Object} props - Component props
 * @param {Object} props.results - Search results object with users and messages
 * @param {string} props.query - The search query
 * @param {boolean} props.isSearching - Whether a search is in progress
 * @param {string|null} props.error - Error message if search failed
 * @param {Function} props.onResultClick - Callback when a result is clicked
 */
const SearchResults = ({ results, query, isSearching, error, onResultClick }) => {
  if (isSearching) {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <div className="w-6 h-6 border-t-2 border-violet-500 border-solid rounded-full animate-spin mx-auto mb-2"></div>
          Searching...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-4 text-center text-red-500 dark:text-red-400 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  const hasUsers = results.users && results.users.length > 0;
  const hasPosts = results.posts && results.posts.length > 0;

  if (!hasUsers && !hasPosts && query.trim() !== '') {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No results found for "{query}"
        </div>
      </div>
    );
  }

  if (!query.trim()) {
    return null;
  }

  return (
    <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg dark:bg-gray-800 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {hasUsers && (
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5" />
              People
            </h3>
            {results.users.slice(0, 3).map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.username}`}
                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={onResultClick}
              >
                <div className="flex-shrink-0 mr-3">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user.username} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{user.username}
                  </p>
                </div>
              </Link>
            ))}
            {results.users.length > 3 && (
              <Link
                to={`/search?q=${encodeURIComponent(query)}&type=users`}
                className="flex items-center justify-center p-2 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                onClick={onResultClick}
              >
                View all people results
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        )}

        {hasPosts && (
          <div className="p-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 py-2 flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Messages
            </h3>
            {results.posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to={post.chatId ? `/chats/${post.chatId}` : `/post/${post.id}`}
                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                onClick={onResultClick}
              >
                <div className="flex-shrink-0 mr-3">
                  {post.author?.profilePicture ? (
                    <img 
                      src={post.author.profilePicture} 
                      alt={post.author.username} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                      <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {post.author?.fullName || post.author?.username || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                    {post.content || "No message content"}
                  </p>
                </div>
              </Link>
            ))}
            {results.posts.length > 3 && (
              <Link
                to={`/search?q=${encodeURIComponent(query)}&type=posts`}
                className="flex items-center justify-center p-2 text-sm text-violet-600 dark:text-violet-400 hover:underline"
                onClick={onResultClick}
              >
                View all message results
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <Link
          to={`/search?q=${encodeURIComponent(query)}`}
          className="flex items-center justify-center p-2 text-sm text-violet-600 dark:text-violet-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          onClick={onResultClick}
        >
          <SearchIcon className="w-4 h-4 mr-2" />
          Search for "{query}"
        </Link>
      </div>
    </div>
  );
};

export default SearchResults;