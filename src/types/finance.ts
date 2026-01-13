export type AssetType = 'liquid_cash' | 'investment' | 'crypto' | 'physical' | 'liability';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryNature = 'fixed' | 'variable' | 'savings' | 'emergency';

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  currentValue: number;
  currency: string;
  description?: string;
  // For crypto assets
  ticker?: string;
  quantity?: number;
  // For depreciating assets
  purchaseValue?: number;
  purchaseDate?: string;
  depreciationRate?: number; // Annual percentage
  // For maintenance tracking
  lastMaintenanceDate?: string;
  maintenanceIntervalMonths?: number;
  estimatedMaintenanceCost?: number;
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
  budgetLimit?: number; // Monthly budget for this category
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  assetId: string;
  toAssetId?: string; // For transfers
  isRecurring: boolean;
  recurringRuleId?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface RecurringRule {
  id: string;
  name: string;
  transactionId?: string;
  categoryId: string;
  assetId: string;
  type: TransactionType;
  frequency: RecurringFrequency;
  dayOfMonth?: number; // 1-31, for monthly/quarterly/yearly
  nextDueDate: string;
  projectedAmount: number;
  description: string;
  isActive: boolean;
  createdAt: string;
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
  upcomingBillsCount: number;
}

// For projections
export interface ProjectedMonth {
  month: string;
  date: Date;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  cumulativeBalance: number;
}

// Calendar event types
export interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  amount: number;
  type: 'transaction' | 'recurring' | 'maintenance';
  transactionType?: TransactionType;
  categoryId?: string;
  isPast: boolean;
}
