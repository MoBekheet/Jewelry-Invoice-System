import React from 'react';
import { InvoiceData } from '../types/invoice';
import '../styles/print.css';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  isPrintMode?: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData, isPrintMode = false }) => {
  return (
    <div className={isPrintMode ? 'print-content' : 'preview-container'}>
      <div className="invoice-preview">
        {/* Date */}
        <div className="text-position-date">
          {invoiceData.date}
        </div>
        
        {/* Mobile Number */}
        <div className="text-position-mobile-number">
          {invoiceData.mobileNumber}
        </div>
        
        {/* Customer Name */}
        <div className="text-position-customer-name">
          {invoiceData.customerName}
        </div>
        
        {/* Items Table */}
        <div className="items-table">
          {invoiceData.items.slice(0, 14).map((item, index) => (
            <div key={item.id} className="item-row">
              <div className="item-cell item-description">{item.description}</div>
              <div className="item-cell item-price">{item.price.pound}</div>
              <div className="item-cell item-price">{item.price.piaster}</div>
              <div className="item-cell item-karat">{item.karat}</div>
              <div className="item-cell item-weight">
                {item.weight.grams}
              </div>
              <div className="item-cell item-value">
                {item.total.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Total Row */}
        <div className="total-row">
          <span className="total-label">الإجمالي</span>
          <span className="total-value">{invoiceData.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;