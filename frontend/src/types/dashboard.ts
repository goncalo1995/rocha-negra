export type WidgetType = 'tasks' | 'financial' | 'projects' | 'transactions' | 'network' | 'calendar' | 'debts' | 'it' | 'vehicles';

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    enabled: boolean;
    order: number;
}
