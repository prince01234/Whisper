import React from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const AlertMessage = ({ show, type, message, onClose }) => {
  if (!show) return null;
  
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
      type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertTriangle className="w-5 h-5" />
      )}
      <p>{message}</p>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AlertMessage;