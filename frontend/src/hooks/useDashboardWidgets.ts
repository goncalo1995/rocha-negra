import { useState, useEffect } from 'react';
import { DashboardWidget, WidgetType } from '@/types/dashboard';

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
    const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse saved widgets', e);
            }
        }
        return DEFAULT_WIDGETS;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }, [widgets]);

    const toggleWidget = (id: string) => {
        setWidgets(prev => prev.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled } : w
        ));
    };

    const resetToDefault = () => {
        setWidgets(DEFAULT_WIDGETS);
    };

    const moveWidget = (id: string, direction: 'up' | 'down') => {
        setWidgets(prev => {
            const sorted = [...prev].sort((a, b) => a.order - b.order);
            const index = sorted.findIndex(w => w.id === id);

            if (direction === 'up' && index > 0) {
                const a = sorted[index];
                const b = sorted[index - 1];
                const temp = a.order;
                a.order = b.order;
                b.order = temp;
            } else if (direction === 'down' && index < sorted.length - 1) {
                const a = sorted[index];
                const b = sorted[index + 1];
                const temp = a.order;
                a.order = b.order;
                b.order = temp;
            }
            return [...sorted];
        });
    };

    const enabledWidgets = widgets
        .filter(w => w.enabled)
        .sort((a, b) => a.order - b.order);

    return {
        widgets,
        enabledWidgets,
        toggleWidget,
        moveWidget,
        resetToDefault,
    };
}
