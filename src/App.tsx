import React from 'react';
import { DiamondIcon } from 'lucide-react';
import InvoiceForm from './components/InvoiceForm';
import './App.css';
import './styles/main.css';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="header-container">
          <DiamondIcon className="header-icon" />
          <h1 className="header-title">نظام فواتير مجوهرات أبي سيفين</h1>
        </div>
      </header>
      
      <main className="main-container">
        <InvoiceForm />
      </main>
      
      <footer className="footer">
        <div className="footer-container">
          <p>© 2025 مجوهرات أبي سيفين. جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
}

export default App;