import { useState, useEffect, useCallback } from 'react';
import type { Asset, Category, Transaction, RecurringRule, FinanceState, DashboardMetrics } from '@/types/finance';

// This hook is designed to work with Supabase
// Replace the placeholder with your actual Supabase client import:
// import { supabase } from '@/integrations/supabase/client';

// Placeholder - replace with actual supabase client when connected
const supabase: any = null;

export function useSupabaseFinance() {
  const [state, setState] = useState<FinanceState>({
    assets: [],
    categories: [],
    transactions: [],
    recurringRules: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all finance data
  const fetchAllData = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not connected');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [assetsRes, categoriesRes, transactionsRes, rulesRes] = await Promise.all([
        supabase.from('assets').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('recurring_rules').select('*').order('next_due_date'),
      ]);

      if (assetsRes.error) throw assetsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (rulesRes.error) throw rulesRes.error;

      setState({
        assets: mapAssetsFromDB(assetsRes.data || []),
        categories: mapCategoriesFromDB(categoriesRes.data || []),
        transactions: mapTransactionsFromDB(transactionsRes.data || []),
        recurringRules: mapRulesFromDB(rulesRes.data || []),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Asset CRUD operations
  const addAsset = async (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('assets')
      .insert({
        name: asset.name,
        type: asset.type,
        current_value: asset.currentValue,
        currency: asset.currency,
        description: asset.description,
      })
      .select()
      .single();

    if (error) throw error;
    
    setState(prev => ({
      ...prev,
      assets: [mapAssetFromDB(data), ...prev.assets],
    }));

    return data;
  };

  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    if (!supabase) return;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.currentValue !== undefined) dbUpdates.current_value = updates.currentValue;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.description !== undefined) dbUpdates.description = updates.description;

    const { data, error } = await supabase
      .from('assets')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      assets: prev.assets.map(a => a.id === id ? mapAssetFromDB(data) : a),
    }));
  };

  const deleteAsset = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;

    setState(prev => ({
      ...prev,
      assets: prev.assets.filter(a => a.id !== id),
    }));
  };

  // Category CRUD operations
  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        type: category.type,
        nature: category.nature,
        icon_slug: category.iconSlug,
        color: category.color,
      })
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      categories: [...prev.categories, mapCategoryFromDB(data)],
    }));
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!supabase) return;

    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.nature !== undefined) dbUpdates.nature = updates.nature;
    if (updates.iconSlug !== undefined) dbUpdates.icon_slug = updates.iconSlug;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { data, error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? mapCategoryFromDB(data) : c),
    }));
  };

  const deleteCategory = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;

    setState(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  };

  // Transaction CRUD operations
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        type: transaction.type,
        category_id: transaction.categoryId,
        asset_id: transaction.assetId,
        is_recurring: transaction.isRecurring,
        recurring_rule_id: transaction.recurringRuleId,
        attachment_url: transaction.attachmentUrl,
      })
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      transactions: [mapTransactionFromDB(data), ...prev.transactions],
    }));

    return data;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!supabase) return;

    const dbUpdates: any = {};
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.assetId !== undefined) dbUpdates.asset_id = updates.assetId;
    if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
    if (updates.attachmentUrl !== undefined) dbUpdates.attachment_url = updates.attachmentUrl;

    const { data, error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? mapTransactionFromDB(data) : t),
    }));
  };

  const deleteTransaction = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;

    setState(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
    }));
  };

  // Recurring Rule CRUD operations
  const addRecurringRule = async (rule: Omit<RecurringRule, 'id'>) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('recurring_rules')
      .insert({
        transaction_id: rule.transactionId,
        category_id: rule.categoryId,
        asset_id: rule.assetId,
        frequency: rule.frequency,
        next_due_date: rule.nextDueDate,
        projected_amount: rule.projectedAmount,
        description: rule.description,
        is_active: rule.isActive,
      })
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      recurringRules: [...prev.recurringRules, mapRuleFromDB(data)],
    }));
  };

  const updateRecurringRule = async (id: string, updates: Partial<RecurringRule>) => {
    if (!supabase) return;

    const dbUpdates: any = {};
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.nextDueDate !== undefined) dbUpdates.next_due_date = updates.nextDueDate;
    if (updates.projectedAmount !== undefined) dbUpdates.projected_amount = updates.projectedAmount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data, error } = await supabase
      .from('recurring_rules')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setState(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.map(r => r.id === id ? mapRuleFromDB(data) : r),
    }));
  };

  const deleteRecurringRule = async (id: string) => {
    if (!supabase) return;

    const { error } = await supabase.from('recurring_rules').delete().eq('id', id);
    if (error) throw error;

    setState(prev => ({
      ...prev,
      recurringRules: prev.recurringRules.filter(r => r.id !== id),
    }));
  };

  // Calculate dashboard metrics
  const getMetrics = useCallback((): DashboardMetrics => {
    const { assets, transactions, recurringRules } = state;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const totalAssets = assets
      .filter(a => a.type !== 'liability')
      .reduce((sum, a) => sum + a.currentValue, 0);

    const totalLiabilities = assets
      .filter(a => a.type === 'liability')
      .reduce((sum, a) => sum + Math.abs(a.currentValue), 0);

    const netWorth = totalAssets - totalLiabilities;

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBurn = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const liquidCash = assets
      .filter(a => a.type === 'liquid_cash')
      .reduce((sum, a) => sum + a.currentValue, 0);

    const upcomingBills = recurringRules
      .filter(r => {
        if (!r.isActive) return false;
        const dueDate = new Date(r.nextDueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0 && daysUntilDue <= 30;
      })
      .reduce((sum, r) => sum + r.projectedAmount, 0);

    const safeToSpend = liquidCash - upcomingBills;
    const monthlyBudget = monthlyIncome * 0.7;

    const upcomingBillsCount = recurringRules.filter(r => {
      if (!r.isActive) return false;
      const dueDate = new Date(r.nextDueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue >= 0 && daysUntilDue <= 30;
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
  }, [state]);

  return {
    ...state,
    loading,
    error,
    refetch: fetchAllData,
    getMetrics,
    addAsset,
    updateAsset,
    deleteAsset,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
  };
}

// Database mapping helpers
function mapAssetFromDB(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currentValue: parseFloat(row.current_value),
    currency: row.currency,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAssetsFromDB(rows: any[]): Asset[] {
  return rows.map(mapAssetFromDB);
}

function mapCategoryFromDB(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    nature: row.nature,
    iconSlug: row.icon_slug,
    color: row.color,
  };
}

function mapCategoriesFromDB(rows: any[]): Category[] {
  return rows.map(mapCategoryFromDB);
}

function mapTransactionFromDB(row: any): Transaction {
  return {
    id: row.id,
    amount: parseFloat(row.amount),
    description: row.description,
    date: row.date,
    type: row.type,
    categoryId: row.category_id,
    assetId: row.asset_id,
    isRecurring: row.is_recurring,
    recurringRuleId: row.recurring_rule_id,
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
  };
}

function mapTransactionsFromDB(rows: any[]): Transaction[] {
  return rows.map(mapTransactionFromDB);
}

function mapRuleFromDB(row: any): RecurringRule {
  return {
    id: row.id,
    name: row.name || row.description,
    transactionId: row.transaction_id,
    categoryId: row.category_id,
    assetId: row.asset_id,
    type: row.type || 'expense',
    frequency: row.frequency,
    dayOfMonth: row.day_of_month,
    nextDueDate: row.next_due_date,
    projectedAmount: parseFloat(row.projected_amount),
    description: row.description,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function mapRulesFromDB(rows: any[]): RecurringRule[] {
  return rows.map(mapRuleFromDB);
}
