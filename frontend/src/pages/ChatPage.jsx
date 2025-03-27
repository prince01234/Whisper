import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Menu, Search, Paperclip, Send, Smile, Check, CheckCheck, RefreshCw } from 'lucide-react';

// Components
import Sidebar from '../components/Chat/Sidebar';
import Message from '../components/Chat/Message';
import Avatar from '../components/Common/Avatar';
import Loading from '../components/Common/Loading';
import NewChatModal from '../components/Chat/NewChatModal';

// Mock data and functions for development
const mockConversations = [
  {
    id: '1',
    name: 'Euphoric',
    lastMessage: 'Hey, how are you?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unreadCount: 2,
    isGroup: false,
    participants: [{ id: 'user1', username: 'Euphoric', status: 'online' }]
  },
  {
    id: '2',
    name: 'Whisper Dev Team',
    lastMessage: 'Meeting at 2pm',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    unreadCount: 0,
    isGroup: true,
    participants: [
      { id: 'user1', username: 'Euphoric', status: 'online' },
      { id: 'user2', username: 'Euphoria', status: 'offline' },
      { id: 'user3', username: 'Prince', status: 'away' }
    ]
  }
];

const mockGetMessages = async (conversationId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    messages: [
      {
        id: '1',
        conversationId,
        content: 'Hey there! How are you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        sender: { id: 'user2', username: 'Euphoria' },
        status: 'read'
      },
      {
        id: '2',
        conversationId,
        content: 'I\'m doing great! How about you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
        sender: { id: 'currentUser', username: 'You' },
        status: 'read'
      },
      {
        id: '3',
        conversationId,
        content: 'Pretty good! Just working on that project we discussed.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        sender: { id: 'user2', username: 'Euphoria' },
        status: 'read'
      }
    ]
  };
};

const mockSendMessage = async (conversationId, messageData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    id: `msg-${Date.now()}`,
    conversationId,
    content: messageData.content,
    timestamp: new Date(),
    sender: { id: 'currentUser', username: 'You' },
    status: 'sent'
  };
};

// Date formatting utilities
const formatMessageDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

// Mock storage functions
const mockDrafts = {};

const getMessageDraft = (conversationId) => {
  return mockDrafts[conversationId] || '';
};

const setMessageDraft = (conversationId, draft) => {
  if (draft) {
    mockDrafts[conversationId] = draft;
  } else {
    delete mockDrafts[conversationId];
  }
};

// Mock typing status function
const setTypingStatus = (conversationId, isTyping) => {
  console.log(`User is ${isTyping ? 'typing' : 'not typing'} in conversation ${conversationId}`);
  return true;
};

/**
 * Main chat page component - displays sidebar and chat area
 */
