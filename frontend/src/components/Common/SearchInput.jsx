import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Reusable search input component
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Callback for input value change
 * @param {Function} props.onSubmit - Callback for form submission
 * @param {string} props.className - Additional CSS classes
 */
const SearchInput = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSubmit,
  className = ''
}) => {
  // Internal state in case no external state is provided
  const [internalValue, setInternalValue] = useState('');
  
  // Use provided value or internal state
  const inputValue = value !== undefined ? value : internalValue;
  
  // Handle input change
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };
  
  // Handle clear button click
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    } else {
      setInternalValue('');
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(inputValue);
    }
  };
  
  return (
    <form 
      className={`relative ${className}`}
      onSubmit={handleSubmit}
    >
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
      
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
      />
      
      {inputValue && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={handleClear}
        >
          <X className="w-4 h-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400" />
        </button>
      )}
    </form>
  );
};

export default SearchInput;