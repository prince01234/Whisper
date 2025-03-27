import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchResults from './SearchResults';
import { performSearch } from '../../utils/searchApi';

/**
 * SearchBar component with real-time search results
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.initialQuery - Initial search query
 * @param {Function} props.onSearch - Callback when search is performed
 */
const SearchBar = ({ className = "", initialQuery = "", onSearch = null }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search as user types
  useEffect(() => {
    let isMounted = true;
    
    const search = async () => {
      if (!query.trim()) {
        setResults({ users: [], posts: [] });
        setIsSearching(false);
        return;
      }
      
      try {
        setIsSearching(true);
        setError(null);
        
        const data = await performSearch(query);
        
        if (isMounted) {
          setResults(data);
          setShowResults(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Search error:', err);
          setError('An error occurred while searching');
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    };
    
    // Only search if query has content
    if (query.trim().length >= 2) {
      const timer = setTimeout(() => {
        search();
      }, 300);
      
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    }
  }, [query]);
  
  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
      if (onSearch) {
        onSearch(query);
      }
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setShowResults(false);
    }
  };
  
  // Clear search input
  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };
  
  // Handle result click
  const handleResultClick = () => {
    setShowResults(false);
  };
  
  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          
          <input
            type="search"
            className="block w-full py-2 pl-10 pr-10 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-violet-500 dark:focus:border-violet-500"
            placeholder="Search for people and messages..."
            value={query}
            onChange={handleChange}
            onFocus={() => query.trim() !== '' && setShowResults(true)}
            aria-label="Search"
            autoComplete="off"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isSearching ? (
              <Loader className="w-4 h-4 text-gray-500 dark:text-gray-400 animate-spin" />
            ) : query ? (
              <button
                type="button"
                className="focus:outline-none"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            ) : null}
          </div>
        </div>
      </form>
      
      {showResults && (
        <SearchResults 
          results={results}
          query={query}
          isSearching={isSearching}
          error={error}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  );
};

export default SearchBar;