import React, { useState, useEffect } from 'react';
import { 
  Printer, Save, Trash2, Plus
} from 'lucide-react';
import InvoicePreview from './InvoicePreview';
import { InvoiceData, InvoiceItem } from '../types/invoice';
import { calculateRowTotal, calculateInvoiceTotal } from '../utils/calculations';
import { getSavedInvoices, loadInvoice, deleteInvoice } from '../utils/storage';

// Function to convert numbers to Arabic numerals
const toArabicNumerals = (str: string): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[0-9]/g, (d) => arabicNumerals[parseInt(d)]);
};

// Function to convert date to Arabic format
const formatDateToArabic = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  return `${toArabicNumerals(year)}-${toArabicNumerals(month)}-${toArabicNumerals(day)}`;
};

function InvoiceForm() {
  const [showValidation, setShowValidation] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    mobileNumber: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    items: [createEmptyItem()],
    totalAmount: 0,
  });

  // Load the last saved invoice when component mounts
  useEffect(() => {
    const savedInvoices = getSavedInvoices();
    if (savedInvoices.length > 0) {
      const lastInvoice = loadInvoice(savedInvoices[savedInvoices.length - 1]);
      if (lastInvoice) {
        // Format all numeric values in the items
        const formattedItems = lastInvoice.items.map(item => {
          // Convert Arabic numerals to English for calculations
          const englishGrams = item.weight.grams.replace(/[٠-٩]/g, (d) => 
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
          );
          const englishMilligrams = item.weight.milligrams.replace(/[٠-٩]/g, (d) => 
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
          );
          const englishKarat = item.karat.replace(/[٠-٩]/g, (d) => 
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
          );
          const englishPricePound = item.price.pound.replace(/[٠-٩]/g, (d) => 
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
          );
          const englishPricePiaster = item.price.piaster.replace(/[٠-٩]/g, (d) => 
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
          );

          // Create a temporary item with English numerals for calculation
          const tempItem = {
            ...item,
            weight: {
              grams: englishGrams,
              milligrams: englishMilligrams
            },
            karat: englishKarat,
            price: {
              pound: englishPricePound,
              piaster: englishPricePiaster
            }
          };

          // Calculate total using the temporary item
          const total = calculateRowTotal(tempItem);

          // Return the formatted item with the calculated total
          return {
            ...item,
            weight: {
              grams: formatInputValue(item.weight.grams, false),
              milligrams: formatInputValue(item.weight.milligrams, true)
            },
            karat: formatInputValue(item.karat, false),
            price: {
              pound: formatInputValue(item.price.pound, false),
              piaster: formatInputValue(item.price.piaster, true)
            },
            total
          };
        });

        // Calculate the total amount for the invoice
        const totalAmount = calculateInvoiceTotal(formattedItems);

        setInvoiceData({
          ...lastInvoice,
          items: formattedItems,
          totalAmount,
          mobileNumber: toArabicNumerals(lastInvoice.mobileNumber)
        });
      }
    }
  }, []);

  function createEmptyItem(): InvoiceItem {
    return {
      id: Date.now().toString(),
      description: '',
      weight: {
        grams: '0',
        milligrams: '0',
      },
      karat: '0',
      value: {
        pound: '0',
        piaster: '0',
      },
      price: {
        pound: '0',
        piaster: '0',
      },
      total: 0,
    };
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      // Convert to Arabic numerals
      const arabicValue = value.replace(/[0-9]/g, (d) => 
        String(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(d)])
      );
      setInvoiceData({
        ...invoiceData,
        [name]: arabicValue,
      });
    } else if (name === 'date') {
      setInvoiceData({
        ...invoiceData,
        [name]: value,
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        [name]: value,
      });
    }
  };

  const handleItemChange = (id: string, field: string, value: string) => {
    if (field === 'description') {
      const updatedItems = invoiceData.items.map(item => {
        if (item.id === id) {
          return { ...item, description: value };
        }
        return item;
      });

      setInvoiceData({
        ...invoiceData,
        items: updatedItems
      });
    }
  };

  // Check if any row is incomplete
  const hasIncompleteRow = invoiceData.items.some(item => {
    const hasNoDescription = !item.description.trim();
    const hasNoWeight = !item.weight.grams.trim();
    const hasNoKarat = !item.karat.trim();
    const hasNoPrice = !item.price.pound.trim();
    return hasNoDescription || hasNoWeight || hasNoKarat || hasNoPrice;
  });

  // Check if any header field is missing
  const hasIncompleteHeader = !invoiceData.mobileNumber.trim() || !invoiceData.date.trim() || !invoiceData.customerName.trim();

  // Helper to check if a field is missing
  const isFieldMissing = (item: InvoiceItem | null, field: string) => {
    if (!showValidation) return false;
    if (item) {
      switch (field) {
        case 'description': return !item.description.trim();
        case 'weight.grams': return !item.weight.grams.trim();
        case 'karat': return !item.karat.trim();
        case 'price.pound': return !item.price.pound.trim();
        default: return false;
      }
    } else {
      switch (field) {
        case 'mobileNumber': return !invoiceData.mobileNumber.trim();
        case 'date': return !invoiceData.date.trim();
        case 'customerName': return !invoiceData.customerName.trim();
        default: return false;
      }
    }
  };

  const addNewItem = () => {
    if (invoiceData.items.length >= 13) return;
    
    const newItem = createEmptyItem();
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem]
    });
    
    setTimeout(() => {
      const newItemInput = document.querySelector(`input[data-item-id="${newItem.id}"]`) as HTMLInputElement;
      if (newItemInput) {
        newItemInput.focus();
      }
    }, 0);
  };

  const removeItem = (id: string) => {
    if (invoiceData.items.length <= 1) return;
    
    const filteredItems = invoiceData.items.filter(item => item.id !== id);
    
    setInvoiceData({
      ...invoiceData,
      items: filteredItems,
      totalAmount: calculateInvoiceTotal(filteredItems)
    });
  };

  const handlePrint = () => {
    setShowValidation(true);
    if (hasIncompleteRow || hasIncompleteHeader) {
      alert('يرجى ملء جميع الحقول المطلوبة قبل الطباعة');
      return;
    }

    // Get the print content
    const printContent = document.querySelector('.print-content') as HTMLElement;
    if (!printContent) return;

    // Store the original body content
    const originalContent = document.body.innerHTML;
    
    // Create a new div for printing
    const printDiv = document.createElement('div');
    printDiv.innerHTML = printContent.innerHTML;
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: 160mm 200mm;
          margin: 0;
        }
        body { 
          margin: 0; 
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-content { 
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 160mm;
          height: 200mm;
          overflow: hidden;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
          background: none !important;
        }
        * {
          background: none !important;
          color: black !important;
        }
        html {
          height: 100%;
          overflow: hidden;
        }
        @page :first {
          margin: 0;
        }
        @page :left {
          margin: 0;
        }
        @page :right {
          margin: 0;
        }
      }
    `;
    printDiv.appendChild(style);
    
    // Replace body content with print content
    document.body.innerHTML = printDiv.innerHTML;
    
    // Print
    window.print();
    
    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Reattach event listeners and React components
    window.location.reload();
  };

  const saveInvoice = () => {
    setShowValidation(true);
    if (hasIncompleteRow || hasIncompleteHeader) return;
    const data = JSON.stringify(invoiceData);
    localStorage.setItem(`invoice-${invoiceData.mobileNumber || Date.now()}`, data);
    alert('تم حفظ الفاتورة بنجاح!');
  };

  const handleDeleteInvoice = () => {
    if (confirm('هل أنت متأكد من حذف الفاتورة الحالية؟')) {
      const key = `invoice-${invoiceData.mobileNumber || Date.now()}`;
      deleteInvoice(key);
      setShowValidation(false);
      setInvoiceData({
        mobileNumber: '',
        date: new Date().toISOString().slice(0, 10),
        customerName: '',
        items: [createEmptyItem()],
        totalAmount: 0,
      });
      alert('تم حذف الفاتورة بنجاح');
    }
  };

  // Check if invoice has any data
  const hasInvoiceData = () => {
    return invoiceData.mobileNumber.trim() !== '' || 
           invoiceData.customerName.trim() !== '' ||
           invoiceData.items.some(item => 
             item.description.trim() !== '' ||
             item.weight.grams.trim() !== '' ||
             item.weight.milligrams.trim() !== '' ||
             item.karat.trim() !== '' ||
             item.value.pound.trim() !== '' ||
             item.value.piaster.trim() !== '' ||
             item.price.pound.trim() !== '' ||
             item.price.piaster.trim() !== ''
           );
  };

  // Function to format number with thousand separators
  const formatNumber = (value: string | number): string => {
    if (!value) return '';
    const stringValue = value.toString().replace(/,/g, '');
    const parts = stringValue.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedNumber = parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    return toArabicNumerals(formattedNumber);
  };

  // Function to format display value (with decimal places)
  const formatDisplayValue = (value: number): string => {
    const formattedValue = value.toFixed(2);
    return formatNumber(formattedValue);
  };

  // Function to format input value for display
  const formatInputValue = (value: string, isDecimal: boolean): string => {
    if (!value) return '';
    const cleanValue = value.replace(/,/g, '');
    return isDecimal ? toArabicNumerals(cleanValue) : formatNumber(cleanValue);
  };

  // Function to handle numeric input change
  const handleNumericInputChange = (itemId: string, field: string, value: string) => {
    const newItems = invoiceData.items.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item };
        const [parent, child] = field.split('.');
        
        if (child) {
          if (parent === 'weight') {
            newItem.weight = {
              ...newItem.weight,
              [child]: value
            };
          } else if (parent === 'value') {
            newItem.value = {
              ...newItem.value,
              [child]: value
            };
          } else if (parent === 'price') {
            newItem.price = {
              ...newItem.price,
              [child]: value
            };
          }
        } else {
          if (field === 'karat') {
            newItem.karat = value;
          }
        }

        return newItem;
      }
      return item;
    });

    // Calculate new total amount
    const totalAmount = calculateInvoiceTotal(newItems);

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      totalAmount
    }));
  };

  return (
    <div className="invoice-form">
      <div className="form-header">
        <h2 className="form-title">إدخال بيانات الفاتورة</h2>
        <div className="button-group">
          <button 
            onClick={saveInvoice}
            className="button button-save"
            style={{
              backgroundColor: '#065f46',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#064e3b'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
          >
            <Save className="button-icon" size={16} />
            حفظ
          </button>
          <button 
            onClick={handlePrint}
            className="button button-print"
            style={{
              backgroundColor: '#1e40af',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3a8a'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
          >
            <Printer className="button-icon" size={16} />
            طباعة
          </button>
          <button 
            onClick={handleDeleteInvoice}
            className="button button-delete"
            style={{ 
              backgroundColor: '#991b1b', 
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              opacity: hasInvoiceData() ? 1 : 0.5,
              cursor: hasInvoiceData() ? 'pointer' : 'not-allowed'
            }}
            onMouseOver={(e) => hasInvoiceData() && (e.currentTarget.style.backgroundColor = '#7f1d1d')}
            onMouseOut={(e) => hasInvoiceData() && (e.currentTarget.style.backgroundColor = '#991b1b')}
            disabled={!hasInvoiceData()}
          >
            <Trash2 className="button-icon" size={16} />
            حذف الفاتورة
          </button>
        </div>
      </div>

      {/* Invoice Header Info */}
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="mobileNumber" className="form-label">
            رقم الموبايل
          </label>
          <input
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            value={invoiceData.mobileNumber}
            onChange={handleInputChange}
            className={`form-input${isFieldMissing(null, 'mobileNumber') ? ' input-error' : ''}`}
            placeholder="رقم الموبايل"
            inputMode="numeric"
            style={{ height: '2.5rem' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            التاريخ
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={invoiceData.date}
            onChange={handleInputChange}
            className={`form-input${isFieldMissing(null, 'date') ? ' input-error' : ''}`}
            dir="ltr"
            style={{ height: '2.5rem' }}
          />
        </div>
        <div className="form-group">
          <label htmlFor="customerName" className="form-label">
            اسم العميل
          </label>
          <input
            id="customerName"
            name="customerName"
            type="text"
            value={invoiceData.customerName}
            onChange={handleInputChange}
            className={`form-input${isFieldMissing(null, 'customerName') ? ' input-error' : ''}`}
            style={{ height: '2.5rem' }}
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="table-container">
        {showValidation && (hasIncompleteRow || hasIncompleteHeader) && (
          <div className="validation-message" style={{color: '#b91c1c', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.95rem'}}>
            يوجد حقول مطلوبة يجب تعبئتها أولاً
          </div>
        )}
        <table className="table">
          <thead className="table-header">
            <tr className="table-header">
              <th className="table-header-cell">الوصف</th>
              <th className="table-header-cell">
                <div className="header-with-hint">
                  <span>الفئة</span>
                  <span className="header-hint">(جنيه وقرش)</span>
                </div>
              </th>
              <th className="table-header-cell">العيار</th>
              <th className="table-header-cell">
                <div className="header-with-hint">
                  <span>الوزن</span>
                  <span className="header-hint">(جرام ومللي)</span>
                </div>
              </th>
              <th className="table-header-cell">القيمة</th>
              <th className="table-header-cell">حذف</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <tr key={item.id} className="table-row">
                <td className="table-cell">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className={`form-input${isFieldMissing(item, 'description') ? ' input-error' : ''}`}
                    placeholder="وصف الصنف"
                    data-item-id={item.id}
                    onFocus={(e) => e.target.select()}
                  />
                </td>
                <td className="table-cell">
                  <div className="input-group">
                    <input
                      type="text"
                      value={formatInputValue(item.price.pound, false)}
                      onChange={(e) => handleNumericInputChange(item.id, 'price.pound', e.target.value)}
                      className={`form-input${isFieldMissing(item, 'price.pound') ? ' input-error' : ''}`}
                      placeholder="جنيه"
                      inputMode="decimal"
                      maxLength={8}
                      onFocus={(e) => e.target.select()}
                    />
                    <input
                      type="text"
                      value={formatInputValue(item.price.piaster, true)}
                      onChange={(e) => handleNumericInputChange(item.id, 'price.piaster', e.target.value)}
                      className="form-input"
                      placeholder="قرش"
                      inputMode="decimal"
                      maxLength={2}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </td>
                <td className="table-cell">
                  <input
                    type="text"
                    value={formatInputValue(item.karat, false)}
                    onChange={(e) => handleNumericInputChange(item.id, 'karat', e.target.value)}
                    className={`form-input${isFieldMissing(item, 'karat') ? ' input-error' : ''}`}
                    placeholder="عيار"
                    inputMode="decimal"
                    maxLength={8}
                    onFocus={(e) => e.target.select()}
                  />
                </td>
                <td className="table-cell">
                  <div className="input-group">
                    <input
                      type="text"
                      value={formatInputValue(item.weight.grams, false)}
                      onChange={(e) => handleNumericInputChange(item.id, 'weight.grams', e.target.value)}
                      className={`form-input${isFieldMissing(item, 'weight.grams') ? ' input-error' : ''}`}
                      placeholder="جرام"
                      inputMode="decimal"
                      maxLength={8}
                      onFocus={(e) => e.target.select()}
                    />
                    <input
                      type="text"
                      value={formatInputValue(item.weight.milligrams, true)}
                      onChange={(e) => handleNumericInputChange(item.id, 'weight.milligrams', e.target.value)}
                      className="form-input"
                      placeholder="مللي"
                      inputMode="decimal"
                      maxLength={2}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </td>
                <td className="table-cell">
                  <input
                    type="text"
                    value={formatInputValue(item.value.pound, false)}
                    onChange={(e) => handleNumericInputChange(item.id, 'value.pound', e.target.value)}
                    className={`form-input${isFieldMissing(item, 'value.pound') ? ' input-error' : ''}`}
                    placeholder="القيمة"
                    inputMode="decimal"
                    maxLength={8}
                    onFocus={(e) => e.target.select()}
                  />
                </td>
                <td className="table-cell">
                  <button 
                    onClick={() => removeItem(item.id)}
                    disabled={invoiceData.items.length <= 1}
                    className="action-button"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="total-section">
        <div className="add-item-section">
          <button
            onClick={addNewItem}
            className="button button-add"
            style={{
              backgroundColor: '#5b21b6',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: invoiceData.items.length >= 13 || hasIncompleteRow ? 'not-allowed' : 'pointer',
              opacity: invoiceData.items.length >= 13 || hasIncompleteRow ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (!(invoiceData.items.length >= 13 || hasIncompleteRow)) {
                e.currentTarget.style.backgroundColor = '#4c1d95';
              }
            }}
            onMouseOut={(e) => {
              if (!(invoiceData.items.length >= 13 || hasIncompleteRow)) {
                e.currentTarget.style.backgroundColor = '#5b21b6';
              }
            }}
            disabled={invoiceData.items.length >= 13 || hasIncompleteRow}
            title={invoiceData.items.length >= 13 ? 'الحد الأقصى للأصناف هو ١٣ صنف' : ''}
          >
            <Plus className="button-icon" size={16} />
            إضافة صنف
            {invoiceData.items.length >= 13 && (
              <span className="items-limit-indicator">
                (١٣/١٣)
              </span>
            )}
          </button>
          {invoiceData.items.length < 13 && (
            <span className="items-count">
              ({toArabicNumerals(invoiceData.items.length.toString())}/١٣)
            </span>
          )}
        </div>
        
        <div className="total-section">
          <div className="total-label">الإجمالي:</div>
          <div className="total-amount">
            {formatDisplayValue(invoiceData.totalAmount)} ج.م
          </div>
        </div>
      </div>

      {/* Print Instructions Section */}
      <div className="print-instructions-section">
        <div className="print-instructions">
          <h3>
            <Printer className="icon" />
            تعليمات الطباعة
          </h3>
          <ul>
            <li>• انقر على زر "طباعة" في الأعلى</li>
            <li>• ستظهر نافذة جديدة بها بيانات الفاتورة جاهزة للطباعة</li>
            <li>• في نافذة الطباعة، اختر حجم الورق A5 (الأقرب لمقاس 16سم × 20سم)</li>
            <li>• اضبط الهوامش على "بلا" أو "الحد الأدنى"</li>
            <li>• سيتم طباعة بيانات العميل والتاريخ والأصناف فقط</li>
          </ul>
        </div>
      </div>

      {/* Print content */}
      <div className="print-content">
        <InvoicePreview 
          invoiceData={{
            ...invoiceData,
            date: formatDateToArabic(invoiceData.date)
          }}
        />
      </div>

      <style>
        {`
          .header-with-hint {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }
          .header-hint {
            font-size: 0.8em;
            color: #9ca3af;
            font-weight: normal;
          }
          .table-header-cell {
            padding: 8px;
            text-align: center;
            font-weight: 600;
            color: #ffffff;
            background-color: #1e40af;
            border-bottom: 1px solid #1e3a8a;
          }
          .table-header {
            background-color: #1e40af;
          }
        `}
      </style>
    </div>
  );
}

export default InvoiceForm;
