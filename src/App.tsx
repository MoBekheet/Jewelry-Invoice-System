import React from 'react';
import InvoiceTemplate from './components/InvoiceTemplate';
import './App.css';

function App() {
  const handleInputChange = (field: string, value: string) => {
    console.log(`${field}: ${value}`);
  };

  return (
    <div className="app-container">
      <InvoiceTemplate onInputChange={handleInputChange} />
    </div>
  );
}

export default App;