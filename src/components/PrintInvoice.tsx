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
      width: '148mm',
      height: '210mm',
      position: 'relative', 
      margin: '0 auto', 
      padding: 0, 
      fontFamily: 'NotoKufiArabic, sans-serif',
      fontWeight: 700,
      fontSize: '18px',
      background: 'white'
    }}>
      
      {/* Header Section */}
      <div style={{ position: 'absolute', top: '35mm', width: '148mm', height: '15mm' }}>
        {/* Date Fields */}
        <div style={{ position: 'absolute', top: '4mm', right: '22mm', width: '10mm', textAlign: 'center' }}>
          {dateParts.day}
        </div>
        <div style={{ position: 'absolute', top: '4mm', right: '37.5mm', width: '10mm', textAlign: 'center' }}>
          {dateParts.month}
        </div>
        <div style={{ position: 'absolute', top: '4mm', right: '51mm', width: '10mm', textAlign: 'center' }}>
          {dateParts.year}
        </div>
        
        {/* Customer Name */}
        <div style={{ position: 'absolute', top: '11mm', right: '30mm', width: '48mm', textAlign: 'center' }}>
          {invoiceData.customerName || '---'}
        </div>
        
        {/* Phone Number */}
        <div style={{ position: 'absolute', top: '11mm', right: '96mm', width: '30mm', textAlign: 'center' }}>
          {invoiceData.mobileNumber || '---'}
        </div>
      </div>
      
      {/* Items Table */}
      <div style={{ position: 'absolute', top: '73mm', width: '145mm', right: '8.5mm', height: '120mm', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
          <tbody>
            {invoiceData.items.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <tr style={{ height: '6.5mm' }}>
                    {/* Total Value */}
                    <td style={{ width: '23mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {`${formatNumberWithArabicThousands(item.value.pound)}${item.value.piaster && parseFloat(toEnglishNumerals(item.value.piaster)) > 0 ? '.' + formatNumberWithArabicThousands(item.value.piaster) : ''}`}
                    </td>
                    
                    {/* Weight in Milligrams */}
                    <td style={{ width: '11mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.weight.milligrams)}
                    </td>

                    {/* Weight in Grams */}
                    <td style={{ width: '16mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.weight.grams)}
                    </td>
                    
                    {/* Karat */}
                    <td style={{ width: '11mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.karat)}
                    </td>
                    
                    {/* Price in Piasters */}
                    <td style={{ width: '11mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.price.piaster)}
                    </td>
                    
                    {/* Price in Pounds */}
                    <td style={{ width: '15mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {formatNumberWithArabicThousands(item.price.pound)}
                    </td>
                    
                    {/* Description */}
                    <td style={{ width: '50mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>
                      {item.description || ''}
                    </td>
                  </tr>
                  {item.hasTax && (
                    <tr style={{ height: '6.5mm', backgroundColor: '#f8f8f8' }}>
                      <td style={{ width: '23mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>&nbsp;</td>
                      <td colSpan={4} style={{ 
                        width: '49mm', 
                        textAlign: 'end', 
                        fontSize: '14px', 
                        fontWeight: 700,
                        verticalAlign: 'middle',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                        maxWidth: '49mm',
                        padding: '0 1mm',
                      }}>{item.taxNote}</td>
                      <td style={{ width: '15mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>{formatNumberWithArabicThousands(item.tax.amount)}</td>
                      <td style={{ width: '50mm', textAlign: 'center', fontSize: '18px', fontWeight: 700, verticalAlign: 'middle' }}>&nbsp;</td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Empty Rows */}
            {Array(12 - invoiceData.items.length).fill(0).map((_, index) => (
              <tr key={`empty-${index}`} style={{ height: '6.5mm' }}>
                <td style={{ width: '23mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '11mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '16mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '11mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '11mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '15mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
                <td style={{ width: '50mm', textAlign: 'center', verticalAlign: 'middle' }}>&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Amount */}
      <div style={{ position: 'absolute', bottom: '32mm', right: '8.5mm', width: '23mm', textAlign: 'center' }}>
        {formatNumberWithArabicThousands(invoiceData.totalAmount)} ج.م
      </div>

      {/* Seller Name */}
      <div style={{ position: 'absolute', bottom: '32mm', left: '10mm', width: '48mm', textAlign: 'center' }}>
        {invoiceData.sellerName || '---'}
      </div>
    </div>
  );
};

export default InvoicePreview;
