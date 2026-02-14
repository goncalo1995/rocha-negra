import { DashboardWidget } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const widgetLabels: Record<DashboardWidget['key'], string> = {
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

export function useDashboardWidgets() {
    const queryClient = useQueryClient();
    const { data: widgets = [], refetch } = useQuery<DashboardWidget[]>({
        queryKey: ['dashboard-widgets'],
        queryFn: () => api.get('/dashboard/widgets').then(r => r.data),
    });

    const mutation = useMutation({
        mutationFn: (updated: DashboardWidget[]) =>
            api.put('/dashboard/widgets', updated),
        onSuccess: () => {
            refetch();
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });

    const toggleWidget = (key: string) => {
        const updated = widgets.map(w =>
            w.key === key ? { ...w, enabled: !w.enabled } : w
        );
        mutation.mutate(updated);
    };

    const moveWidget = (key: string, direction: 'up' | 'down') => {
        const sorted = [...widgets].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex(w => w.key === key);

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
