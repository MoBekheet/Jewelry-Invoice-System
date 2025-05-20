import React from 'react';
import { InvoiceData } from '../types/invoice';
import '../styles/print.css';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  isPrintMode?: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData, isPrintMode = false }) => {
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return { day, month, year };
  };

  const dateParts = formatDate(invoiceData.date);

  return (
    <div className={isPrintMode ? 'print-content' : 'preview-container'}>
      <div className="invoice-preview">
        <div className="text-position-date">
          <div className="date-day">{dateParts.day}</div>
          <div className="date-month">{dateParts.month}</div>
          <div className="date-year">{dateParts.year}</div>
        </div>
        
        <div className="text-position-customer-name">
          {invoiceData.customerName}
        </div>
        
        <div className="text-position-mobile-number">
          {invoiceData.mobileNumber}
        </div>
        
        <div className="items-table">
          {invoiceData.items.map((item, index) => (
            <div key={item.id} className="item-row">
              <div className="item-cell item-description">{item.description}</div>
              <div className="item-cell item-price">
                {item.price.pound}{item.price.piaster ? `.${item.price.piaster}` : ''}
              </div>
              <div className="item-cell item-karat">{item.karat}</div>
              <div className="item-cell item-weight">
                {item.weight.grams}{item.weight.milligrams ? `.${item.weight.milligrams}` : ''}
              </div>
              <div className="item-cell item-value">{item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
        
        <div className="text-position-total">
          {invoiceData.totalAmount.toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;