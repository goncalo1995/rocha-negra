import { Database } from './database.types';
import { FromDb } from './utils';

type AssetRow = Database['public']['Tables']['assets']['Row'];
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type RecurringRuleRow = Database['public']['Tables']['recurring_rules']['Row'];

export type AssetType = 'liquid_cash' | 'investment' | 'crypto' | 'physical' | 'liability';
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type CategoryNature = Database['public']['Enums']['category_nature'];
export type RecurringFrequency = Database['public']['Enums']['recurring_frequency'];

export interface Asset extends FromDb<Omit<AssetRow, 'type'>> {
  type: AssetType;
}

export interface Category extends FromDb<Omit<CategoryRow, 'type' | 'nature'>> {
  type: 'income' | 'expense';
  nature: CategoryNature;
}

export interface Transaction extends FromDb<Omit<TransactionRow, 'type'>> {
  type: TransactionType;
}

export interface RecurringRule extends FromDb<Omit<RecurringRuleRow, 'frequency'>> {
  frequency: RecurringFrequency;
  // UI-only or transient fields
  name?: string;
  type?: TransactionType;
}

export interface FinanceState {
  assets: Asset[];
  categories: Category[];
  transactions: Transaction[];
  recurringRules: RecurringRule[];
}

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

export interface ProjectedMonth {
  month: string;
  date: Date;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  cumulativeBalance: number;
}

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
