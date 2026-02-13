import { useState, useEffect } from 'react';
import { DashboardWidget, WidgetType } from '@/types/dashboard';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const DEFAULT_WIDGETS: DashboardWidget[] = [
    { id: 'tasks', type: 'tasks', enabled: true, order: 0 },
    { id: 'financial', type: 'financial', enabled: true, order: 1 },
    { id: 'projects', type: 'projects', enabled: true, order: 2 },
    { id: 'transactions', type: 'transactions', enabled: true, order: 3 },
    { id: 'it', type: 'it', enabled: true, order: 4 },
    { id: 'vehicles', type: 'vehicles', enabled: true, order: 5 },
    { id: 'network', type: 'network', enabled: true, order: 6 },
    { id: 'debts', type: 'debts', enabled: true, order: 7 },
    // Calendar omitted from default or added if needed
];


export const widgetLabels: Record<DashboardWidget['type'], string> = {
    tasks: 'Active Tasks',
    financial: 'Financial Health',
    projects: 'Projects',
    transactions: 'Recent Transactions',
    network: 'Network',
    calendar: 'Calendar',
    debts: 'Debts Overview',
    it: 'IT Assets',
    vehicles: 'Vehicles',
};

const STORAGE_KEY = 'rocha-negra-dashboard-widgets';

export function useDashboardWidgets() {
    const { data: widgets = [], refetch } = useQuery({
        queryKey: ['dashboard-widgets'],
        queryFn: () => api.get('/dashboard/widgets').then(r => r.data),
    });

    const mutation = useMutation({
        mutationFn: (updated: DashboardWidget[]) =>
            api.put('/dashboard/widgets', updated),
        onSuccess: () => refetch(),
    });

    const toggleWidget = (id: string) => {
        const updated = widgets.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
        );
        mutation.mutate(updated);
    };

    const moveWidget = (id: string, direction: 'up' | 'down') => {
        const sorted = [...widgets].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex(w => w.id === id);

        if (direction === 'up' && index > 0) {
            [sorted[index - 1].order, sorted[index].order] =
                [sorted[index].order, sorted[index - 1].order];
        }

        if (direction === 'down' && index < sorted.length - 1) {
            [sorted[index + 1].order, sorted[index].order] =
                [sorted[index].order, sorted[index + 1].order];
        }

        mutation.mutate(sorted);
    };

    return {
        widgets,
        enabledWidgets: widgets
            .filter(w => w.enabled)
            .sort((a, b) => a.order - b.order),
        toggleWidget,
        moveWidget
    };
}
