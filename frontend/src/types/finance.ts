import { Database } from './database.types';
import { FromDb } from './utils';

export type Asset = Database['public']['Tables']['assets']['Row'];
export type Liability = Database['public']['Tables']['liabilities']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type RecurringGeneratorRow = Database['public']['Tables']['recurring_generators']['Row'];

export type AssetType = Database['public']['Enums']['asset_type'];
export type LiabilityType = Database['public']['Enums']['liability_type'];
export type TransactionType = Database['public']['Enums']['transaction_type'];
export type CategoryNature = Database['public']['Enums']['category_nature'];
export type RecurringFrequency = Database['public']['Enums']['recurring_frequency'];

export const LIQUID_ASSET_TYPES: AssetType[] = [
  'bank_account',
  'cash',
  'credit_card',
];

export interface Transaction extends FromDb<TransactionRow> { }

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
  startDate: string;
  endDate?: string | null;
  nextDueDate: string; // Keep snake_case for consistency
  isActive: boolean; // Keep snake_case for consistency
  categoryId: string | null;
  assetId: string | null;
}

export interface RecurringRuleCreate {
  description: string;
  frequency: RecurringFrequency;
  startDate: string; // 'YYYY-MM-DD'
  endDate?: string | null;
  amount: number;
  currency: string;
  type: TransactionType;
  categoryId: string | null;
  assetId: string | null;
  destinationAssetId?: string | null;
}

export interface RecurringRuleUpdateDto {
  id: string;
  description: string;
  type: TransactionType;
  frequency: RecurringFrequency;
  startDate: string;
  isActive: boolean;
  categoryId: string | null;
  assetId: string | null;
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

export interface AssetCreateDto {
  name: string;
  type: AssetType;
  currency: string;
  initialValue: number;
  institution: string;
  description: string;
  customFields: Record<string, string>;
}

export interface LiabilityCreateDto {
  name: string;
  type: LiabilityType;
  currency: string;
  initialAmount: number;
  currentBalance: number;
  interestRate: number;
  description: string;
  customFields: Record<string, string>;
}

export interface LiabilityUpdateDto {
  name: string;
  interestRate: number;
  description: string;
  customFields: Record<string, string>;
}

export interface TransactionCreateDto {
  type: TransactionType;
  amountOriginal: number;
  currencyOriginal: string;
  description: string;
  date: string;
  categoryId: string;
  assetId: string;
  destinationAssetId: string;
  attachmentUrl: string | null;
  customFields: Record<string, string> | null;
  links: string[] | null;
}

export interface FuelLogCreateDto {
  quantity: number;
  quantityUnit: string;
  totalCost: number;
  currency: string;
  date: string;
  mileageAtFill: number;
  fullTank: boolean;
  station: string;
  notes: string;
  // --- Fields for cross-module logic ---
  syncToFinance: boolean;
  assetId: string; // Required if syncToFinance is true        
}