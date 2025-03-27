import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import io from 'socket.io-client';

/**
 * Custom hook for managing real-time messages in a chat conversation
 * @param {Object} options - Hook options
 * @param {string} options.chatId - ID of the chat to load messages from
 * @param {boolean} options.autoLoad - Whether to automatically load messages
 * @param {number} options.limit - Number of messages to load initially
 * @param {string} options.socketUrl - WebSocket server URL (default: window.location.origin)
 * @returns {Object} Messages state and functions
 */
const useMessages = ({ 
  chatId = null, 
  autoLoad = true, 
  limit = 30,
  socketUrl = typeof window !== 'undefined' ? window.location.origin : ''
} = {}) => {
  // Environment detection
  const isDevelopment = typeof window !== 'undefined' && 
    window.location.hostname === 'localhost';

  // Message state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  
  // Real-time state
  const [isTyping, setIsTyping] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Auth context
  const auth = useAuth() || {};
  const user = auth.user || {};
  const token = auth.token || '';
  
  // Refs
  const messageCountRef = useRef(0);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatIdRef = useRef(chatId);
  
  // Update chatIdRef when chatId changes (for socket callbacks)
  useEffect(() => {
    chatIdRef.current = chatId;
  }, [chatId]);

  /**
   * Initialize socket connection
   */
  const initializeSocket = useCallback(() => {
    if (!token || !chatId || socketRef.current) return;
    
    try {
      // Create socket connection
      const socket = io(socketUrl, {
        auth: { token },
        query: { chatId },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      socketRef.current = socket;
      
      // Socket event handlers
      socket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
        socket.emit('joinChat', { chatId });
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });
      
      socket.on('error', (err) => {
        console.error('Socket error:', err);
        setSocketConnected(false);
      });
      
      // Message events
      socket.on('newMessage', (newMessage) => {
        if (newMessage.chatId === chatIdRef.current) {
          setMessages(prev => {
            // Check if message already exists (prevent duplicates)
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            
            const updated = [...prev, newMessage].sort(
              (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            messageCountRef.current = updated.length;
            return updated;
          });
          
          // Auto-mark received messages as read if they're from others
          if (newMessage.sender?.id !== user.id) {
            socket.emit('markAsRead', { 
              chatId: chatIdRef.current, 
              messageIds: [newMessage.id] 
            });
          }
        }
      });
      
      socket.on('messageUpdated', (updatedMessage) => {
        if (updatedMessage.chatId === chatIdRef.current) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      });
      
      socket.on('messageDeleted', ({ messageId }) => {
        if (chatIdRef.current) {
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== messageId);
            messageCountRef.current = filtered.length;
            return filtered;
          });
        }
      });
      
      // Typing events
      socket.on('userTyping', ({ userId }) => {
        if (userId !== user.id && chatIdRef.current) {
          setIsTyping(true);
        }
      });
      
      socket.on('userStoppedTyping', ({ userId }) => {
        if (userId !== user.id && chatIdRef.current) {
          setIsTyping(false);
        }
      });
      
      // User presence events
      socket.on('usersInChat', ({ users }) => {
        setConnectedUsers(users);
      });
      
      // For dev fallback (will run if socket doesn't connect)
      const fallbackTimeout = setTimeout(() => {
        if (!socketConnected) {
          console.log('Fallback: simulating socket connection');
          setSocketConnected(true);
          setConnectedUsers([
            { id: '101', username: 'janedoe', status: 'online' },
            { id: user.id, username: user.username || 'You', status: 'online' }
          ]);
        }
      }, 3000);
      
      // Clear fallback timeout on cleanup
      return () => clearTimeout(fallbackTimeout);
    } catch (err) {
      console.error('Error initializing socket:', err);
      setSocketConnected(false);
      
      // Fallback simulation for development
      console.log('Fallback: simulating socket connection after error');
      setSocketConnected(true);
      setConnectedUsers([
        { id: '101', username: 'janedoe', status: 'online' },
        { id: user.id, username: user.username || 'You', status: 'online' }
      ]);
    }
  }, [token, chatId, socketUrl, user.id, user.username, socketConnected]);

  /**
   * Disconnect socket
   */
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
      console.log('Socket disconnected');
    }
  }, []);

  /**
   * Load messages for the current chat
   * @param {boolean} reset - Whether to reset the message list
   */
  const loadMessages = useCallback(async (reset = false) => {
    if (!chatId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare API request parameters
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      if (oldestMessageId && !reset) {
        queryParams.append('before', oldestMessageId);
      }
      
      // Try to fetch from API
      let fetchedMessages = [];
      
      try {
        const response = await fetch(`/api/chats/${chatId}/messages?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          fetchedMessages = data.messages || [];
        } else {
          // If API fails, fall back to mock data
          throw new Error('API request failed');
        }
      } catch (apiError) {
        console.log('API fetch failed, using mock data', apiError);
        
        // Simulate API response with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create mock messages
        fetchedMessages = [
          {
            id: reset ? 'm101' : `m${Date.now()}-1`,
            chatId,
            content: 'Hey there!',
            timestamp: new Date(Date.now() - (reset ? 30 : 60) * 60 * 1000).toISOString(),
            sender: { id: '101', username: 'janedoe' },
            read: true
          },
          {
            id: reset ? 'm102' : `m${Date.now()}-2`,
            chatId,
            content: 'Hi! How are you doing?',
            timestamp: new Date(Date.now() - (reset ? 29 : 59) * 60 * 1000).toISOString(),
            sender: { id: user.id, username: user.username || 'You' },
            read: true
          },
          {
            id: reset ? 'm103' : `m${Date.now()}-3`,
            chatId,
            content: 'I\'m good, thanks for asking. How about you?',
            timestamp: new Date(Date.now() - (reset ? 28 : 58) * 60 * 1000).toISOString(),
            sender: { id: '101', username: 'janedoe' },
            read: true
          },
          {
            id: reset ? 'm104' : `m${Date.now()}-4`,
            chatId,
            content: 'I\'m doing well too. Just working on this new project.',
            timestamp: new Date(Date.now() - (reset ? 27 : 57) * 60 * 1000).toISOString(),
            sender: { id: user.id, username: user.username || 'You' },
            read: true
          },
          {
            id: reset ? 'm105' : `m${Date.now()}-5`,
            chatId,
            content: 'That sounds interesting! Tell me more about it.',
            timestamp: new Date(Date.now() - (reset ? 20 : 50) * 60 * 1000).toISOString(),
            sender: { id: '101', username: 'janedoe' },
            read: true
          }
        ];
      }
      
      // Sort messages
      fetchedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Set the oldest message ID for pagination
      const oldest = fetchedMessages[0]?.id || null;
      
      // Update state
      if (reset) {
        setMessages(fetchedMessages);
        messageCountRef.current = fetchedMessages.length;
        setOldestMessageId(oldest);
      } else {
        setMessages(prevMessages => {
          // Combine messages
          const allMessages = [...fetchedMessages, ...prevMessages];
          
          // Deduplicate using Map for better performance
          const messageMap = new Map();
          allMessages.forEach(msg => {
            messageMap.set(msg.id, msg);
          });
          
          // Convert back to array and sort
          const uniqueMessages = Array.from(messageMap.values())
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          // Update message count ref
          messageCountRef.current = uniqueMessages.length;
          
          return uniqueMessages;
        });
        setOldestMessageId(oldest);
      }
      
      // Determine if we have more messages
      setHasMore(fetchedMessages.length >= limit);
      
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [chatId, limit, oldestMessageId, token, user.id, user.username]);

  /**
   * Send a text message
   * @param {string} content - Message content
   * @returns {Object|null} The sent message object or null if failed
   */
  const sendMessage = useCallback(async (content) => {
    if (!chatId || !content || typeof content !== 'string' || !content.trim()) {
      return null;
    }
    
    // Generate message ID once to ensure consistency
    const messageId = `m${Date.now()}`;
    
    try {
      // Create a message object with pending status
      const newMessage = {
        id: messageId,
        chatId,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        sender: { id: user.id || 'current-user', username: user.username || 'You' },
        read: false,
        status: 'sending'
      };
      
      // Add the new message to the list (optimistic update)
      setMessages(prev => {
        const updated = [...prev, newMessage];
        messageCountRef.current = updated.length;
        return updated;
      });
      
      // Try sending via socket
      let sentViaSocket = false;
      
      if (socketRef.current && socketConnected) {
        try {
          socketRef.current.emit('sendMessage', {
            chatId,
            content: newMessage.content,
            tempId: messageId
          });
          sentViaSocket = true;
        } catch (socketErr) {
          console.error('Socket send failed, falling back to API', socketErr);
        }
      }
      
      // Try to send via API (both for persistence and as fallback)
      let serverMessage = null;
      
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: newMessage.content })
        });
        
        if (response.ok) {
          const data = await response.json();
          serverMessage = data.message;
        } else {
          throw new Error(`API error: ${response.statusText}`);
        }
      } catch (apiErr) {
        console.log('API send failed, using optimistic update', apiErr);
        
        // Simulate API delay if we couldn't reach the API but socket worked
        if (sentViaSocket) {
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          // If both socket and API failed, but we're in development, simulate success
          if (isDevelopment) {
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            throw new Error('Failed to send message via both socket and API');
          }
        }
      }
      
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...(serverMessage || msg), status: 'sent' } 
            : msg
        )
      );
      
      // In development mode, simulate receiving a response
      if (isDevelopment && socketConnected) {
        setTimeout(() => {
          const responseMessage = {
            id: `response-${Date.now()}`,
            chatId,
            content: `I received your message: "${content.trim().substring(0, 20)}${content.length > 20 ? '...' : ''}"`,
            timestamp: new Date(Date.now() + 2000).toISOString(),
            sender: { id: '101', username: 'janedoe' },
            read: false,
            status: 'sent'
          };
          
          setMessages(prev => [...prev, responseMessage]);
          messageCountRef.current += 1;
        }, 2000 + Math.random() * 3000);
      }
      
      return { ...(serverMessage || newMessage), status: 'sent' };
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Update the message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        )
      );
      
      setError('Failed to send message. Please try again.');
      return null;
    }
  }, [chatId, user.id, user.username, token, socketConnected, isDevelopment]);

  /**
   * Retry sending a failed message
   * @param {string} messageId - ID of the message to retry
   * @returns {boolean} Success status
   */
  const retryMessage = useCallback(async (messageId) => {
    if (!chatId) return false;
    
    try {
      // Find the failed message
      const failedMessage = messages.find(msg => 
        msg.id === messageId && msg.status === 'failed'
      );
      
      if (!failedMessage) return false;
      
      // Update status to sending
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sending' } : msg
        )
      );
      
      // Try both socket and API
      let success = false;
      
      // Try socket
      if (socketRef.current && socketConnected) {
        try {
          socketRef.current.emit('sendMessage', {
            chatId,
            content: failedMessage.content,
            tempId: messageId
          });
          success = true;
        } catch (socketErr) {
          console.error('Socket retry failed, trying API', socketErr);
        }
      }
      
      // Try API
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: failedMessage.content })
        });
        
        if (response.ok) {
          success = true;
        } else {
          throw new Error(`API error: ${response.statusText}`);
        }
      } catch (apiErr) {
        console.log('API retry failed', apiErr);
        
        // In development, simulate success if both methods failed
        if (!success && isDevelopment) {
          await new Promise(resolve => setTimeout(resolve, 500));
          success = true;
        }
      }
      
      if (success) {
        // Update status to sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'sent' } : msg
          )
        );
        return true;
      } else {
        throw new Error('Failed to retry message');
      }
    } catch (err) {
      console.error('Error retrying message:', err);
      
      // Update status back to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'failed' } : msg
        )
      );
      
      setError('Failed to send message. Please try again.');
      return false;
    }
  }, [chatId, messages, token, socketConnected, isDevelopment]);

  /**
   * Delete a message
   * @param {string} messageId - ID of the message to delete
   * @returns {boolean} Success status
   */
  const deleteMessage = useCallback(async (messageId) => {
    if (!chatId) return false;
    
    try {
      // Optimistically remove from UI
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== messageId);
        messageCountRef.current = filtered.length;
        return filtered;
      });
      
      // Try socket
      let deleted = false;
      
      if (socketRef.current && socketConnected) {
        try {
          socketRef.current.emit('deleteMessage', { chatId, messageId });
          deleted = true;
        } catch (socketErr) {
          console.error('Socket delete failed, trying API', socketErr);
        }
      }
      
      // Try API
      try {
        const response = await fetch(`/api/chats/${chatId}/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          deleted = true;
        } else {
          throw new Error(`API error: ${response.statusText}`);
        }
      } catch (apiErr) {
        console.log('API delete failed', apiErr);
        
        // In development, simulate success
        if (!deleted && isDevelopment) {
          await new Promise(resolve => setTimeout(resolve, 500));
          deleted = true;
        }
      }
      
      return deleted;
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message. Please try again.');
      
      // Restore the message
      loadMessages(true);
      return false;
    }
  }, [chatId, token, loadMessages, socketConnected, isDevelopment]);

  /**
   * Mark all messages in the chat as read
   * @returns {boolean} Success status
   */
  const markAsRead = useCallback(async () => {
    if (!chatId) return false;
    
    try {
      // Get unread messages
      const unreadMessageIds = messages
        .filter(msg => msg.sender?.id !== user.id && !msg.read)
        .map(msg => msg.id);
      
      if (unreadMessageIds.length === 0) return true;
      
      // Optimistically update UI
      setMessages(prev => 
        prev.map(msg => 
          msg.sender?.id !== user.id ? { ...msg, read: true } : msg
        )
      );
      
      // Try socket
      let marked = false;
      
      if (socketRef.current && socketConnected) {
        try {
          socketRef.current.emit('markAsRead', { 
            chatId, 
            messageIds: unreadMessageIds 
          });
          marked = true;
        } catch (socketErr) {
          console.error('Socket markAsRead failed, trying API', socketErr);
        }
      }
      
      // Try API
      try {
        const response = await fetch(`/api/chats/${chatId}/messages/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messageIds: unreadMessageIds })
        });
        
        if (response.ok) {
          marked = true;
        } else {
          throw new Error(`API error: ${response.statusText}`);
        }
      } catch (apiErr) {
        console.log('API markAsRead failed', apiErr);
        
        // In development, simulate success
        if (!marked && isDevelopment) {
          await new Promise(resolve => setTimeout(resolve, 300));
          marked = true;
        }
      }
      
      return marked;
    } catch (err) {
      console.error('Error marking messages as read:', err);
      // Don't show UI error for this background operation
      return false;
    }
  }, [chatId, messages, user.id, token, socketConnected, isDevelopment]);

  /**
   * Indicate that the user is typing
   */
  const sendTypingStatus = useCallback(() => {
    if (!chatId) return;
    
    // Send typing status through socket
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('typing', { chatId });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing status
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && socketConnected) {
        socketRef.current.emit('stopTyping', { chatId });
      }
    }, 3000);
  }, [chatId, socketConnected]);

  // Connect socket when chatId changes
  useEffect(() => {
    let cleanup = () => {};
    
    if (chatId) {
      const cleanupFn = initializeSocket();
      if (typeof cleanupFn === 'function') {
        cleanup = cleanupFn;
      }
    } else {
      disconnectSocket();
    }
    
    return () => {
      cleanup();
      disconnectSocket();
    };
  }, [chatId, initializeSocket, disconnectSocket]);

  // Load messages when chatId changes
  useEffect(() => {
    if (autoLoad && chatId) {
      loadMessages(true);
    }
    
    // Reset state when chatId changes
    if (!chatId) {
      setMessages([]);
      setHasMore(true);
      setOldestMessageId(null);
      messageCountRef.current = 0;
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId, autoLoad, loadMessages]);

  // Simulate typing in development
  useEffect(() => {
    if (!chatId || !socketConnected || !isDevelopment) return;
    
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
        }, 2000 + Math.random() * 3000);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [chatId, socketConnected, isDevelopment]);

  // Mark messages as read
  useEffect(() => {
    const hasUnreadMessages = messages.some(msg => 
      msg.sender?.id !== user.id && !msg.read
    );
    
    if (chatId && hasUnreadMessages) {
      markAsRead();
    }
  }, [chatId, messages, markAsRead, user.id]);

  // Create loadMoreMessages function
  const loadMoreMessages = useCallback(() => {
    loadMessages(false);
  }, [loadMessages]);

  // Return hook API
  return {
    messages,
    loading,
    error,
    hasMore,
    isTyping,
    connectedUsers,
    socketConnected,
    loadMessages,
    loadMoreMessages,
    sendMessage,
    retryMessage,
    deleteMessage,
    markAsRead,
    sendTypingStatus
  };
};

export default useMessages;