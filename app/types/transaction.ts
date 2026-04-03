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
  isZelle?: boolean;
  source?: string;

  // 3-pocket budget fields
  pocket?: import('./pocket').PocketType;
  pocketCategory?: import('./pocket').PocketCategory;
  pocketConfidence?: 'high' | 'medium' | 'low';
  pocketMatchedBy?: string;
  isOverride?: boolean;
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
  affectsBudget?: boolean;
}

export type AppCategory = 'food' | 'shopping' | 'health' | 'entertainment' | 'other' | 'transportation' | 'utilities' | 'transfer'

export type IncomeCategory = 'payroll' | 'zelle' | 'direct_deposit' | 'transfer_in' | 'other_income'