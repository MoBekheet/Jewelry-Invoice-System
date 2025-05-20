import { InvoiceData } from '../types/invoice';

/**
 * Save an invoice to localStorage
 */
export const saveInvoice = (invoice: InvoiceData): void => {
  try {
    const key = `invoice-${invoice.mobileNumber || Date.now()}`;
    localStorage.setItem(key, JSON.stringify(invoice));
  } catch (error) {
    console.error('Error saving invoice:', error);
  }
};

/**
 * Get a list of all saved invoices
 */
export const getSavedInvoices = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('invoice-')) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Load an invoice from localStorage
 */
export const loadInvoice = (key: string): InvoiceData | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as InvoiceData;
  } catch (error) {
    console.error('Error loading invoice:', error);
    return null;
  }
};

/**
 * Delete an invoice from localStorage
 */
export const deleteInvoice = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error deleting invoice:', error);
  }
};
