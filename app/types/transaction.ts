export interface TransactionData {
  transactionId: string;
  name: string;
  amount: number;
  date: string;

  isoCurrencyCode?: string | null;
  unofficialCurrencyCode?: string | null;
  merchantName?: string | null;

  category: AppCategory;
  paymentChannel?: string;
  pending?: boolean;
  accountId: string;
}

export type AppCategory = 'food' | 'shopping' | 'health' | 'entertainment' | 'other' | 'transportation' | 'utilities'