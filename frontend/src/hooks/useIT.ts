import { Domain, ITMetrics, DomainCreate, DomainUpdate } from '@/types/it';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useIT() {
  const queryClient = useQueryClient();

  const { data: domains, isLoading } = useQuery<Domain[]>({
    queryKey: ['domains'],
    queryFn: async () => (await api.get('/domains')).data,
  });

  // Domain operations
  // --- MUTATION: Add a new domain ---
  const { mutate: addDomain } = useMutation({
    mutationFn: (newDomain: DomainCreate) => api.post('/domains', newDomain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-generators'] }); // Also refetch rules
    },
    // You should add onError handling with toasts
  });

  const { mutate: addDomainsBulk } = useMutation({
    mutationFn: (newDomains: DomainCreate[]) => api.post('/domains/bulk', newDomains),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-generators'] }); // Also refetch rules
    },
    // You should add onError handling with toasts
  });

  // --- MUTATION: Update a domain ---
  const { mutate: updateDomain } = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DomainUpdate }) => api.patch(`/domains/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
    },
  });

  // --- MUTATION: Delete a domain ---
  const { mutate: deleteDomain } = useMutation({
    mutationFn: (id: string) => api.delete(`/domains/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-generators'] }); // Refetch rules
    },
  });

  // Metrics
  const metrics = useMemo((): ITMetrics => {
    if (!domains) return {
      totalDomains: 0,
      expiringThisMonth: 0,
      expiringThisYear: 0,
      annualCost: 0,
      nextRenewal: null,
    };
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    const expiringThisMonth = domains.filter(d => {
      const exp = new Date(d.expirationDate);
      return exp >= now && exp <= endOfMonth;
    }).length;

    const expiringThisYear = domains.filter(d => {
      const exp = new Date(d.expirationDate);
      return exp >= now && exp <= endOfYear;
    }).length;

    const annualCost = domains.filter(d => d.status !== 'expired').reduce((sum, d) => sum + d.currentPrice, 0);

    const sortedByExpiration = [...domains]
      .filter(d => new Date(d.expirationDate) >= now)
      .sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());

    return {
      totalDomains: domains.length,
      expiringThisMonth,
      expiringThisYear,
      annualCost,
      nextRenewal: sortedByExpiration[0] || null,
    };
  }, [domains]);

  return {
    domains,
    metrics,
    addDomain,
    addDomainsBulk,
    updateDomain,
    deleteDomain,
  };
}
