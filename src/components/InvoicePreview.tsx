import React from 'react';
import { InvoiceData } from '../types/invoice';
import '../styles/print.css';
import paperImage from '../assets/paper.jpg';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  isPrintMode?: boolean;
}

// Function to format number with thousand separators
const formatNumber = (value: string | number): string => {
  if (!value) return '';
  // Convert to string and remove any existing commas
  const stringValue = value.toString().replace(/,/g, '');
  // Split the number into integer and decimal parts
  const parts = stringValue.split('.');
  // Format the integer part with commas
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  // Return the formatted number with decimal part only if it exists and is not zero
  if (parts.length > 1 && parts[1] !== '00' && parts[1] !== '0') {
    return `${integerPart}.${parts[1]}`;
  }
  return integerPart;
};

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData, isPrintMode = false }) => {
  // Function to format date into separate parts
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: (date.getMonth() + 1).toString().padStart(2, '0'),
      year: date.getFullYear().toString()
    };
  };

  const dateParts = formatDate(invoiceData.date);

  return (
    <div className={isPrintMode ? 'print-content' : 'preview-container'}>
      <div className="invoice-preview">
        {!isPrintMode && (
          <img
            src={paperImage}
            alt="نموذج الفاتورة"
          />
        )}
        
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
        
        {invoiceData.items.map((item, index) => {
          return (
            <div key={item.id} className="item-row" style={{ top: `${84.5 + (index * 7)}mm` }}>
              <div className="item-cell item-description">{item.description}</div>
              {/* الفئة */}
              <div className="item-cell item-price-pound">{formatNumber(item.price.pound)}</div>
              <div className="item-cell item-price-piaster">{item.price.piaster || '00'}</div>
              {/* العيار */}
              <div className="item-cell item-karat">{formatNumber(item.karat)}</div>
              {/* الوزن */}
              <div className="item-cell item-weight-pound">{formatNumber(item.weight.grams)}</div>
              <div className="item-cell item-weight-piaster">{item.weight.milligrams || '00'}</div>
              {/* القيمة */}
              <div className="item-cell item-value">
                {formatNumber(item.total)}
              </div>
            </div>
          );
        })}
        
        <div className="text-position-total">
          {formatNumber(invoiceData.totalAmount)} ج.م
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
