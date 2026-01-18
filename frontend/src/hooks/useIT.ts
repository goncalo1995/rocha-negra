import { useLocalStorage } from './useLocalStorage';
import { Domain, ITState, ITMetrics, DomainPriceChange } from '@/types/it';
import { useMemo, useCallback } from 'react';
import { useFinance } from './useFinance';

const STORAGE_KEY = 'rocha-negra-it';

const initialState: ITState = {
  domains: [],
};

export function useIT() {
  const [state, setState] = useLocalStorage<ITState>(STORAGE_KEY, initialState);
  const { addRecurringRule, deleteRecurringRule, updateRecurringRule, categories, assets } = useFinance();

  // Get or create IT category
  const getITCategory = useCallback(() => {
    return categories.find(c => c.name === 'Subscriptions') || categories[0];
  }, [categories]);

  // Get default asset for domain payments
  const getDefaultAsset = useCallback(() => {
    return assets.find(a => a.type === 'liquid_cash') || assets[0];
  }, [assets]);

  // Domain operations
  const addDomain = useCallback((domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt' | 'priceHistory'>) => {
    const newDomain: Domain = {
      ...domain,
      id: crypto.randomUUID(),
      priceHistory: [{ date: new Date().toISOString(), price: domain.currentPrice }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-create recurring rule for finance sync
    const category = getITCategory();
    const asset = getDefaultAsset();
    
    if (category && asset) {
      const rule = addRecurringRule({
        name: `Domain: ${domain.name}`,
        categoryId: category.id,
        assetId: asset.id,
        type: 'expense',
        frequency: 'yearly',
        dayOfMonth: new Date(domain.expirationDate).getDate(),
        nextDueDate: domain.expirationDate,
        projectedAmount: domain.currentPrice,
        description: `Annual renewal for ${domain.name}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      newDomain.linkedRecurringRuleId = rule.id;
    }

    setState(prev => ({ ...prev, domains: [...prev.domains, newDomain] }));
    return newDomain;
  }, [setState, addRecurringRule, getITCategory, getDefaultAsset]);

  const updateDomain = useCallback((id: string, updates: Partial<Domain>) => {
    setState(prev => {
      const domain = prev.domains.find(d => d.id === id);
      if (!domain) return prev;

      // Track price changes
      let priceHistory = domain.priceHistory;
      if (updates.currentPrice && updates.currentPrice !== domain.currentPrice) {
        priceHistory = [
          ...priceHistory,
          { date: new Date().toISOString(), price: updates.currentPrice }
        ];
      }

      // Update linked recurring rule if price or expiration changed
      if (domain.linkedRecurringRuleId && (updates.currentPrice || updates.expirationDate)) {
        updateRecurringRule(domain.linkedRecurringRuleId, {
          projectedAmount: updates.currentPrice ?? domain.currentPrice,
          nextDueDate: updates.expirationDate ?? domain.expirationDate,
        });
      }

      return {
        ...prev,
        domains: prev.domains.map(d =>
          d.id === id
            ? { ...d, ...updates, priceHistory, updatedAt: new Date().toISOString() }
            : d
        ),
      };
    });
  }, [setState, updateRecurringRule]);

  const deleteDomain = useCallback((id: string) => {
    const domain = state.domains.find(d => d.id === id);
    if (domain?.linkedRecurringRuleId) {
      deleteRecurringRule(domain.linkedRecurringRuleId);
    }
    setState(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d.id !== id),
    }));
  }, [setState, state.domains, deleteRecurringRule]);

  // Metrics
  const metrics = useMemo((): ITMetrics => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    const expiringThisMonth = state.domains.filter(d => {
      const exp = new Date(d.expirationDate);
      return exp >= now && exp <= endOfMonth;
    }).length;

    const expiringThisYear = state.domains.filter(d => {
      const exp = new Date(d.expirationDate);
      return exp >= now && exp <= endOfYear;
    }).length;

    const annualCost = state.domains.reduce((sum, d) => sum + d.currentPrice, 0);

    const sortedByExpiration = [...state.domains]
      .filter(d => new Date(d.expirationDate) >= now)
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

    return {
      totalDomains: state.domains.length,
      expiringThisMonth,
      expiringThisYear,
      annualCost,
      nextRenewal: sortedByExpiration[0] || null,
    };
  }, [state.domains]);

  // Export/Import
  const exportData = useCallback((): ITState => state, [state]);
  const importData = useCallback((data: Partial<ITState>) => {
    setState(prev => ({
      domains: data.domains ?? prev.domains,
    }));
  }, [setState]);

  return {
    domains: state.domains,
    metrics,
    addDomain,
    updateDomain,
    deleteDomain,
    exportData,
    importData,
  };
}
