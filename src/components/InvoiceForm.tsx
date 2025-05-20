import React, { useState, useEffect } from 'react';
import { 
  Printer, Save, FileText, Eye, Plus, Trash2
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

const InvoiceForm: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
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
        setInvoiceData({
          ...lastInvoice,
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
        grams: '',
        milligrams: '',
      },
      karat: '',
      value: {
        pound: '',
        piaster: '',
      },
      price: {
        pound: '',
        piaster: '',
      },
      total: 0,
    };
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      // Only allow numbers and limit to 11 digits for Egyptian mobile numbers
      const numericValue = value.replace(/[^\d٠-٩]/g, '').slice(0, 11);
      // Convert Arabic numerals to English for validation
      const englishValue = numericValue.replace(/[٠-٩]/g, (d) => 
        String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      );
      setInvoiceData({
        ...invoiceData,
        [name]: numericValue,
      });
    } else {
      setInvoiceData({
        ...invoiceData,
        [name]: value,
      });
    }
  };

  const handleItemChange = (id: string, field: string, value: string) => {
    const updatedItems = invoiceData.items.map(item => {
      if (item.id === id) {
        if (field.includes('.')) {
          const [parent, child] = field.split('.');
          return {
            ...item,
            [parent]: {
              ...item[parent as keyof InvoiceItem] as Record<string, any>,
              [child]: value
            }
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    });

    const itemsWithTotals = updatedItems.map(item => ({
      ...item,
      total: calculateRowTotal(item)
    }));

    setInvoiceData({
      ...invoiceData,
      items: itemsWithTotals,
      totalAmount: calculateInvoiceTotal(itemsWithTotals)
    });
  };

  // Check if any row is incomplete (missing description, weight, value, karat, or price)
  const hasIncompleteRow = invoiceData.items.some(item => {
    const hasNoDescription = !item.description.trim();
    const hasNoWeight = !item.weight.grams.trim(); // Only grams required
    const hasNoKarat = !item.karat.trim();         // Karat required
    const hasNoPrice = !item.price.pound.trim();   // Only pound required for price
    return hasNoDescription || hasNoWeight || hasNoKarat || hasNoPrice;
  });

  // Check if any header field is missing
  const hasIncompleteHeader = !invoiceData.mobileNumber.trim() || !invoiceData.date.trim() || !invoiceData.customerName.trim();

  // Helper to check if a field is missing for a specific item or header
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
    if (invoiceData.items.length >= 12) return;
    
    const newItem = createEmptyItem();
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem]
    });
    
    // Add auto focus after the new item is rendered
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
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
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

  const togglePreview = () => {
    setShowValidation(true);
    if (hasIncompleteRow || hasIncompleteHeader) return;
    setShowPreview(!showPreview);
  };

  const handleDeleteInvoice = () => {
    if (confirm('هل أنت متأكد من حذف الفاتورة الحالية؟')) {
      const key = `invoice-${invoiceData.mobileNumber || Date.now()}`;
      deleteInvoice(key);
      setShowValidation(false); // Reset validation state
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
    // Convert to string and remove any existing commas
    const stringValue = value.toString().replace(/,/g, '');
    // Split the number into integer and decimal parts
    const parts = stringValue.split('.');
    // Format the integer part with commas
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Return the formatted number
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

  // Function to prepare data for preview and print
  const prepareDataForDisplay = (data: InvoiceData) => {
    return {
      ...data,
      items: data.items.map(item => ({
        ...item,
        weight: {
          grams: item.weight.grams,
          milligrams: item.weight.milligrams
        },
        value: {
          pound: item.value.pound,
          piaster: item.value.piaster
        },
        price: {
          pound: item.price.pound,
          piaster: item.price.piaster
        },
        total: item.total,
        formattedWeight: {
          grams: item.weight.grams,
          milligrams: item.weight.milligrams
        },
        formattedKarat: item.karat,
        formattedValue: {
          pound: item.value.pound,
          piaster: item.value.piaster
        },
        formattedPrice: {
          pound: item.price.pound,
          piaster: item.price.piaster
        },
        formattedTotal: formatDisplayValue(item.total)
      })),
      totalAmount: data.totalAmount,
      formattedTotalAmount: formatDisplayValue(data.totalAmount)
    };
  };

  // Function to handle numeric input change
  const handleNumericInputChange = (id: string, field: string, value: string) => {
    // Check if the field is a decimal number (piaster or milligrams)
    const isDecimalField = field.includes('piaster') || field.includes('milligrams');
    const maxLength = isDecimalField ? 2 : 6;
    
    // Remove commas and validate numeric input
    const cleanValue = value.replace(/,/g, '');
    // Convert Arabic numerals back to English for calculations
    const englishValue = cleanValue.replace(/[٠-٩]/g, (d) => 
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    );
    const validatedValue = validateNumericInput(englishValue).slice(0, maxLength);
    
    handleItemChange(id, field, validatedValue);
  };

  // Function to validate numeric input
  const validateNumericInput = (value: string): string => {
    // Remove any non-numeric characters and commas
    return value.replace(/[^\d]/g, '');
  };

  // Add this CSS class to hide print content by default
  const printContentStyle = `
    .print-content {
      display: none;
    }
    @media print {
      .print-content {
        display: block;
      }
    }
  `;

  // Add the style to the document
  const styleSheet = document.createElement("style");
  styleSheet.innerText = printContentStyle;
  document.head.appendChild(styleSheet);

  return (
    <div className="invoice-form">
      {!showPreview ? (
        <>
          <div className="form-header">
            <h2 className="form-title">إدخال بيانات الفاتورة</h2>
            <div className="button-group">
              <button 
                onClick={togglePreview}
                className="button button-preview"
              >
                <Eye className="button-icon" />
                معاينة
              </button>
              <button 
                onClick={saveInvoice}
                className="button button-save"
              >
                <Save className="button-icon" />
                حفظ
              </button>
              <button 
                onClick={handlePrint}
                className="button button-print"
              >
                <Printer className="button-icon" />
                طباعة
              </button>
              <button 
                onClick={handleDeleteInvoice}
                className="button button-delete"
                style={{ 
                  backgroundColor: '#450a0a', 
                  color: '#fca5a5',
                  opacity: hasInvoiceData() ? 1 : 0.5,
                  cursor: hasInvoiceData() ? 'pointer' : 'not-allowed'
                }}
                disabled={!hasInvoiceData()}
              >
                <Trash2 className="button-icon" />
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
                placeholder="٠١XXXXXXXXX"
                pattern="^٠١[٠١٢٥][٠-٩]{٨}$"
                maxLength={11}
                inputMode="numeric"
              />
              {invoiceData.mobileNumber && invoiceData.mobileNumber.length === 11 && 
               !invoiceData.mobileNumber.match(/^٠١[٠١٢٥][٠-٩]{٨}$/) && (
                <div style={{ color: '#b91c1c', fontSize: '0.875rem', marginTop: '4px' }}>
                  رقم الموبايل غير صحيح
                </div>
              )}
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
                <tr>
                  <th>الصنف</th>
                  <th>الوزن (جرام.مجم)</th>
                  <th>العيار</th>
                  <th>فئة (ج.م)</th>
                  <th>الإجمالي</th>
                  <th>الإجراءات</th>
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
                        />
                        <input
                          type="text"
                          value={formatInputValue(item.weight.milligrams, true)}
                          onChange={(e) => handleNumericInputChange(item.id, 'weight.milligrams', e.target.value)}
                          className="form-input"
                          placeholder="مجم"
                          inputMode="decimal"
                          maxLength={2}
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
                        />
                        <input
                          type="text"
                          value={formatInputValue(item.price.piaster, true)}
                          onChange={(e) => handleNumericInputChange(item.id, 'price.piaster', e.target.value)}
                          className="form-input"
                          placeholder="قرش"
                          inputMode="decimal"
                          maxLength={2}
                        />
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="total-amount">
                        {formatDisplayValue(item.total)} ج.م
                      </div>
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
            <button
              onClick={addNewItem}
              className="button button-add"
              disabled={invoiceData.items.length >= 12 || hasIncompleteRow || hasIncompleteHeader}
            >
              <Plus className="button-icon" />
              إضافة صنف
            </button>
            
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
                <li>• تأكد من إلغاء خيار "طباعة الخلفية" أو "طباعة الرسومات" للطباعة بدون خلفية</li>
                <li>• سيتم طباعة بيانات العميل والتاريخ والأصناف فقط</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div>
          <div className="form-header">
            <h2 className="form-title">معاينة الطباعة</h2>
            <div className="button-group">
              <button 
                onClick={togglePreview}
                className="button button-preview"
              >
                <FileText className="button-icon" />
                رجوع للنموذج
              </button>
              <button 
                onClick={handlePrint}
                className="button button-print"
              >
                <Printer className="button-icon" />
                طباعة
              </button>
            </div>
          </div>
          
          <div className="preview-section">
            <p className="preview-info">
              تظهر هذه المعاينة كيف سيتم وضع البيانات على النموذج المطبوع مسبقاً.
              ستظهر البيانات فقط عند الطباعة، دون الخلفية أو عناصر النموذج.
            </p>
          </div>
          
          <div className="preview-container">
            <InvoicePreview 
              invoiceData={prepareDataForDisplay(invoiceData)}
            />
          </div>
        </div>
      )}

      {/* Print content */}
      <div className="print-content">
        <InvoicePreview 
          invoiceData={prepareDataForDisplay(invoiceData)}
          isPrintMode={true} 
        />
      </div>
    </div>
  );
};

export default InvoiceForm;