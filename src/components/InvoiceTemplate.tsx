import React from 'react';
import '../styles/invoice.css';

interface InvoiceTemplateProps {
  onInputChange?: (field: string, value: string) => void;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ onInputChange }) => {
  const handleChange = (field: string, value: string) => {
    if (onInputChange) {
      onInputChange(field, value);
    }
  };

  return (
    <div className="invoice-page" dir="rtl">
      {/* Date Section */}
      <div className="date-section">
        <span>1 / </span>
        <input 
          type="text" 
          className="date-input"
          placeholder="ت."
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </div>

      {/* Main Table */}
      <div className="main-table">
        <table>
          <thead>
            <tr>
              <th style={{ width: '2cm' }}>الصفحة</th>
              <th style={{ width: '2.5cm' }}>هدف</th>
              <th style={{ width: '2.5cm' }}>عيار</th>
              <th style={{ width: '3cm' }}>الوزن</th>
              <th style={{ width: '4cm' }}>القيمة</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index}>
                <td><input type="text" className="table-input" /></td>
                <td><input type="text" className="table-input" /></td>
                <td><input type="text" className="table-input" /></td>
                <td><input type="text" className="table-input" /></td>
                <td><input type="text" className="table-input" /></td>
              </tr>
            ))}
            <tr className="total-row">
              <td>الإجمالي</td>
              <td></td>
              <td></td>
              <td></td>
              <td><input type="text" className="table-input total-input" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Customer Notice */}
      <div className="customer-notice">
        على العميل مراجعة الوزن في خلال ثلاثة أيام...
      </div>

      {/* Mobile Number */}
      <div className="mobile-section">
        <span className="mobile-checkbox">☐</span>
        <input 
          type="text" 
          className="mobile-input"
          placeholder="رقم الموبايل"
          onChange={(e) => handleChange('mobile', e.target.value)}
        />
      </div>
    </div>
  );
};

export default InvoiceTemplate;