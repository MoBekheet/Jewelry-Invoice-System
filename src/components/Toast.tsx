import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: '#fee2e2',
          borderColor: '#fecaca',
          textColor: '#b91c1c',
          icon: <AlertCircle size={20} />
        };
      case 'success':
        return {
          bgColor: '#dcfce7',
          borderColor: '#bbf7d0',
          textColor: '#166534',
          icon: <CheckCircle2 size={20} />
        };
      default:
        return {
          bgColor: '#f0f9ff',
          borderColor: '#bae6fd',
          textColor: '#0369a1',
          icon: <Info size={20} />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div 
      className="toast"
      style={{
        backgroundColor: styles.bgColor,
        borderColor: styles.borderColor,
        color: styles.textColor
      }}
    >
      <div className="toast-icon">
        {styles.icon}
      </div>
      <div className="toast-message">{message}</div>
      <button 
        onClick={onClose}
        className="toast-close"
        style={{ color: styles.textColor }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast; 