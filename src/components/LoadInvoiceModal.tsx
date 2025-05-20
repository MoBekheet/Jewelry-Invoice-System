import React, { useState, useEffect } from 'react';
import { FileText, X, Trash2 } from 'lucide-react';
import { getSavedInvoices, loadInvoice, deleteInvoice } from '../utils/storage';
import { InvoiceData } from '../types/invoice';

interface LoadInvoiceModalProps {
  onClose: () => void;
  onLoad: (invoice: InvoiceData) => void;
}

const LoadInvoiceModal: React.FC<LoadInvoiceModalProps> = ({ onClose, onLoad }) => {
  const [savedInvoices, setSavedInvoices] = useState<string[]>([]);
  
  useEffect(() => {
    setSavedInvoices(getSavedInvoices());
  }, []);
  
  const handleLoad = (key: string) => {
    const invoice = loadInvoice(key);
    if (invoice) {
      onLoad(invoice);
      onClose();
    }
  };
  
  const handleDelete = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      deleteInvoice(key);
      setSavedInvoices(savedInvoices.filter(k => k !== key));
    }
  };
  
  const formatKey = (key: string) => {
    // Remove 'invoice-' prefix and format
    return key.replace('invoice-', '').replace(/^\d+$/, 'Untitled Invoice');
  };
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Load Saved Invoice</h3>
          <button 
            onClick={onClose}
            className="modal-close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          {savedInvoices.length === 0 ? (
            <p className="preview-info">No saved invoices found</p>
          ) : (
            <ul className="invoice-list">
              {savedInvoices.map((key) => (
                <li 
                  key={key} 
                  onClick={() => handleLoad(key)}
                  className="invoice-item"
                >
                  <div className="invoice-item-content">
                    <FileText className="invoice-icon" />
                    <span>{formatKey(key)}</span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(key, e)}
                    className="delete-button"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="button button-preview"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadInvoiceModal;