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
  accountName?: string;
  institutionName?: string;
}

export interface IncomeTransaction {
  transactionId: string;
  name: string;
  amount: number;
  date: string;
  category: IncomeCategory;
  accountId: string;
  accountName?: string;
  institutionName?: string;
  merchantName?: string | null;
}

export type AppCategory = 'food' | 'shopping' | 'health' | 'entertainment' | 'other' | 'transportation' | 'utilities' | 'transfer'

export type IncomeCategory = 'payroll' | 'zelle' | 'direct_deposit' | 'transfer_in' | 'other_income'