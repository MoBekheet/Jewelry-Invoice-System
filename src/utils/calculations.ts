import { InvoiceItem } from '../types/invoice';

/**
 * Calculate the total for a single invoice row
 */
export const calculateRowTotal = (item: InvoiceItem): number => {
  // Convert string inputs to numbers
  const pricePound = parseFloat(item.price.pound) || 0;
  const pricePiaster = parseFloat(item.price.piaster) || 0;
  const weightGrams = parseFloat(item.weight.grams) || 0;
  const weightMilligrams = parseFloat(item.weight.milligrams) || 0;
  
  // Convert piasters to pounds (100 piasters = 1 pound)
  const price = pricePound + (pricePiaster / 100);
  
  // Convert milligrams to grams (1000 mg = 1 g)
  const weight = weightGrams + (weightMilligrams / 1000);
  
  // Calculate total (price * weight) and round to 2 decimal places
  const total = price * weight;
  return Math.round(total * 100) / 100;
};

/**
 * Calculate the total for the entire invoice
 */
export const calculateInvoiceTotal = (items: InvoiceItem[]): number => {
  const total = items.reduce((sum, item) => sum + item.total, 0);
  return Math.round(total * 100) / 100;
};

/**
 * Format a number as currency
 */
export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Convert a string to a number or return 0 if invalid
 */
export const safeParseFloat = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};