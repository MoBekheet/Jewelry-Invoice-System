import {InvoiceItem} from '../types/invoice';

/**
 * Calculate the total for a single invoice row
 */
export const calculateRowTotal = (item: InvoiceItem): number => {
  // Remove any thousand separators and convert to English numerals before parsing
  const poundValue = parseFloat(item.value.pound.replace(/,/g, '').replace(/،/g, '')) || 0;
  const piasterValue = parseFloat(item.value.piaster.replace(/,/g, '').replace(/،/g, '')) || 0;
  // Convert piasters to pounds and add to pound value
  return poundValue + (piasterValue / 100);
};

/**
 * Calculate the total for the entire invoice
 */
export const calculateInvoiceTotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => {
    // Use the updated calculateRowTotal to get the item's value including piasters
    const itemValue = calculateRowTotal(item);
    // Remove any thousand separators and convert to English numerals before parsing tax amount
    return sum + itemValue;
  }, 0);
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
