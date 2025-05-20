import React from 'react';

interface ReceiptTableProps {
  rows?: number;
}

const ReceiptTable: React.FC<ReceiptTableProps> = ({ rows = 18 }) => {
  const headers = [
    { title: 'الصنف', width: '5.2cm' },
    { title: 'فئة (جنيه)', width: '1.6cm' },
    { title: 'فئة (قرش)', width: '1.2cm' },
    { title: 'العيار', width: '1.8cm' },
    { title: 'الوزن (جرام)', width: '1.6cm' },
    { title: 'الوزن (ملي)', width: '1.6cm' },
    { title: 'القيمة (جنيه)', width: '2.0cm' },
  ];

  return (
    <div className="receipt-table-container" dir="rtl">
      <table className="receipt-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th 
                key={index}
                style={{ 
                  width: header.width,
                  minWidth: header.width,
                  maxWidth: header.width
                }}
              >
                {header.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((_, colIndex) => (
                <td key={colIndex}>
                  <input 
                    type="text"
                    className="receipt-input"
                    style={{
                      width: '100%',
                      textAlign: 'center'
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceiptTable;