import React from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, CalendarDays, AtSign } from 'lucide-react';

/**
 * Card component for displaying user information in search results
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with profile information
 * @param {string} props.className - Additional CSS classes (optional)
 */
const UserCard = ({ user, className = '' }) => {
  // Fallback checks for required properties
  if (!user || !user.username) {
    return null; // Don't render cards for invalid users
  }

  return (
    <Link 
      to={`/profile/${user.username}`} 
      className={`block bg-white dark:bg-gray-800 rounded-lg shadow transition-all hover:shadow-md hover:scale-[1.01] overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Background header */}
      <div className="h-24 bg-gradient-to-r from-violet-500 to-purple-500 relative">
        {user.headerImage && (
          <img 
            src={user.headerImage} 
            alt="" 
            className="w-full h-24 object-cover absolute inset-0"
          />
        )}
      </div>

      <div className="px-4 pt-0 pb-4 relative">
        {/* Profile picture */}
        <div className="absolute -top-10 left-4">
          {user.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt={user.username} 
              className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white dark:bg-gray-800"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
              <User className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
          )}
        </div>

        {/* User details */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {user.fullName || user.username}
          </h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <AtSign className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
            <span className="truncate">{user.username}</span>
          </div>
          
          {user.bio && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {user.bio}
            </p>
          )}
          
          <div className="space-y-1.5">
            {user.location && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
            
            {user.joinedDate && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span>Joined {new Date(user.joinedDate).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'short'
                })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default UserCard;