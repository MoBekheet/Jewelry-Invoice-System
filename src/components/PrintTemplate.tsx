import React from 'react';
import { InvoiceData } from '../types/invoice';
import type { PrintSettings } from './PrintSettings';
import paperImage from '../assets/paper.jpg';

interface PrintTemplateProps {
  invoiceData: InvoiceData;
  printSettings: PrintSettings;
  isPreview?: boolean;
}

const PrintTemplate: React.FC<PrintTemplateProps> = ({ invoiceData, printSettings, isPreview = false }) => {
  // Early return if either required prop is missing
  if (!invoiceData || !printSettings || !printSettings.date || !printSettings.customerName || 
      !printSettings.mobileNumber || !printSettings.items || !printSettings.total) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString(),
      month: (date.getMonth() + 1).toString(),
      year: date.getFullYear().toString()
    };
  };

  const date = formatDate(invoiceData.date);

  return (
    <div className="print-template" style={{ position: 'relative', width: '148mm', height: '210mm', overflow: 'hidden' }}>
      {/* Background image for preview only */}
      {isPreview && (
        <img
          src={paperImage}
          alt="نموذج الفاتورة"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            right: 0,
            zIndex: 0,
            opacity: 0.6,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      )}

      {/* Date */}
      <div
        className="date-container"
        style={{
          position: 'absolute',
          top: `${printSettings.date.top}mm`,
          right: `${printSettings.date.right}mm`,
          width: `${printSettings.date.width}mm`,
          fontSize: `${printSettings.date.fontSize}px`,
          direction: 'rtl',
          zIndex: 1
        }}
      >
        <span className="date-day">{date.day}</span>
        <span className="date-month">{date.month}</span>
        <span className="date-year">{date.year}</span>
      </div>

      {/* Customer Name */}
      <div
        className="customer-name"
        style={{
          position: 'absolute',
          top: `${printSettings.customerName.top}mm`,
          right: `${printSettings.customerName.right}mm`,
          width: `${printSettings.customerName.width}mm`,
          fontSize: `${printSettings.customerName.fontSize}px`,
          direction: 'rtl',
          fontWeight: 600,
          zIndex: 1
        }}
      >
        {invoiceData.customerName}
      </div>

      {/* Mobile Number */}
      <div
        className="mobile-number"
        style={{
          position: 'absolute',
          top: `${printSettings.mobileNumber.top}mm`,
          right: `${printSettings.mobileNumber.right}mm`,
          width: `${printSettings.mobileNumber.width}mm`,
          fontSize: `${printSettings.mobileNumber.fontSize}px`,
          direction: 'rtl',
          fontWeight: 600,
          zIndex: 1
        }}
      >
        {invoiceData.mobileNumber}
      </div>

      {/* Items */}
      {invoiceData.items.map((item, index) => {
        const itemTop = printSettings.items.description.top + (index * 10); // 10mm spacing between items
        return (
          <div key={item.id} className="item-row" style={{ top: `${itemTop}mm`, position: 'absolute', width: '100%', zIndex: 1 }}>
            {/* Description */}
            <div
              className="item-description"
              style={{
                position: 'absolute',
                right: `${printSettings.items.description.right}mm`,
                width: `${printSettings.items.description.width}mm`,
                fontSize: `${printSettings.items.description.fontSize}px`,
                direction: 'rtl',
                fontWeight: 600
              }}
            >
              {item.description}
            </div>

            {/* Weight */}
            <div
              className="item-weight"
              style={{
                position: 'absolute',
                right: `${printSettings.items.weight.right}mm`,
                width: `${printSettings.items.weight.width}mm`,
                fontSize: `${printSettings.items.weight.fontSize}px`,
                direction: 'rtl',
                fontWeight: 600
              }}
            >
              {item.weight.grams}.{item.weight.milligrams}
            </div>

            {/* Karat */}
            <div
              className="item-karat"
              style={{
                position: 'absolute',
                right: `${printSettings.items.karat.right}mm`,
                width: `${printSettings.items.karat.width}mm`,
                fontSize: `${printSettings.items.karat.fontSize}px`,
                direction: 'rtl',
                fontWeight: 600
              }}
            >
              {item.karat}
            </div>

            {/* Price */}
            <div
              className="item-price"
              style={{
                position: 'absolute',
                right: `${printSettings.items.price.right}mm`,
                width: `${printSettings.items.price.width}mm`,
                fontSize: `${printSettings.items.price.fontSize}px`,
                direction: 'rtl',
                fontWeight: 600
              }}
            >
              {item.price.pound}.{item.price.piaster}
            </div>

            {/* Value */}
            <div
              className="item-value"
              style={{
                position: 'absolute',
                right: `${printSettings.items.value.right}mm`,
                width: `${printSettings.items.value.width}mm`,
                fontSize: `${printSettings.items.value.fontSize}px`,
                direction: 'rtl',
                fontWeight: 600
              }}
            >
              {item.value.pound}.{item.value.piaster}
            </div>
          </div>
        );
      })}

      {/* Total */}
      <div
        className="total-amount"
        style={{
          position: 'absolute',
          top: `${printSettings.total.top}mm`,
          right: `${printSettings.total.right}mm`,
          width: `${printSettings.total.width}mm`,
          fontSize: `${printSettings.total.fontSize}px`,
          direction: 'rtl',
          fontWeight: 'bold',
          zIndex: 1
        }}
      >
        {invoiceData.totalAmount} ج.م
      </div>
    </div>
  );
};

export default PrintTemplate;