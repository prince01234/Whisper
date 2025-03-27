import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Reusable modal component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer content
 * @param {string} props.size - Modal size (sm, md, lg, xl, 2xl, full)
 * @param {boolean} props.closeOnOverlayClick - Whether clicking the overlay closes the modal
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full mx-4'
  };
  
  // Handle Escape key press
  React.useEffect(() => {
    // Only run the effect if the modal is open
    if (!isOpen) return;
    
    // Only run this effect in browser environments
    if (typeof window === 'undefined') return;
    
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose();
    }
  };
  
  // Safely access size class
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // If not open, don't render anything (MOVED HERE after all hooks)
  if (!isOpen) return null;
  
  // SSR safety check
  if (typeof document === 'undefined') {
    return null;
  }
  
  try {
    return createPortal(
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        onClick={handleOverlayClick}
      >
        <div 
          className={`${sizeClass} w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 
              id="modal-title"
              className="text-lg font-medium text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  } catch (error) {
    console.error('Error rendering modal:', error);
    return null;
  }
};

export default Modal;