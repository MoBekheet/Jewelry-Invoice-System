import React, { useState } from 'react';
import { Move, Maximize2, Type } from 'lucide-react';

interface PrintPosition {
  top: number;
  right: number;
  width: number;
  fontSize: number;
}

export interface PrintSettings {
  date: PrintPosition;
  customerName: PrintPosition;
  mobileNumber: PrintPosition;
  items: {
    description: PrintPosition;
    weight: PrintPosition;
    karat: PrintPosition;
    price: PrintPosition;
    value: PrintPosition;
  };
  total: PrintPosition;
}

export const defaultSettings: PrintSettings = {
  date: { top: 51.5, right: 26, width: 32, fontSize: 16 },
  customerName: { top: 58.5, right: 40.5, width: 47, fontSize: 16 },
  mobileNumber: { top: 58.5, right: 96, width: 32, fontSize: 16 },
  items: {
    description: { top: 0, right: 100, width: 52, fontSize: 16 },
    weight: { top: 0, right: 42, width: 14.2, fontSize: 16 },
    karat: { top: 0, right: 63, width: 10.5, fontSize: 16 },
    price: { top: 0, right: 75.2, width: 15, fontSize: 16 },
    value: { top: 0, right: 12, width: 23.5, fontSize: 16 }
  },
  total: { top: 167.5, right: 13.5, width: 32, fontSize: 16 }
};

interface PrintSettingsProps {
  settings: PrintSettings;
  onSettingsChange: (settings: PrintSettings) => void;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ settings, onSettingsChange }) => {
  const [activeElement, setActiveElement] = useState<string | null>(null);

  const handlePositionChange = (element: string, field: keyof PrintPosition, value: number) => {
    const newSettings = { ...settings };
    if (element.includes('.')) {
      const [parent, child] = element.split('.');
      newSettings[parent as keyof PrintSettings] = {
        ...newSettings[parent as keyof PrintSettings],
        [child]: {
          ...(newSettings[parent as keyof PrintSettings] as any)[child],
          [field]: value
        }
      };
    } else {
      (newSettings[element as keyof PrintSettings] as PrintPosition)[field] = value;
    }
    onSettingsChange(newSettings);
  };

  const renderPositionInputs = (element: string, value: PrintPosition) => (
    <div className="position-inputs">
      <div className="position-input-group">
        <div className="position-input-label">
          <Move size={16} />
          <span>الموقع</span>
        </div>
        <div className="position-input-row">
          <div className="position-input">
            <label>من أعلى (مم)</label>
            <input
              type="number"
              value={value.top}
              onChange={(e) => handlePositionChange(element, 'top', Number(e.target.value))}
            />
          </div>
          <div className="position-input">
            <label>من اليمين (مم)</label>
            <input
              type="number"
              value={value.right}
              onChange={(e) => handlePositionChange(element, 'right', Number(e.target.value))}
            />
          </div>
        </div>
      </div>
      <div className="position-input-group">
        <div className="position-input-label">
          <Maximize2 size={16} />
          <span>الأبعاد</span>
        </div>
        <div className="position-input-row">
          <div className="position-input">
            <label>العرض (مم)</label>
            <input
              type="number"
              value={value.width}
              onChange={(e) => handlePositionChange(element, 'width', Number(e.target.value))}
            />
          </div>
          <div className="position-input">
            <label>حجم الخط</label>
            <div className="font-size-input">
              <input
                type="number"
                value={value.fontSize}
                onChange={(e) => handlePositionChange(element, 'fontSize', Number(e.target.value))}
              />
              <Type size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!settings) return null;

  return (
    <div className="print-settings-panel">
      <div className="settings-section">
        <h3>العناصر الرئيسية</h3>
        {Object.entries(settings).map(([key, value]) => {
          if (key === 'items') return null;
          return (
            <div 
              key={key} 
              className={`position-controls ${activeElement === key ? 'active' : ''}`}
              onClick={() => setActiveElement(key)}
            >
              <h4>{key}</h4>
              {renderPositionInputs(key, value as PrintPosition)}
            </div>
          );
        })}
      </div>

      <div className="settings-section">
        <h3>عناصر الأصناف</h3>
        {Object.entries(settings.items).map(([key, value]) => (
          <div 
            key={key} 
            className={`position-controls ${activeElement === `items.${key}` ? 'active' : ''}`}
            onClick={() => setActiveElement(`items.${key}`)}
          >
            <h4>{key}</h4>
            {renderPositionInputs(`items.${key}`, value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintSettings; 