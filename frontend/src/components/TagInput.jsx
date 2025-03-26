import React, { useState } from 'react';
import { X } from 'lucide-react';

export const TagInput = ({ tags, onChange, placeholder, maxTags = 10 }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      
      // Don't add if already at max tags
      if (tags.length >= maxTags) {
        return;
      }
      
      // Don't add if tag already exists
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag if backspace is pressed on empty input
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center px-3 py-1 bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100 rounded-full text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 text-violet-600 dark:text-violet-300 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          disabled={tags.length >= maxTags}
        />
        {tags.length >= maxTags && (
          <p className="mt-1 text-xs text-red-500">
            Maximum of {maxTags} tags reached
          </p>
        )}
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Press Enter to add a tag
      </p>
    </div>
  );
};