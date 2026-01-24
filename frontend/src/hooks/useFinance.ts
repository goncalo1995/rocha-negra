import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Asset, Category, Transaction, DashboardMetrics, RecurringRule } from '@/types/finance';
import { useCallback, useMemo } from 'react';

export function useFinance() {
  const queryClient = useQueryClient();

  // Queries
  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await api.get<Asset[]>('/assets');
      return response.data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/categories');
      return response.data;
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get<{ content: Transaction[] }>('/transactions');
      return response.data.content;
    },
  });

  const { data: recurringRules = [] } = useQuery({
    queryKey: ['recurring-rules'],
    queryFn: async () => {
      const response = await api.get<RecurringRule[]>('/recurring-rules');
      return response.data;
    },
  });

  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.get<any>('/dashboard');
      return response.data;
    },
  });

  // Mapping backend dashboard to frontend metrics
  const metrics: DashboardMetrics = useMemo(() => ({
    netWorth: metricsData?.totalNetWorth || 0,
    totalAssets: metricsData?.totalNetWorth || 0, // Simplified
    totalLiabilities: 0,
    monthlyBurn: Math.abs(metricsData?.monthlyExpenses || 0),
    monthlyIncome: metricsData?.monthlyIncome || 0,
    monthlyBudget: metricsData?.monthlyIncome || 0,
    safeToSpend: metricsData?.monthlySavings || 0,
    upcomingBills: 0,
    upcomingBillsCount: 0,
  }), [metricsData]);

  // Asset Mutations
  const addAssetMutation = useMutation({
    mutationFn: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => api.post('/assets', asset),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Asset> }) => api.patch(`/assets/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  // Transaction Mutations
  const addTransactionMutation = useMutation({
    mutationFn: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => api.post('/transactions', transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Transaction> }) => api.patch(`/transactions/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const addTransactionsMutation = useMutation({
    mutationFn: (transactions: Omit<Transaction, 'id' | 'createdAt'>[]) => api.post('/transactions/bulk', transactions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  // Category Mutations
  const addCategoryMutation = useMutation({
    mutationFn: (category: Omit<Category, 'id'>) => api.post('/categories', category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // Recurring Rule Mutations
  const addRecurringRuleMutation = useMutation({
    mutationFn: (rule: Omit<RecurringRule, 'id'>) => api.post('/recurring-rules', rule),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
  });

  const updateRecurringRuleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RecurringRule> }) => api.patch(`/recurring-rules/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
  });

  const deleteRecurringRuleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/recurring-rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring-rules'] }),
  });

  // Callbacks to maintain original API
  const addAsset = useCallback(async (asset: any) => addAssetMutation.mutateAsync(asset), [addAssetMutation]);
  const updateAsset = useCallback(async (id: string, updates: any) => updateAssetMutation.mutateAsync({ id, updates }), [updateAssetMutation]);
  const deleteAsset = useCallback(async (id: string) => deleteAssetMutation.mutateAsync(id), [deleteAssetMutation]);

  const addTransaction = useCallback(async (transaction: any) => addTransactionMutation.mutateAsync(transaction), [addTransactionMutation]);
  const addTransactions = useCallback(async (transactions: any[]) => {
    await addTransactionsMutation.mutateAsync(transactions);
  }, [addTransactionsMutation]);
  const updateTransaction = useCallback(async (id: string, updates: any) => updateTransactionMutation.mutateAsync({ id, updates }), [updateTransactionMutation]);
  const deleteTransaction = useCallback(async (id: string) => deleteTransactionMutation.mutateAsync(id), [deleteTransactionMutation]);

  const addCategory = useCallback(async (category: any) => addCategoryMutation.mutateAsync(category), [addCategoryMutation]);
  const deleteCategory = useCallback(async (id: string) => deleteCategoryMutation.mutateAsync(id), [deleteCategoryMutation]);

  const addRecurringRule = useCallback(async (rule: any) => addRecurringRuleMutation.mutateAsync(rule), [addRecurringRuleMutation]);
  const updateRecurringRule = useCallback(async (id: string, updates: any) => updateRecurringRuleMutation.mutateAsync({ id, updates }), [updateRecurringRuleMutation]);
  const deleteRecurringRule = useCallback(async (id: string) => deleteRecurringRuleMutation.mutateAsync(id), [deleteRecurringRuleMutation]);

  const getAssetById = useCallback((id: string) => assets.find(a => a.id === id), [assets]);
  const getCategoryById = useCallback((id: string) => categories.find(c => c.id === id), [categories]);

  const exportData = useCallback(() => {
    return {
      assets,
      categories,
      transactions,
      recurringRules,
    };
  }, [assets, categories, transactions, recurringRules]);

  const importData = useCallback(async (data: Partial<any>) => {
    const assetIdMap: Record<string, string> = {};
    const categoryIdMap: Record<string, string> = {};

    // 1. Import or Map Categories
    if (data.categories) {
      for (const cat of data.categories) {
        let existing = categories.find(c => c.name === cat.name && c.type === cat.type);
        if (!existing) {
          try {
            const res = await addCategory(cat);
            existing = res.data;
          } catch (e) {
            console.error('Failed to import category', cat.name, e);
          }
        }
        if (existing) categoryIdMap[cat.id] = existing.id;
      }
    }

    // 2. Import or Map Assets
    if (data.assets) {
      for (const asset of data.assets) {
        let existing = assets.find(a => a.name === asset.name);
        if (!existing) {
          try {
            const res = await addAsset(asset);
            existing = res.data;
          } catch (e) {
            console.error('Failed to import asset', asset.name, e);
          }
        }
        if (existing) assetIdMap[asset.id] = existing.id;
      }
    }

    // // 3. Import Recurring Rules (using maps)
    // if (data.recurringRules) {
    //   for (const rule of data.recurringRules) {
    //     if (!recurringRules.find(r => r.name === rule.name)) {
    //       const mappedRule = {
    //         ...rule,
    //         assetId: assetIdMap[rule.assetId] || rule.assetId,
    //         categoryId: categoryIdMap[rule.categoryId] || rule.categoryId,
    //       };
    //       await addRecurringRule(mappedRule);
    //     }
    //   }
    // }

    // 4. Import Transactions (using maps)
    // if (data.transactions) {
    //   const transactionsToImport = [];
    //   for (const t of data.transactions) {
    //     const alreadyExists = transactions.find(
    //       existing =>
    //         existing.date === t.date &&
    //         existing.amount === t.amount &&
    //         existing.description === t.description
    //     );
    //     if (!alreadyExists) {
    //       transactionsToImport.push({
    //         ...t,
    //         assetId: assetIdMap[t.assetId] || t.assetId,
    //         categoryId: categoryIdMap[t.categoryId] || t.categoryId,
    //       });
    //     }
    //   }
    //   if (transactionsToImport.length > 0) {
    //     await addTransactions(transactionsToImport);
    //   }
    // }

    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['recurring-rules'] });
  }, [categories, assets, recurringRules, transactions, addCategory, addAsset, addRecurringRule, addTransactions, queryClient]);

  return {
    assets,
    categories,
    transactions,
    recurringRules,
    metrics,
    isLoadingMetrics,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    getAssetById,
    getCategoryById,
    exportData,
    importData,
  };
}
