import React, { useState, useEffect } from 'react';
import { 
  Printer, Save, Trash2, Plus, Receipt
} from 'lucide-react';
import InvoicePreview from './PrintInvoice';
import Modal from './Modal';
import Toast from './Toast';
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
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
    onConfirm: () => {},
    confirmText: 'حسناً',
    cancelText: 'إلغاء'
  });
  const [toastConfig, setToastConfig] = useState({
    message: '',
    type: 'info' as 'error' | 'success' | 'info',
    show: false
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    mobileNumber: '',
    date: new Date().toISOString().slice(0, 10),
    customerName: '',
    sellerName: '',
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
            },
            // Initialize tax fields if they don't exist
            hasTax: item.hasTax || false,
            tax: item.tax || {
              amount: '0'
            },
            taxNote: item.taxNote || ''
          };

          // Calculate total using the temporary item
          const total = calculateRowTotal(tempItem);

          // Return the formatted item with the calculated total
          return {
            ...item,
            weight: {
              grams: formatInputValue(item.weight.grams),
              milligrams: formatInputValue(item.weight.milligrams)
            },
            karat: formatInputValue(item.karat),
            price: {
              pound: formatInputValue(item.price.pound),
              piaster: formatInputValue(item.price.piaster)
            },
            hasTax: item.hasTax || false,
            tax: {
              amount: formatInputValue(item.tax?.amount || '0')
            },
            taxNote: item.taxNote || '',
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
      hasTax: false,
      tax: {
        amount: '0'
      },
      taxNote: '',
      formattedWeight: {
        grams: '0',
        milligrams: '0',
      },
      formattedKarat: '0',
      formattedValue: {
        pound: '0',
        piaster: '0',
      },
      formattedPrice: {
        pound: '0',
        piaster: '0',
      },
      formattedTotal: '0',
      formattedTax: {
        amount: '0'
      }
    };
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      // First convert any Arabic numerals to English
      const englishValue = value.replace(/[٠-٩]/g, (d) => 
        String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      );
      
      // Remove any characters that are not numbers or +
      let sanitizedValue = englishValue.replace(/[^0-9+]/g, '');
      
      // Ensure + is only at the start
      if (sanitizedValue.includes('+')) {
        sanitizedValue = '+' + sanitizedValue.replace(/\+/g, '');
      }
      
      // Finally convert back to Arabic numerals
      const arabicValue = sanitizedValue.replace(/[0-9]/g, (d) => 
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
    if (field === 'description' || field === 'taxNote') {
      const updatedItems = invoiceData.items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
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

  const showModal = (
    title: string, 
    message: string, 
    type: 'error' | 'success' | 'info' = 'info',
    confirmText: string = 'حسناً',
    cancelText: string = 'إلغاء',
    onConfirm: () => void = () => {}
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToastConfig({
      message,
      type,
      show: true
    });
  };

  const closeToast = () => {
    setToastConfig(prev => ({ ...prev, show: false }));
  };

  const handlePrint = () => {
    saveInvoice(); // Save the invoice before printing
    setShowValidation(true);
    if (hasIncompleteRow || hasIncompleteHeader) {
      showToast(
        'يرجى ملء جميع الحقول المطلوبة قبل الطباعة',
        'error'
      );
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
          size: 148mm 210mm;
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
          width: 148mm;
          height: 210mm;
          overflow: hidden;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
          background: white !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background: none !important;
          color: black !important;
          outline: 1px solid #e91f1fb0;
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
    if (hasIncompleteRow || hasIncompleteHeader) {
      showToast(
        'يرجى ملء جميع الحقول المطلوبة قبل الحفظ',
        'error'
      );
      return;
    }
    const data = JSON.stringify(invoiceData);
    localStorage.setItem(`invoice-${invoiceData.mobileNumber || Date.now()}`, data);
    showToast(
      'تم حفظ الفاتورة بنجاح!',
      'success'
    );
  };

  const handleDeleteInvoice = () => {
    showModal(
      'تأكيد الحذف',
      'هل أنت متأكد من حذف الفاتورة الحالية؟',
      'error',
      'حذف',
      'إلغاء',
      confirmDelete
    );
  };

  const confirmDelete = () => {
    const key = `invoice-${invoiceData.mobileNumber || Date.now()}`;
    deleteInvoice(key);
    setShowValidation(false);
    setInvoiceData({
      mobileNumber: '',
      date: new Date().toISOString().slice(0, 10),
      customerName: '',
      sellerName: '',
      items: [createEmptyItem()],
      totalAmount: 0,
    });
    showToast(
      'تم حذف الفاتورة بنجاح',
      'success'
    );
    closeModal();
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
    const stringValue = value.toString().replace(/,/g, '').replace(/،/g, ''); // Remove any commas (English or Arabic)

    // Check if the cleaned value is a valid number before formatting
    // Return original if not a valid number for parsing, allowing flexible input during typing.
    if (isNaN(parseFloat(stringValue))) return String(value);

    // Split into integer and decimal parts
    const parts = stringValue.split('.');
    const integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    // Limit decimal part to 2 digits for display
    if (decimalPart.length > 2) {
        decimalPart = decimalPart.substring(0, 2);
    }

    // Format the integer part with Arabic thousand separators
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '،'); // Use Arabic comma

    // Convert the formatted integer part to Arabic numerals
    const arabicFormattedIntegerPart = formattedIntegerPart.replace(/[0-9]/g, (d) =>
       String(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(d)])
    ); // Arabic digits

    // Convert the decimal part to Arabic numerals without further formatting or truncation
    const arabicFormattedDecimalPart = decimalPart.replace(/[0-9]/g, (d) =>
        String(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(d)])
    ); // Arabic digits

    // Combine the formatted parts. Include decimal point only if a decimal part was present in the original stringValue.
    const arabicFormattedNumber = parts.length > 1 ? `${arabicFormattedIntegerPart}.${arabicFormattedDecimalPart}` : arabicFormattedIntegerPart;

    return arabicFormattedNumber;
  };

  // Function to format display value (with decimal places)
  const formatDisplayValue = (value: number): string => {
    const formattedValue = value.toFixed(2);
    return formatNumber(formattedValue);
  };

  // Function to format input value for display with Arabic numerals and thousand separators
  const formatInputValue = (value: string | number | undefined | null): string => {
    if (value === null || value === undefined || value === '') return '';
    const stringValue = String(value).replace(/,/g, '').replace(/،/g, ''); // Remove any commas (English or Arabic)

    // Check if the cleaned value is a valid number before formatting
    // Return original if not a valid number for parsing, allowing flexible input during typing.
    if (isNaN(parseFloat(stringValue))) return String(value);

    // Split into integer and decimal parts
    const parts = stringValue.split('.');
    const integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : '';

    // Limit decimal part to 2 digits for display
    if (decimalPart.length > 2) {
        decimalPart = decimalPart.substring(0, 2);
    }

    // Format the integer part with Arabic thousand separators
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '،'); // Use Arabic comma

    // Convert the formatted integer part to Arabic numerals
    const arabicFormattedIntegerPart = formattedIntegerPart.replace(/[0-9]/g, (d) =>
       String(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(d)])
    ); // Arabic digits

    // Convert the decimal part to Arabic numerals without further formatting or truncation
    const arabicFormattedDecimalPart = decimalPart.replace(/[0-9]/g, (d) =>
        String(['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][parseInt(d)])
    ); // Arabic digits

    // Combine the formatted parts. Include decimal point only if a decimal part was present in the original stringValue.
    const arabicFormattedNumber = parts.length > 1 ? `${arabicFormattedIntegerPart}.${arabicFormattedDecimalPart}` : arabicFormattedIntegerPart;

    return arabicFormattedNumber;
  };

  // Function to handle numeric input change
  const handleNumericInputChange = (itemId: string, field: string, value: string) => {
    // Convert any Arabic numerals to English for internal consistency
    const englishValue = value.replace(/[٠-٩]/g, (d) => 
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    );

    const newItems = invoiceData.items.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item };

        // Update the specific field with the standardized (English) value
        if (field === 'weight.grams') {
          newItem.weight.grams = englishValue;
        } else if (field === 'weight.milligrams') {
          newItem.weight.milligrams = englishValue;
        } else if (field === 'value.pound') {
          newItem.value.pound = englishValue;
        } else if (field === 'value.piaster') {
          newItem.value.piaster = englishValue;
        } else if (field === 'price.pound') {
          newItem.price.pound = englishValue;
        } else if (field === 'price.piaster') {
          newItem.price.piaster = englishValue;
        } else if (field === 'karat') {
          newItem.karat = englishValue;
        } else if (field === 'tax.amount') {
          newItem.tax.amount = englishValue;
        }

        return newItem;
      }
      return item;
    });

    setInvoiceData(prev => ({
      ...prev,
      items: newItems,
      totalAmount: calculateInvoiceTotal(newItems)
    }));
  };

  const toggleTax = (id: string) => {
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === id) {
        return { ...item, hasTax: !item.hasTax };
      }
      return item;
    });

    setInvoiceData({
      ...invoiceData,
      items: updatedItems
    });
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
            inputMode="tel"
            dir="rtl"
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
        <div className="form-group">
          <label htmlFor="sellerName" className="form-label">
            اسم البائع
          </label>
          <input
            id="sellerName"
            name="sellerName"
            type="text"
            value={invoiceData.sellerName}
            onChange={handleInputChange}
            className={`form-input${isFieldMissing(null, 'sellerName') ? ' input-error' : ''}`}
            style={{ height: '2.5rem' }}
          />
        </div>
      </div>

      {/* Items Table */}
      {showValidation && (hasIncompleteRow || hasIncompleteHeader) && (
        <div className="validation-message" style={{color: '#b91c1c', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.95rem'}}>
          يوجد حقول مطلوبة يجب تعبئتها أولاً
        </div>
      )}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr className="table-header">
              <th className="table-header-cell">الوصف</th>
              <th className="table-header-cell">
                <div className="header-with-hint">
                  <span>الفئة</span>
                  <span className="header-hint">(جنيه - قرش)</span>
                </div>
              </th>
              <th className="table-header-cell">العيار</th>
              <th className="table-header-cell">
                <div className="header-with-hint">
                  <span>الوزن</span>
                  <span className="header-hint">(جرام - مللي)</span>
                </div>
              </th>
              <th className="table-header-cell">القيمة</th>
              <th className="table-header-cell">الاجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="table-row">
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
                        value={formatInputValue(item.price.pound)}
                        onChange={(e) => handleNumericInputChange(item.id, 'price.pound', e.target.value)}
                        className={`form-input${isFieldMissing(item, 'price.pound') ? ' input-error' : ''}`}
                        placeholder="جنيه"
                        inputMode="decimal"
                        maxLength={8}
                        onFocus={(e) => e.target.select()}
                      />
                      <input
                        type="text"
                        value={formatInputValue(item.price.piaster)}
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
                      value={formatInputValue(item.karat)}
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
                        value={formatInputValue(item.weight.grams)}
                        onChange={(e) => handleNumericInputChange(item.id, 'weight.grams', e.target.value)}
                        className={`form-input${isFieldMissing(item, 'weight.grams') ? ' input-error' : ''}`}
                        placeholder="جرام"
                        inputMode="decimal"
                        maxLength={8}
                        onFocus={(e) => e.target.select()}
                      />
                      <input
                        type="text"
                        value={formatInputValue(item.weight.milligrams)}
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
                      value={formatInputValue(item.value.pound)}
                      onChange={(e) => handleNumericInputChange(item.id, 'value.pound', e.target.value)}
                      className={`form-input${isFieldMissing(item, 'value.pound') ? ' input-error' : ''}`}
                      placeholder="القيمة"
                      inputMode="decimal"
                      maxLength={15}
                      onFocus={(e) => e.target.select()}
                    />
                  </td>
                  <td className="table-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => toggleTax(item.id)}
                        className={`action-button tax-button ${item.hasTax ? 'active' : ''}`}
                        title={item.hasTax ? 'إزالة الضريبة' : 'إضافة ضريبة'}
                      >
                        {item.hasTax ? <Receipt size={18} /> : <Receipt size={18} />}
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        disabled={invoiceData.items.length <= 1}
                        className="action-button delete-button"
                        title="حذف الصنف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {item.hasTax && (
                  <tr className="table-row tax-row">
                    <td className="table-cell">
                      <input
                        type="text"
                        value={item.taxNote}
                        onChange={(e) => handleItemChange(item.id, 'taxNote', e.target.value)}
                        className="form-input"
                        placeholder="ملحوظة الضريبة"
                        style={{ fontSize: '0.9em' }}
                      />
                    </td>
                    <td className="table-cell">
                      <input
                        type="text"
                        value={formatInputValue(item.tax.amount)}
                        onChange={(e) => handleNumericInputChange(item.id, 'tax.amount', e.target.value)}
                        className="form-input"
                        placeholder="قيمة الضريبة"
                        inputMode="decimal"
                        maxLength={10}
                        style={{ fontSize: '0.9em' }}
                        onFocus={(e) => e.target.select()}
                      />
                    </td>
                    <td className="table-cell" colSpan={4}></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="total-actions-section">
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
          </button>
          {invoiceData.items.length >= 13 && (
              <span className="items-limit-indicator">
                (١٣/١٣)
              </span>
            )}
          {invoiceData.items.length < 13 && (
            <span className="items-count">
              ({toArabicNumerals(invoiceData.items.length.toString())}/١٣)
            </span>
          )}
        </div>
        
        <div className="total-amount-section">
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

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
      />

      {toastConfig.show && (
        <div className="toast-container">
          <Toast
            message={toastConfig.message}
            type={toastConfig.type}
            onClose={closeToast}
          />
        </div>
      )}

      <style>
        {`
          .header-with-hint {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }
          .table-header-cell {
            padding: 8px;
            text-align: center;
            font-weight: 600;
            color: #ffffff;
          }
          .action-buttons {
            display: flex;
            gap: 8px;
            justify-content: center;
            align-items: center;
          }
          .action-button {
            padding: 6px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            min-width: 32px;
            height: 32px;
          }
          .action-button:hover {
            transform: scale(1.05);
          }
          .action-button.delete-button {
            background-color: #fee2e2;
            color: #dc2626;
          }
          .action-button.delete-button:hover {
            background-color: #fecaca;
          }
          .action-button.tax-button {
            background-color: #f0fdf4;
            color: #16a34a;
          }
          .action-button.tax-button:hover {
            background-color: #dcfce7;
          }
          .action-button.tax-button.active {
            background-color: #16a34a;
            color: white;
            box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
          }
          .tax-row {
            background-color: #f8fafc;
          }
          .tax-row .form-input {
            background-color: #f1f5f9;
          }
        `}
      </style>
    </div>
  );
}

export default InvoiceForm;
