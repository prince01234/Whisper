import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * ChatInput component for typing and sending messages
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Function to call when sending a message
 * @param {Function} props.onTyping - Function to call when user is typing
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {string} props.sendingStatus - Current status of message sending ('idle', 'sending', 'sent', 'failed')
 */
const ChatInput = ({
  onSendMessage,
  onTyping,
  disabled = false,
  sendingStatus = 'idle'
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Close emoji picker when clicking outside
  useClickOutside(emojiPickerRef, () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  });
  
  // Focus textarea on component mount
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);
  
  // Adjust textarea height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to calculate the right height
    textarea.style.height = 'auto';
    
    // Set the height based on the content (with a maximum)
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  }, [message]);
  
  /**
   * Handle typing in the textarea
   * @param {Event} e - Input event
   */
  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Send typing indicator with debounce
    if (onTyping && e.target.value.trim()) {
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Notify that user is typing
      onTyping(true);
      
      // Set timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    }
  };
  
  /**
   * Handle key press in the textarea (for Enter key to send)
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    // Send message on Enter (not Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  /**
   * Send the current message
   */
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    
    if (trimmedMessage || attachments.length > 0) {
      try {
        // Create message data with text and attachments
        const messageData = {
          content: trimmedMessage,
          attachments: attachments
        };
        
        // Send message through the provided callback
        await onSendMessage(messageData);
        
        // Clear the input
        setMessage('');
        setAttachments([]);
        
        // Reset typing indicator
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          if (onTyping) onTyping(false);
        }
        
        // Focus the textarea again
        textareaRef.current?.focus();
      } catch (err) {
        console.error('Error sending message:', err);
        // Error handling could be done here
      }
    }
  };
  
  /**
   * Toggle the emoji picker
   */
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  /**
   * Handle selecting an emoji
   * @param {Object} emojiData - Data about the selected emoji
   */
  const handleEmojiSelect = (emojiData) => {
    const emoji = emojiData.emoji;
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };
  
  /**
   * Open the file picker dialog
   */
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  /**
   * Handle file selection
   * @param {Event} e - Change event
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Create preview URLs and add files to attachments
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploading: false
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  /**
   * Remove an attachment
   * @param {string} id - Attachment ID to remove
   */
  const removeAttachment = (id) => {
    setAttachments(prev => {
      const filtered = prev.filter(attachment => attachment.id !== id);
      
      // Revoke object URLs for memory cleanup
      const removed = prev.find(attachment => attachment.id === id);
      if (removed && removed.url) {
        URL.revokeObjectURL(removed.url);
      }
      
      return filtered;
    });
  };
  
  /**
   * Toggle voice recording
   */
  const toggleVoiceRecording = () => {
    // This would be implemented with a voice recording library
    setIsRecording(!isRecording);
  };
  
  // Determine input status for styling
  const inputStatus = disabled ? 'disabled' : sendingStatus;
  
  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 max-h-20 overflow-y-auto px-1">
          {attachments.map(attachment => (
            <div key={attachment.id} className="relative group">
              {/* Preview based on file type */}
              {attachment.type.startsWith('image/') ? (
                <div className="w-16 h-16 rounded border border-gray-200 overflow-hidden">
                  <img 
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded border border-gray-200 flex items-center justify-center bg-gray-50 text-xs text-gray-500 overflow-hidden">
                  {attachment.name.split('.').pop().toUpperCase()}
                </div>
              )}
              
              {/* Remove button */}
              <button
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                onClick={() => removeAttachment(attachment.id)}
                aria-label="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Main input area */}
      <div className="flex items-end space-x-2">
        {/* Attachment button */}
        <button
          type="button"
          onClick={handleAttachmentClick}
          disabled={disabled}
          className={`flex-shrink-0 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Attach files"
        >
          <Paperclip size={20} />
        </button>
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />
        
        {/* Text input area */}
        <div className={`flex-1 relative rounded-2xl border ${
          inputStatus === 'disabled' 
            ? 'bg-gray-100 border-gray-200' 
            : inputStatus === 'sending'
              ? 'border-blue-300 bg-blue-50'
              : inputStatus === 'failed'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 focus-within:border-blue-400'
        }`}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || inputStatus === 'sending'}
            placeholder={
              inputStatus === 'sending' 
                ? 'Sending...' 
                : inputStatus === 'failed'
                  ? 'Failed to send. Try again.' 
                  : 'Type a message...'
            }
            className={`w-full py-2 px-3 max-h-32 rounded-2xl resize-none focus:outline-none ${
              disabled 
                ? 'bg-gray-100 text-gray-500' 
                : inputStatus === 'sending'
                  ? 'bg-blue-50 text-gray-600'
                  : inputStatus === 'failed'
                    ? 'bg-red-50 text-gray-800'
                    : 'bg-white text-gray-800'
            }`}
            rows={1}
          />
          
          {/* Emoji button */}
          <button
            type="button"
            onClick={toggleEmojiPicker}
            disabled={disabled || inputStatus === 'sending'}
            className={`absolute right-2 bottom-2 p-1 rounded-full ${
              disabled || inputStatus === 'sending'
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } focus:outline-none`}
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-2 z-10"
            >
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                searchDisabled={false}
                skinTonesDisabled={false}
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
        
        {/* Voice message button */}
        <button
          type="button"
          onClick={toggleVoiceRecording}
          disabled={disabled || attachments.length > 0 || isRecording}
          className={`flex-shrink-0 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isRecording 
              ? 'bg-red-500 text-white' 
              : disabled || attachments.length > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Record voice message'}
        >
          <Mic size={20} />
        </button>
        
        {/* Send button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={disabled || (message.trim() === '' && attachments.length === 0) || inputStatus === 'sending'}
          className={`flex-shrink-0 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            disabled || (message.trim() === '' && attachments.length === 0) || inputStatus === 'sending'
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;