export type AssetType = 'liquid_cash' | 'investment' | 'physical' | 'liability';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryNature = 'fixed' | 'variable' | 'savings' | 'emergency';

export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currentValue: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  nature: CategoryNature;
  iconSlug: string;
  color?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  assetId: string;
  isRecurring: boolean;
  recurringRuleId?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface RecurringRule {
  id: string;
  transactionId?: string;
  categoryId: string;
  assetId: string;
  frequency: RecurringFrequency;
  nextDueDate: string;
  projectedAmount: number;
  description: string;
  isActive: boolean;
}

export interface FinanceState {
  assets: Asset[];
  categories: Category[];
  transactions: Transaction[];
  recurringRules: RecurringRule[];
}

// Helper type for dashboard metrics
export interface DashboardMetrics {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyBurn: number;
  monthlyIncome: number;
  monthlyBudget: number;
  safeToSpend: number;
  upcomingBills: number;
}
