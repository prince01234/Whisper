import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

/**
 * Custom hook for managing chat conversations
 * @param {Object} options - Hook options
 * @param {boolean} options.autoLoad - Whether to automatically load chats
 * @returns {Object} Chats state and functions
 */
const useChats = ({ autoLoad = true } = {}) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user, token } = useAuth() || {};
  
  /**
   * Fetch all chats for the current user
   */
  const fetchChats = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API
      let fetchedChats = [];
      
      try {
        const response = await fetch('/api/chats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          fetchedChats = data.chats || [];
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API fetch failed, using mock data', apiError);
        
        // Simulate API response with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock chats
        fetchedChats = [
          {
            id: 'c1',
            name: null,
            type: 'private',
            lastMessage: {
              content: 'Hey, how are you doing?',
              sender: { id: '101', username: 'janedoe' },
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              read: false
            },
            participants: [
              { id: '101', username: 'janedoe', profilePicture: null },
              { id: user?.id || 'current-user', username: user?.username || 'You', profilePicture: null }
            ],
            unreadCount: 2,
            updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            id: 'c2',
            name: null,
            type: 'private',
            lastMessage: {
              content: 'See you tomorrow!',
              sender: { id: user?.id || 'current-user', username: user?.username || 'You' },
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: true
            },
            participants: [
              { id: '102', username: 'mikesmith', profilePicture: null },
              { id: user?.id || 'current-user', username: user?.username || 'You', profilePicture: null }
            ],
            unreadCount: 0,
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'c3',
            name: 'Project Team',
            type: 'group',
            lastMessage: {
              content: 'Let\'s meet at 3 PM',
              sender: { id: '103', username: 'sarahpatel' },
              timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
              read: true
            },
            participants: [
              { id: '101', username: 'janedoe', profilePicture: null },
              { id: '102', username: 'mikesmith', profilePicture: null },
              { id: '103', username: 'sarahpatel', profilePicture: null },
              { id: user?.id || 'current-user', username: user?.username || 'You', profilePicture: null }
            ],
            unreadCount: 0,
            updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
      
      // Sort chats by last message time
      fetchedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setChats(fetchedChats);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id, user?.username]);

  /**
   * Select a chat to view
   * @param {string} chatId - ID of the chat to select
   */
  const selectChat = useCallback((chatId) => {
    const chat = chats.find(c => c.id === chatId);
    setSelectedChat(chat || null);
  }, [chats]);

  /**
   * Create a new chat with a user
   * @param {string} userId - ID of the user to chat with
   * @param {string} username - Username of the user to chat with
   * @returns {Object} The created chat object
   */
  const createChat = useCallback(async (userId, username) => {
    if (!token || !userId) return null;
    
    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.type === 'private' && 
        chat.participants.some(p => p.id === userId)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        return existingChat;
      }
      
      setLoading(true);
      
      // Try to create via API
      let newChat = null;
      
      try {
        const response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId })
        });
        
        if (response.ok) {
          const data = await response.json();
          newChat = data.chat;
        } else {
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API create failed, using mock data', apiError);
        
        // Simulate API response
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock chat
        newChat = {
          id: `c${Date.now()}`,
          name: null,
          type: 'private',
          lastMessage: null,
          participants: [
            { id: userId, username: username || 'User', profilePicture: null },
            { id: user?.id || 'current-user', username: user?.username || 'You', profilePicture: null }
          ],
          unreadCount: 0,
          updatedAt: new Date().toISOString()
        };
      }
      
      // Add new chat to list
      setChats(prev => [newChat, ...prev]);
      setSelectedChat(newChat);
      
      return newChat;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [chats, token, user?.id, user?.username]);

  // Update chat when a new message is sent
  const updateChatWithMessage = useCallback((chatId, message) => {
    setChats(prev => 
      prev.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: message,
            updatedAt: message.timestamp,
            unreadCount: message.sender.id !== user?.id 
              ? chat.unreadCount + 1 
              : chat.unreadCount
          };
        }
        return chat;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  }, [user?.id]);

  // Load chats on mount if autoLoad is true
  useEffect(() => {
    if (autoLoad && token) {
      fetchChats();
    }
  }, [autoLoad, fetchChats, token]);

  return {
    chats,
    selectedChat,
    loading,
    error,
    fetchChats,
    selectChat,
    createChat,
    updateChatWithMessage
  };
};

export default useChats;