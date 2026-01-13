import { useLocalStorage } from './useLocalStorage';
import { Asset, Category, Transaction, RecurringRule, FinanceState, DashboardMetrics } from '@/types/finance';
import { defaultCategories } from '@/data/defaultCategories';
import { useMemo, useCallback } from 'react';

const STORAGE_KEY = 'rocha-negra-finance';

const initialState: FinanceState = {
  assets: [],
  categories: defaultCategories,
  transactions: [],
  recurringRules: [],
};

export function useFinance() {
  const [state, setState] = useLocalStorage<FinanceState>(STORAGE_KEY, initialState);

  // Asset operations
  const addAsset = useCallback((asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: Asset = {
      ...asset,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, assets: [...prev.assets, newAsset] }));
    return newAsset;
  }, [setState]);

  const updateAsset = useCallback((id: string, updates: Partial<Asset>) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.map(a =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  }, [setState]);

  const deleteAsset = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== id),
    }));
  }, [setState]);

  // Transaction operations
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ ...prev, transactions: [...prev.transactions, newTransaction] }));
    
    // Update asset value based on transaction
    const asset = state.assets.find(a => a.id === transaction.assetId);
    if (asset) {
      const change = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      updateAsset(asset.id, { currentValue: asset.currentValue + change });
    }
    
    return newTransaction;
  }, [setState, state.assets, updateAsset]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, [setState]);

  const deleteTransaction = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  }, [setState]);

  // Category operations
  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    setState(prev => ({ ...prev, categories: [...prev.categories, newCategory] }));
    return newCategory;
  }, [setState]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, [setState]);

  const deleteCategory = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  }, [setState]);

  // Recurring rule operations
  const addRecurringRule = useCallback((rule: Omit<RecurringRule, 'id'>) => {
    const newRule: RecurringRule = {
      ...rule,
      id: crypto.randomUUID(),
    };
    setState(prev => ({ ...prev, recurringRules: [...prev.recurringRules, newRule] }));
    return newRule;
  }, [setState]);

  const updateRecurringRule = useCallback((id: string, updates: Partial<RecurringRule>) => {
    setState(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.map(r => (r.id === id ? { ...r, ...updates } : r)),
    }));
  }, [setState]);

  const deleteRecurringRule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.filter(r => r.id !== id),
    }));
  }, [setState]);

  // Dashboard metrics
  const metrics = useMemo((): DashboardMetrics => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate totals
    const totalAssets = state.assets
      .filter(a => a.type !== 'liability')
      .reduce((sum, a) => sum + a.currentValue, 0);

    const totalLiabilities = state.assets
      .filter(a => a.type === 'liability')
      .reduce((sum, a) => sum + Math.abs(a.currentValue), 0);

    const netWorth = totalAssets - totalLiabilities;

    // Current month transactions
    const currentMonthTransactions = state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBurn = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate upcoming bills (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingBills = state.recurringRules
      .filter(r => {
        const dueDate = new Date(r.nextDueDate);
        return r.isActive && dueDate >= now && dueDate <= thirtyDaysFromNow;
      })
      .reduce((sum, r) => sum + r.projectedAmount, 0);

    // Safe to spend = Liquid cash - upcoming fixed bills
    const liquidCash = state.assets
      .filter(a => a.type === 'liquid_cash')
      .reduce((sum, a) => sum + a.currentValue, 0);

    const safeToSpend = Math.max(0, liquidCash - upcomingBills);

    // Simple budget estimation (average of last 3 months or current month's income)
    const monthlyBudget = monthlyIncome > 0 ? monthlyIncome : 0;

    const upcomingBillsCount = state.recurringRules.filter(r => {
      const dueDate = new Date(r.nextDueDate);
      return r.isActive && dueDate >= now && dueDate <= thirtyDaysFromNow;
    }).length;

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyBurn,
      monthlyIncome,
      monthlyBudget,
      safeToSpend,
      upcomingBills,
      upcomingBillsCount,
    };
  }, [state.assets, state.transactions, state.recurringRules]);

  // Get transactions for a specific month
  const getMonthlyTransactions = useCallback((year: number, month: number) => {
    return state.transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [state.transactions]);

  // Get category by id
  const getCategoryById = useCallback((id: string) => {
    return state.categories.find(c => c.id === id);
  }, [state.categories]);

  // Get asset by id
  const getAssetById = useCallback((id: string) => {
    return state.assets.find(a => a.id === id);
  }, [state.assets]);

  return {
    // State
    assets: state.assets,
    categories: state.categories,
    transactions: state.transactions,
    recurringRules: state.recurringRules,
    metrics,

    // Asset operations
    addAsset,
    updateAsset,
    deleteAsset,

    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Category operations
    addCategory,
    updateCategory,
    deleteCategory,

    // Recurring rule operations
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,

    // Helpers
    getMonthlyTransactions,
    getCategoryById,
    getAssetById,
  };
}
