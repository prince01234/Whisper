import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, User, MessageSquare, Filter, X, AlertCircle } from 'lucide-react';
import { performSearch } from '../utils/searchApi';
import UserCard from '../components/User/UserCard';
import PostCard from '../components/Post/PostCard';
import SearchBar from '../components/Search/SearchBar';


/**
 * Search page component for displaying search results with filtering options
 */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(type);
  
  // Fetch search results when query or type changes
  useEffect(() => {
    if (query.trim() === '') return;
    
    const search = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const searchResults = await performSearch(query, type);
        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('An error occurred while searching. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    search();
  }, [query, type]);
  
  // Handle tab change for filtering results
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ q: query, type: tab });
  };
  
  // Check if we have any results
  const hasUsers = results.users && results.users.length > 0;
  const hasPosts = results.posts && results.posts.length > 0;
  const hasResults = hasUsers || hasPosts;
  
  // Handle search from the SearchBar component
  const handleSearch = (newQuery) => {
    if (newQuery.trim()) {
      setSearchParams({ q: newQuery, type: 'all' });
      setActiveTab('all');
    }
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Page header with title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <SearchIcon className="w-6 h-6 mr-2" />
          Search Results
        </h1>
        
        {/* Add SearchBar at the top of the page for easier searching */}
        <div className="mb-4">
          <SearchBar 
            className="w-full" 
            initialQuery={query}
            onSearch={(q) => handleSearch(q)}
          />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {query ? `Showing results for "${query}"` : 'Enter search terms to find users and posts'}
        </p>
      </div>
      
      {/* Query and filter tags */}
      {query && (
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-200 rounded-full px-4 py-2 text-sm flex items-center">
            <span className="mr-2">"{query}"</span>
            <button 
              onClick={() => setSearchParams({})}
              aria-label="Clear search"
              className="text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {type !== 'all' && (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full px-4 py-2 text-sm flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              <span className="mr-2">
                {type === 'users' ? 'People' : type === 'posts' ? 'Posts' : type}
              </span>
              <button 
                onClick={() => setSearchParams({ q: query })}
                aria-label="Clear filter"
                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Filter tabs */}
      {query && (
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6">
            <button
              onClick={() => handleTabChange('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              People
              {hasUsers && (
                <span className="ml-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {results.users.length}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Posts
              {hasPosts && (
                <span className="ml-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {results.posts.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-t-4 border-violet-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        // Error state
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : query && !hasResults ? (
        // No results state
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            We couldn't find anything matching "{query}".
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        </div>
      ) : query ? (
        // Results display
        <div>
          {(activeTab === 'all' || activeTab === 'users') && hasUsers && (
            <div className="mb-10">
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  People
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.users.map(user => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          )}
          
          {(activeTab === 'all' || activeTab === 'posts') && hasPosts && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Posts
                </h2>
              )}
              <div className="space-y-4">
                {results.posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Initial empty state
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Search for something</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Enter a search term to find users and posts.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;