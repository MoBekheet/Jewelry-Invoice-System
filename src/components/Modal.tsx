import React from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title, 
  message, 
  type = 'info',
  confirmText = 'حسناً',
  cancelText = 'إلغاء'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: '#ffffff',
          textColor: '#b91c1c',
          iconColor: '#dc2626',
          icon: <AlertTriangle size={24} />,
          buttonColor: '#dc2626'
        };
      case 'success':
        return {
          bgColor: '#ffffff',
          textColor: '#166534',
          iconColor: '#16a34a',
          icon: <CheckCircle2 size={24} />,
          buttonColor: '#16a34a'
        };
      default:
        return {
          bgColor: '#ffffff',
          textColor: '#0369a1',
          iconColor: '#0284c7',
          icon: <Info size={24} />,
          buttonColor: '#0284c7'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content"
        style={{
          backgroundColor: styles.bgColor,
          color: styles.textColor
        }}
      >
        <div className="modal-header">
          <div className="modal-title-container">
            <div className="modal-icon" style={{ color: styles.iconColor }}>
              {styles.icon}
            </div>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="modal-close-button"
            style={{ color: styles.iconColor }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {onConfirm ? (
            <>
              <button 
                onClick={onClose}
                className="modal-button modal-button-secondary"
              >
                {cancelText}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="modal-button modal-button-primary"
                style={{
                  backgroundColor: styles.buttonColor
                }}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="modal-button modal-button-primary"
              style={{
                backgroundColor: styles.buttonColor
              }}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal; 