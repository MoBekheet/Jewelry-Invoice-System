import { InvoiceItem } from '../types/invoice';

/**
 * Calculate the total for a single invoice row
 */
export const calculateRowTotal = (item: InvoiceItem): number => {
  // Return the value as is without any calculations
  return parseFloat(item.value.pound) || 0;
};

/**
 * Calculate the total for the entire invoice
 */
export const calculateInvoiceTotal = (items: InvoiceItem[]): number => {
  const total = items.reduce((sum, item) => {
    const valuePound = parseFloat(item.value.pound) || 0;
    const taxAmount = item.hasTax ? (parseFloat(item.tax.amount) || 0) : 0;
    return sum + valuePound + taxAmount;
  }, 0);
  return total;
};

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return amount.toString();
};

/**
 * Convert a string to a number or return 0 if invalid
 */
export const safeParseFloat = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};