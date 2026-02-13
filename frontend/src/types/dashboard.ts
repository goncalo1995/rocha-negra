import { Domain } from "domain";
import { Liability, Transaction } from "./finance";
import { Contact } from "./network";
import { Vehicle } from "./vehicles";
import { Task } from "./tasks";
import { Node } from "./nodes";

// export type WidgetType = 'tasks' | 'financial' | 'projects' | 'transactions' | 'network' | 'calendar' | 'debts' | 'it' | 'vehicles';

export interface DashboardWidget {
    key: string;
    title: string;
    enabled: boolean;
    order: number;
}

export interface DashboardResponseDto {
    financial: FinancialWidget | null;
    tasks: TaskWidget | null;
    projects: ProjectWidget | null;
    transactions: TransactionWidget | null;
    network: NetworkWidget | null;
    calendar: CalendarWidget | null;
    debts: DebtWidget | null;
    it: ITWidget | null;
    vehicles: VehicleWidget | null;
}

export interface FinancialWidget {
    monthlyExpenses: number;
    monthlyIncome: number;
    monthlySavings: number;
    totalNetWorth: number;
}

export interface TaskWidget {
    recentTasks: Task[];
    totalTasks: number;
}

export interface ProjectWidget {
    items: Node[];
    totalActive: number;
}

export interface TransactionWidget {
    recent: Transaction[];
}

export interface NetworkWidget {
    totalContacts: number;
    contacts: Contact[];
}

export interface CalendarWidget {
    events: Event[];
}

export interface DebtWidget {
    totalDebt: number;
    totalOutstanding: number;
}

export interface ITWidget {
    totalDomains: number;
    annualCost: number;
}

export interface VehicleWidget {
    totalVehicles: number;
    yearlyCost: number;
}
