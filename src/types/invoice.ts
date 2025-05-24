export interface InvoiceItem {
  id: string;
  description: string;
  weight: {
    grams: string;
    milligrams: string;
  };
  karat: string;
  value: {
    pound: string;
    piaster: string;
  };
  price: {
    pound: string;
    piaster: string;
  };
  total: number;
  // Tax related fields
  hasTax: boolean;
  tax: {
    amount: string;
  };
  taxNote: string;
  // Formatted values for display
  formattedWeight?: {
    grams: string;
    milligrams: string;
  };
  formattedKarat?: string;
  formattedValue?: {
    pound: string;
    piaster: string;
  };
  formattedPrice?: {
    pound: string;
    piaster: string;
  };
  formattedTotal?: string;
  formattedTax?: {
    amount: string;
  };
}

export interface InvoiceData {
  mobileNumber: string;
  date: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  formattedTotalAmount?: string;
}
