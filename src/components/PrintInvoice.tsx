import React from 'react';
import {InvoiceData} from '../types/invoice';
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
    return str.replace(/،/g, '').replace(/[٠-٩]/g, (d) => arabicNumerals.indexOf(d).toString());
  };

  // Helper function to format numbers with Arabic thousand separators and Arabic numerals
  const formatNumberWithArabicThousands = (num: number | string | undefined | null): string => {
    if (num === null || num === undefined || num === '') return '';
    const stringValue = String(num).replace(/,/g, '').replace(/،/g, ''); // Remove any commas (English or Arabic)

    // Check if the cleaned value is a valid number before formatting
    if (isNaN(parseFloat(stringValue))) return String(num); // Return original if not a valid number for parsing

    // Convert to English temporarily for standard number formatting
    const englishValue = stringValue.replace(/[٠-٩]/g, (d) => 
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    );

    const parts = englishValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '،'); // Use Arabic comma
    const formattedNumber = parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    
    // Convert the formatted number string (with Arabic commas and English decimal point) to Arabic numerals
     // Arabic digits
    return formattedNumber.replace(/[0-9]/g, (d) =>
        String(['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'][parseInt(d)])
    );
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
        <div style={{ position: 'absolute', top: '0.4cm', right: '2.5cm', width: '1cm', textAlign: 'center' }}>
          {dateParts.day}
        </div>
        <div style={{ position: 'absolute', top: '0.4cm', right: '3.5cm', width: '1cm', textAlign: 'center' }}>
          {dateParts.month}
        </div>
        <div style={{ position: 'absolute', top: '0.4cm', right: '5.1cm', width: '1cm', textAlign: 'center' }}>
          {dateParts.year}
        </div>
        
        {/* Customer Name */}
        <div style={{ position: 'absolute', top: '0.95cm', right: '3cm', width: '4.8cm', textAlign: 'center' }}>
          {invoiceData.customerName || '---'}
        </div>
        
        {/* Phone Number */}
        <div style={{ position: 'absolute', top: '0.95cm', right: '9cm', width: '3cm', textAlign: 'center' }}>
          {invoiceData.mobileNumber || '---'}
        </div>
      </div>
      
      {/* Items Table */}
      <div style={{ position: 'absolute', top: '7.3cm', width: '14.5cm', right: '0.85cm', height: '12cm', padding: '0' }}>
        {/*<div style={{ position: 'absolute', top: '5.3cm', width: '16cm' }}>*/}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
          <tbody>
            {invoiceData.items.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <tr style={{ height: '0.65cm' }}>
                    {/* Total Value (Displaying combined Value Pound and Value Piaster) */}
                    <td style={{ width: '2.3cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {/* Format and display the combined value */}
                      {/* Check if piaster value is non-zero before appending decimal part */}
                      {`${formatNumberWithArabicThousands(item.value.pound)}${item.value.piaster && parseFloat(toEnglishNumerals(item.value.piaster)) > 0 ? '.' + formatNumberWithArabicThousands(item.value.piaster) : ''}`}
                    </td>
                    
                    {/* Weight in Milligrams */}
                    <td style={{ width: '1.1cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.weight.milligrams)}
                    </td>

                    {/* Weight in Grams */}
                    <td style={{ width: '1.6cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.weight.grams)}
                    </td>
                    
                    {/* Karat */}
                    <td style={{ width: '1.1cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.karat)}
                    </td>
                    
                    {/* Price in Piasters */}
                    <td style={{ width: '1.1cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.price.piaster)}
                    </td>
                    
                    {/* Price in Pounds */}
                    <td style={{ width: '1.5cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.price.pound)}
                    </td>
                    
                    {/* Description */}
                    <td style={{ width: '5cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {item.description || ''}
                    </td>
                  </tr>
                  {item.hasTax && (
                    <tr style={{ height: '0.65cm', backgroundColor: '#f8f8f8' }}>
                      <td style={{ width: '2.3cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>&nbsp;</td>
                      <td colSpan={4} style={{ 
                        width: '4.9cm', 
                        textAlign: 'end', 
                        fontSize: '14px', 
                        fontWeight: 700,
                        verticalAlign: 'middle',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        maxWidth: '4.9cm',
                        padding: '0 0.1cm',
                      }}>{item.taxNote}</td>
                      <td style={{ width: '1.5cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>{formatNumberWithArabicThousands(item.tax.amount)}</td>
                      <td style={{ width: '5cm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>&nbsp;</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Empty Rows */}
            {Array(18 - invoiceData.items.length).fill(0).map((_, index) => (
              <tr key={`empty-${index}`} style={{ height: '0.65cm' }}>
                <td style={{ width: '2.3cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.1cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.6cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.1cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.1cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '1.5cm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
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
