import React from 'react';
import { InvoiceData } from '../types/invoice';
import '../styles/print.css';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData }) => {
  const toArabicNumerals = (num: number | string): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
  };

  const toEnglishNumerals = (str: string): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[٠-٩]/g, (d) => arabicNumerals.indexOf(d).toString());
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return { day: '--', month: '--', year: '----' };
    
    // Convert Arabic numerals to English if present
    const englishDate = toEnglishNumerals(dateString);
    const date = new Date(englishDate);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { day: '--', month: '--', year: '----' };
    }

    return {
      day: toArabicNumerals(date.getDate()),
      month: toArabicNumerals(date.getMonth() + 1),
      year: toArabicNumerals(date.getFullYear())
    };
  };

  const dateParts = formatDate(invoiceData.date);

  return (
    <div id="print-area" dir="rtl" style={{ 
      width: '16cm', 
      height: '20cm', 
      position: 'relative', 
      margin: '0 auto', 
      padding: 0, 
      fontFamily: 'NotoKufiArabic, sans-serif',
      fontWeight: 700,
      fontSize: '18px'
    }}>
     
      
      {/* Header Section */}
      <div style={{ position: 'absolute', top: '3.5cm', width: '16cm', height: '1.5cm' }}>
        {/* Date Fields */}
        <div style={{ position: 'absolute', top: '0.3cm', right: '1.7cm', width: '1.5cm', textAlign: 'center' }}>
          {dateParts.day}
        </div>
        <div style={{ position: 'absolute', top: '0.3cm', right: '3.1cm', width: '1.5cm', textAlign: 'center' }}>
          {dateParts.month}
        </div>
        <div style={{ position: 'absolute', top: '0.3cm', right: '4.9cm', width: '1.5cm', textAlign: 'center' }}>
          {dateParts.year}
        </div>
        
        {/* Customer Name */}
        <div style={{ position: 'absolute', top: '0.95cm', right: '2cm', width: '5.8cm', textAlign: 'center' }}>
          {invoiceData.customerName || '---'}
        </div>
        
        {/* Phone Number */}
        <div style={{ position: 'absolute', top: '0.85cm', right: '7cm', width: '3cm', textAlign: 'center' }}>
          {invoiceData.mobileNumber || '---'}
        </div>
      </div>
      
      {/* Items Table */}
      <div style={{ position: 'absolute', top: '5.3cm', width: '16cm' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
          <tbody>
            {invoiceData.items.map((item, index) => {
              // Convert Arabic numbers to English before calculations
              const weightGrams = Number(toEnglishNumerals(item.weight.grams.toString()));
              const weightMilligrams = Number(toEnglishNumerals(item.weight.milligrams?.toString() || '0'));
              const pricePound = Number(toEnglishNumerals(item.price.pound.toString()));
              const pricePiaster = item.price.piaster ? Number(toEnglishNumerals(item.price.piaster.toString())) : 0;
              const karat = Number(toEnglishNumerals(item.karat.toString()));
              
              // Calculate total
              const total = weightGrams * (pricePound + (pricePiaster / 100));

              return (
                <tr key={index} style={{ height: '0.65cm' }}>
                  {/* Total Value */}
                  <td style={{ width: '2.0cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {toArabicNumerals(Math.floor(total))}
                  </td>
                  
                  {/* Weight in Milligrams */}
                  <td style={{ width: '1.6cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {weightMilligrams > 0 ? toArabicNumerals(weightMilligrams) : '00'}
                  </td>

                  {/* Weight in Grams */}
                  <td style={{ width: '1.6cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {toArabicNumerals(Math.floor(weightGrams))}
                  </td>
                  
                  {/* Karat */}
                  <td style={{ width: '1.8cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {toArabicNumerals(karat)}
                  </td>
                  
                  {/* Price in Piasters */}
                  <td style={{ width: '1.2cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {pricePiaster ? toArabicNumerals(pricePiaster) : '00'}
                  </td>
                  
                  {/* Price in Pounds */}
                  <td style={{ width: '1.6cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {toArabicNumerals(pricePound)}
                  </td>
                  
                  {/* Description */}
                  <td style={{ width: '5.2cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                    {item.description || ''}
                  </td>
                </tr>
              );
            })}

            {/* Empty Rows */}
            {Array(18 - invoiceData.items.length).fill(0).map((_, index) => (
              <tr key={`empty-${index}`} style={{ height: '0.65cm' }}>
                <td style={{ width: '2.0cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.6cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.6cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.8cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.2cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.6cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '5.2cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoicePreview;