const ChatPage = () => {
  // Get dark mode setting from localStorage (will update when SettingsView changes it)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // State variables
  const [conversations, setConversations] = useState(mockConversations);
  const [contacts, setContacts] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [error, setError] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const wsRef = useRef(null);
  const currentConversationRef = useRef(null);
  const darkModeCheckRef = useRef(null);

  // Hooks
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  // Improved dark mode detection to reduce flickering
  useEffect(() => {
    // Function to check dark mode status
    const checkDarkMode = () => {
      const darkModeFromStorage = localStorage.getItem('darkMode') === 'true';
      if (darkModeFromStorage !== isDarkMode) {
        setIsDarkMode(darkModeFromStorage);
      }
    };
    
    // Listen for storage events (when other tabs change the value)
    const handleStorageChange = (e) => {
      if (e.key === 'darkMode') {
        setIsDarkMode(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check once on mount
    checkDarkMode();
    
    // Set a less frequent interval (every 5 seconds instead of every 1 second)
    darkModeCheckRef.current = setInterval(checkDarkMode, 5000);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(darkModeCheckRef.current);
    };
  }, [isDarkMode]); 

  // Memoize handleIncomingMessage to prevent recreating on each render
  const handleIncomingMessage = useCallback((message) => {
    // Update messages if the message belongs to current conversation
    if (message.conversationId === currentConversationRef.current) {
      setMessages(prevMessages => [...prevMessages, message]);
    }
    
    // Update conversations list with new message
    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            lastMessage: message.content,
            lastMessageTime: message.timestamp,
            unreadCount: currentConversationRef.current === conv.id ? 0 : conv.unreadCount + 1
          };
        }
        return conv;
      });
    });
  }, []);

  // Keep the currentConversationRef updated with the selected conversation ID
  useEffect(() => {
    currentConversationRef.current = selectedConversation?.id;
  }, [selectedConversation]);

  // On mount, load conversations and contacts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // No need to set conversations, we initialize with mock data
        
        // Fetch contacts
        try {
          // Mock data for now
          setContacts([
            { id: 'user1', username: 'Eup', status: 'online', email: 'eup@example.com' },
            { id: 'user2', username: 'Euphoria', status: 'offline', email: 'euphoria@example.com' },
            { id: 'user3', username: 'Prince', status: 'away', email: 'prince@example.com' }
          ]);
        } catch (contactErr) {
          console.error('Error fetching contacts:', contactErr);
          setContacts([]);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load chats. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Set up WebSocket connection - only once when component mounts
  useEffect(() => {
    console.log('Setting up WebSocket connection...');
    
    // In a real implementation, this would be your WebSocket connection
    const socket = {
      close: () => console.log('Cleaning up WebSocket connection...'),
      send: (data) => console.log('Sending data via WebSocket:', data),
      // Mock method to simulate receiving a message (for development)
      simulateIncomingMessage: (messageData) => handleIncomingMessage(messageData)
    };
    
    // Store the socket in the ref
    wsRef.current = socket;
    
    // Clean up the WebSocket connection when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [handleIncomingMessage]);
  
  // Update WebSocket subscription when conversation changes
  useEffect(() => {
    if (!wsRef.current || !selectedConversation) return;
    
    console.log('Subscribing to conversation:', selectedConversation.id);
    
    // For demonstration purposes
    wsRef.current.send(JSON.stringify({
      type: 'join_conversation',
      conversationId: selectedConversation.id
    }));
    
    return () => {
      if (wsRef.current && selectedConversation) {
        console.log('Unsubscribing from conversation:', selectedConversation.id);
      }
    };
  }, [selectedConversation]);

  // Load messages when conversation is selected - improved to reduce flickering
  useEffect(() => {
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }
    
    if (conversations.length === 0) return;
    
    const loadConversation = async () => {
      try {
        setLoadingMessages(true);
        
        // Find the selected conversation in our list
        const conversation = conversations.find(c => c.id === conversationId);
        
        if (conversation) {
          setSelectedConversation(conversation);
          
          // Get messages for this conversation using our mock function
          try {
            console.log('Fetching messages for conversation:', conversationId);
            const response = await mockGetMessages(conversationId);
            
            // Use a small delay before updating messages to reduce flickering
            setTimeout(() => {
              setMessages(response.messages || []);
              setLoadingMessages(false);
            }, 100);
            
            // Clear unread count for this conversation
            setConversations(prevConversations => {
              return prevConversations.map(conv => {
                if (conv.id === conversationId) {
                  return { ...conv, unreadCount: 0 };
                }
                return conv;
              });
            });
            
            // Load draft message
            try {
              const draft = getMessageDraft(conversationId);
              setMessageInput(draft || '');
            } catch (draftErr) {
              console.error('Error loading draft:', draftErr);
            }
          } catch (msgErr) {
            console.error('Error fetching messages:', msgErr);
            setMessages([]);
            setError('Failed to load messages. Please try again.');
            setLoadingMessages(false);
          }
        } else {
          // Conversation not found, redirect to main chat page
          navigate('/chat');
          setSelectedConversation(null);
          setLoadingMessages(false);
        }
      } catch (err) {
        console.error('Error loading conversation:', err);
        setError('Failed to load conversation. Please try again.');
        setLoadingMessages(false);
      }
    };
    
    loadConversation();
  }, [conversationId, conversations, navigate]);

  // Improved: Scroll to bottom when messages change - with delay
  useEffect(() => {
    if (messages.length > 0) {
      const scrollTimer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(scrollTimer);
    }
  }, [messages]);

  // Focus input when conversation changes - with delay
  useEffect(() => {
    if (selectedConversation) {
      const focusTimer = setTimeout(() => {
        messageInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(focusTimer);
    }
  }, [selectedConversation]);

  // Handle message typing and debounced typing indicator
  const handleMessageInput = useCallback((e) => {
    const value = e.target.value;
    setMessageInput(value);
    
    // Save draft message
    if (selectedConversation) {
      try {
        setMessageDraft(selectedConversation.id, value);
      } catch (err) {
        console.error('Error saving draft:', err);
      }
    }
    
    // Handle typing indicator
    if (selectedConversation) {
      if (!isTyping) {
        setIsTyping(true);
        try {
          setTypingStatus(selectedConversation.id, true);
        } catch (err) {
          console.error('Error setting typing status:', err);
        }
      }
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set a new timeout to stop typing indicator after 2 seconds
      const timeout = setTimeout(() => {
        setIsTyping(false);
        try {
          setTypingStatus(selectedConversation.id, false);
        } catch (err) {
          console.error('Error clearing typing status:', err);
        }
      }, 2000);
      
      setTypingTimeout(timeout);
    }
  }, [selectedConversation, isTyping, typingTimeout]);

  // Handle sending a message
  const handleSendMessage = useCallback(async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    
    if (!messageInput.trim() || !selectedConversation) return;
    
    try {
      const newMessageData = {
        content: messageInput.trim(),
        timestamp: new Date(),
        sender: { id: 'currentUser', username: 'You' },
        status: 'sending'
      };
      
      // Optimistically add message to UI
      const optimisticId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        ...newMessageData,
        conversationId: selectedConversation.id
      };
      
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      setMessageInput('');
      
      // Clear draft
      try {
        setMessageDraft(selectedConversation.id, '');
      } catch (err) {
        console.error('Error clearing draft:', err);
      }
      
      // Improved error handling for sendMessage
      let response;
      try {
        // Use our mock send message function
        response = await mockSendMessage(selectedConversation.id, {
          content: newMessageData.content
        });
      } catch (sendErr) {
        console.error('Error sending message:', sendErr);
        
        // Mark message as failed
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === optimisticId ? { ...msg, status: 'failed' } : msg
          )
        );
        
        setError('Failed to send message. Please try again.');
        return; // Exit early - don't update the conversation
      }
      
      // Ensure we have a valid response
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      // Replace temp message with real one from server
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === optimisticId ? { 
            ...msg,
            id: response.id || msg.id,
            status: 'sent',
            // Copy other fields from response if available
            ...(response.content && { content: response.content }),
            ...(response.timestamp && { timestamp: response.timestamp }),
            ...(response.sender && { sender: response.sender }),
          } : msg
        )
      );
      
      // Update conversation in list
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              lastMessage: newMessageData.content,
              lastMessageTime: newMessageData.timestamp
            };
          }
          return conv;
        });
      });
    } catch (err) {
      console.error('Error in message sending flow:', err);
      
      // Mark message as failed
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id.startsWith('temp-') ? { ...msg, status: 'failed' } : msg
        )
      );
      
      setError(err.message || 'Failed to send message. Please try again.');
    }
  }, [messageInput, selectedConversation]);

  // IMPORTANT FIX: Group messages by date - changed from useCallback to useMemo
  const groupedMessages = useMemo(() => {
    const groups = {};
    
    messages.forEach(message => {
      let date = 'Unknown';
      try {
        date = formatMessageDate(message.timestamp);
      } catch (err) {
        console.error('Error formatting message date:', err);
      }
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }, [messages]);

  // Handle creating a new chat
  const handleCreateChat = useCallback(async (chatData) => {
    try {
      // Process the data from NewChatModal
      console.log('Creating new chat:', chatData);
      
      // Create new conversation object
      const newConversation = {
        id: `new-${Date.now()}`,
        name: chatData.name || (chatData.selectedUsers?.[0]?.username || 'New Chat'),
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: 0,
        isGroup: chatData.tab === 'group',
        participants: chatData.selectedUsers || []
      };
      
      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      
      // Navigate to the new conversation
      navigate(`/chat/${newConversation.id}`);
      
      // Close the modal
      setNewChatModalOpen(false);
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat. Please try again.');
    }
  }, [navigate]);

  return (
    // Make the chat take full screen by setting fixed dimensions
    <div className={`flex h-screen w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`} style={{ minHeight: '100vh' }}>
      {/* Mobile sidebar toggle */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-30 p-3 bg-blue-500 text-white rounded-full shadow-lg"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      >
        {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <div 
        className={`${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 fixed lg:static top-0 left-0 z-20 h-full w-80 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-r flex flex-col`}
      >
        <Sidebar 
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onNewChat={() => setNewChatModalOpen(true)}
          onSelectConversation={(id) => {
            navigate(`/chat/${id}`);
            setMobileSidebarOpen(false);
          }}
          loading={loading}
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Chat header - Simplified */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3 flex justify-between items-center`}>
              <div className="flex items-center">
                <Avatar 
                  name={selectedConversation.name}
                  size="md"
                  status={selectedConversation.isGroup ? undefined : selectedConversation.participants[0]?.status}
                  isGroup={selectedConversation.isGroup}
                />
                <div className="ml-3">
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {selectedConversation.name}
                  </h2>
                  {!selectedConversation.isGroup && selectedConversation.participants[0] && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {selectedConversation.participants[0].status === 'online' 
                        ? 'Online' 
                        : 'Offline'}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {/* Just keeping the search icon */}
                <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}>
                  <Search size={20} />
                </button>
              </div>
            </div>
            
            {/* Messages area */}
            <div 
              ref={messagesContainerRef}
              className={`flex-1 overflow-y-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
            >
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loading size="lg" color={isDarkMode ? 'white' : 'blue'} />
                </div>
              ) : messages.length === 0 ? (
                <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>
                  <p className="text-lg mb-2">No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* CRITICAL FIX: Remove function call parentheses () */}
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="flex justify-center my-4">
                        <div className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} px-3 py-1 rounded-full text-xs`}>
                          {date}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {msgs.map((message) => (
                          <Message
                            key={message.id}
                            message={message}
                            time={formatMessageTime(message.timestamp)}
                            isOwn={message.sender.id === 'currentUser'}
                            status={message.status}
                            onRetry={() => {
                              // Remove failed message and retry sending
                              setMessages(prevMessages => 
                                prevMessages.filter(msg => msg.id !== message.id)
                              );
                              setMessageInput(message.content);
                              setTimeout(() => messageInputRef.current?.focus(), 0);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Message input area - Simplified */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-4 py-3`}>
              <form onSubmit={handleSendMessage} className="flex items-end">
                <button 
                  type="button"
                  className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'} mr-2`}
                >
                  <Paperclip size={20} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={messageInput}
                    onChange={handleMessageInput}
                    placeholder="Type a message..."
                    className={`w-full border ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' 
                        : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    } rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:ring-2 resize-none`}
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    type="button"
                    className={`absolute right-3 bottom-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Smile size={20} />
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`ml-2 p-2 rounded-full ${
                    messageInput.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className={`flex flex-col items-center justify-center h-full ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
            <div className={`w-64 h-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-full flex items-center justify-center mb-4`}>
              <Send size={64} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your Messages</h2>
            <p className="text-center max-w-md mb-6">
              Send private messages to a friend or group
            </p>
            <button
              onClick={() => setNewChatModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Start a Conversation
            </button>
          </div>
        )}
      </div>
      
      {/* New chat modal */}
      <NewChatModal
        isOpen={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onCreateChat={handleCreateChat}
        contacts={contacts}
        loading={loading}
      />
      
      {/* Error message */}
      {error && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${
          isDarkMode 
            ? 'bg-red-900/60 border-red-800 text-red-200' 
            : 'bg-red-100 border-red-400 text-red-700'
        } border px-4 py-3 rounded z-50 flex items-center`}>
          <span>{error}</span>
          <button 
            className={isDarkMode ? 'ml-4 text-red-200' : 'ml-4 text-red-700'}
            onClick={() => setError(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;