import { Database } from './database.types';
import { FromDb } from './utils';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Asset = Database['public']['Tables']['assets']['Row'];
export type Liability = Database['public']['Tables']['liabilities']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

type RecurringGeneratorRow = Database['public']['Tables']['recurring_generators']['Row'];

export type AssetType = Database['public']['Enums']['asset_type'];
export type LiabilityType = Database['public']['Enums']['liability_type'];
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type CategoryNature = Database['public']['Enums']['category_nature'];
export type RecurringFrequency = Database['public']['Enums']['recurring_frequency'];

export interface RecurringGenerator extends FromDb<Omit<RecurringGeneratorRow, 'frequency'>> {
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

// This is the type for VIEWING a recurring rule, matching the DTO
export interface RecurringRule {
  id: string; // UUID becomes string
  description: string;
  amount: number; // BigDecimal becomes number
  currency: string;
  type: TransactionType;
  frequency: RecurringFrequency;
  next_due_date: string; // Keep snake_case for consistency
  is_active: boolean; // Keep snake_case for consistency
  category_id: string | null;
  asset_id: string | null;
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
