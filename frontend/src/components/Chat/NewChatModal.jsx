import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Users, UserPlus, Check } from 'lucide-react';
import Avatar from '../Common/Avatar';

/**
 * NewChatModal component for creating new private or group chats
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onCreateChat - Function to call when creating a chat
 * @param {Array} props.contacts - List of contacts/users to choose from
 * @param {boolean} props.loading - Whether data is being loaded
 */
const NewChatModal = ({
  isOpen,
  onClose,
  onCreateChat,
  contacts = [],
  loading = false
}) => {
  const [tab, setTab] = useState('private'); // 'private' or 'group'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Close modal with cleanup - using useCallback to prevent recreating on each render
  const handleClose = useCallback(() => {
    setTab('private');
    setSearchQuery('');
    setSelectedUsers([]);
    setGroupName('');
    setError('');
    onClose();
  }, [onClose]); // onClose is the only external dependency
  
  // Update filtered contacts when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => 
      contact.username.toLowerCase().includes(query) ||
      contact.name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query)
    );
    
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);
  
  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]); // handleClose is now properly memoized
  
  // Create a new chat - using useCallback to prevent recreation on each render
  const handleCreateChat = useCallback(async () => {
    if (tab === 'private' && selectedUsers.length === 1) {
      // Create private chat
      setCreating(true);
      setError('');
      
      try {
        await onCreateChat({
          type: 'private',
          participants: [selectedUsers[0]]
        });
        handleClose();
      } catch (err) {
        setError('Failed to create chat. Please try again.');
        console.error('Error creating private chat:', err);
      } finally {
        setCreating(false);
      }
    } else if (tab === 'group' && selectedUsers.length >= 2) {
      // Create group chat
      if (!groupName.trim()) {
        setError('Please enter a group name');
        return;
      }
      
      setCreating(true);
      setError('');
      
      try {
        await onCreateChat({
          type: 'group',
          name: groupName.trim(),
          participants: selectedUsers
        });
        handleClose();
      } catch (err) {
        setError('Failed to create group. Please try again.');
        console.error('Error creating group chat:', err);
      } finally {
        setCreating(false);
      }
    }
  }, [tab, selectedUsers, groupName, onCreateChat, handleClose]);
  
  // Toggle user selection
  const toggleUserSelection = useCallback((user) => {
    if (tab === 'private') {
      // For private chats, only select one user
      setSelectedUsers([user]);
      handleCreateChat();
    } else {
      // For group chats, toggle selection
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u.id === user.id);
        return isSelected
          ? prev.filter(u => u.id !== user.id)
          : [...prev, user];
      });
    }
  }, [tab, handleCreateChat]);
  
  // Check if user is selected
  const isUserSelected = useCallback((userId) => {
    return selectedUsers.some(user => user.id === userId);
  }, [selectedUsers]);
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {tab === 'private' ? 'New conversation' : 'Create group'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Tab selector */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('private')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              tab === 'private'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Private Chat
          </button>
          <button
            onClick={() => setTab('group')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              tab === 'group'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Group Chat
          </button>
        </div>
        
        {/* Group name input (for group chats) */}
        {tab === 'group' && (
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        
        {/* Search input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={tab === 'private' ? 'Search contacts' : 'Search people to add'}
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          
          {/* Selected users badges (for group chats) */}
          {tab === 'group' && selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedUsers.map(user => (
                <div 
                  key={user.id} 
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  <span>{user.username}</span>
                  <button
                    onClick={() => toggleUserSelection(user)}
                    className="ml-1 p-0.5 rounded-full hover:bg-blue-200 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}
        
        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // Loading state
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded max-w-[140px]"></div>
                    <div className="h-3 bg-gray-200 rounded max-w-[100px] mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            // No results state
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <Users size={48} className="mb-2 text-gray-300" />
              <p className="mb-1">No contacts found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            // Contact list
            <ul className="divide-y divide-gray-200">
              {filteredContacts.map(contact => (
                <li key={contact.id}>
                  <button
                    onClick={() => toggleUserSelection(contact)}
                    className={`w-full text-left p-4 flex items-center hover:bg-gray-50 transition-colors ${
                      isUserSelected(contact.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar
                      src={contact.profilePicture}
                      name={contact.username}
                      size="md"
                      status={contact.status}
                    />
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-900">{contact.username}</h3>
                      <p className="text-sm text-gray-500">{contact.status === 'online' ? 'Online' : contact.email || ''}</p>
                    </div>
                    {tab === 'group' && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isUserSelected(contact.id)
                          ? 'bg-blue-500 text-white'
                          : 'border border-gray-300'
                      }`}>
                        {isUserSelected(contact.id) && <Check size={14} />}
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          
          {tab === 'group' && (
            <button
              onClick={handleCreateChat}
              disabled={creating || selectedUsers.length < 2 || !groupName.trim()}
              className={`px-4 py-2 rounded-md flex items-center ${
                creating || selectedUsers.length < 2 || !groupName.trim()
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Create Group
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;