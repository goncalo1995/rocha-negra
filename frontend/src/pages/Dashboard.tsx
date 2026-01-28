import { BentoCard } from "@/components/BentoCard";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { useFinance } from "@/hooks/useFinance";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useIT } from "@/hooks/useIT";
import { useVehicles } from "@/hooks/useVehicles";
// import { useNetwork } from "@/hooks/useNetwork"; // Delayed
import { DashboardWidget } from "@/types/dashboard";
import { formatCurrency } from "@/lib/formatters";
import {
    Circle,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Settings2,
    Users,
    TrendingDown,
    Calendar,
    Briefcase,
    Globe,
    Car
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Dashboard() {
    const { widgets, enabledWidgets, toggleWidget, resetToDefault } = useDashboardWidgets();

    // Data Hooks
    const { metrics, transactions, liabilities } = useFinance();
    const { activeTasks } = useTasks();
    const { projects } = useProjects();
    const { metrics: itMetrics } = useIT();
    const { metrics: vehicleMetrics } = useVehicles();
    // const { contacts } = useNetwork(); // Delayed

    // Derived Data
    const recentTransactions = transactions.slice(0, 3);
    // TypeScript type fix: Liability uses snake_case from DB type definition
    // @ts-ignore
    const totalLiabilities = liabilities.reduce((acc, curr) => acc + (curr.remainingAmount || curr.current_balance || 0), 0);

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'text-destructive'; // High
            case 2: return 'text-warning'; // Medium
            default: return 'text-muted-foreground'; // Low
        }
    };

    const getPriorityLabel = (priority: number) => {
        switch (priority) {
            case 1: return 'High';
            case 2: return 'Medium';
            case 3: return 'Low';
            default: return 'Normal';
        }
    }

    const widgetLabels: Record<DashboardWidget['type'], string> = {
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

    const renderWidget = (widget: DashboardWidget) => {
        switch (widget.type) {
            case 'financial':
                return (
                    <BentoCard
                        key={widget.id}
                        title="Financial Health"
                        subtitle="Your wealth at a glance"
                        headerAction={
                            <Link to="/finance">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <Wallet className="h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    >
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/30">
                                <p className="text-sm text-emerald-400 mb-1">Net Worth</p>
                                <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.netWorth)}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span>Assets: {formatCurrency(metrics.totalAssets)}</span>
                                    <span>Debts: {formatCurrency(metrics.totalLiabilities)}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-accent">
                                <p className="text-sm text-muted-foreground mb-1">Safe to Spend</p>
                                <p className={cn(
                                    "text-xl font-bold",
                                    metrics.safeToSpend > 0 ? "text-success" : "text-destructive"
                                )}>
                                    {formatCurrency(metrics.safeToSpend)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    After {formatCurrency(metrics.monthlyBurn)} monthly costs
                                </p>
                            </div>
                        </div>
                    </BentoCard>
                );

            case 'tasks':
                return (
                    <BentoCard
                        key={widget.id}
                        title="Active Tasks"
                        subtitle={`${activeTasks.length} items need attention`}
                        className="lg:col-span-2"
                        headerAction={
                            <Link to="/tasks">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    View all
                                </Button>
                            </Link>
                        }
                    >
                        <div className="space-y-3">
                            {activeTasks.slice(0, 4).map((task) => (
                                <div
                                    key={task.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                >
                                    {task.status === 'in_progress' ? (
                                        <Clock className="h-4 w-4 text-warning shrink-0" />
                                    ) : (
                                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                                        </p>
                                    </div>
                                    <span className={cn("text-xs font-medium capitalize", getPriorityColor(task.priority))}>
                                        {getPriorityLabel(task.priority)}
                                    </span>
                                </div>
                            ))}
                            {activeTasks.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No active tasks.</p>
                            )}
                        </div>
                    </BentoCard>
                );

            case 'projects':
                const activeProjects = projects.filter(p => p.status === 'active');
                return (
                    <BentoCard
                        key={widget.id}
                        title="Projects"
                        subtitle={`${activeProjects.length} active`}
                        headerAction={
                            <Link to="/projects">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <Briefcase className="h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    >
                        <div className="space-y-3">
                            {projects.slice(0, 3).map((project) => (
                                <div key={project.id} className="p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                            project.status === 'active' ? "bg-success/20 text-success" :
                                                project.status === 'on_hold' ? "bg-warning/20 text-warning" :
                                                    "bg-muted text-muted-foreground"
                                        )}>
                                            {project.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {project.dueDate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Due {new Date(project.dueDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                            {projects.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No projects.</p>
                            )}
                        </div>
                    </BentoCard>
                );

            case 'transactions':
                return (
                    <BentoCard
                        key={widget.id}
                        title="Recent Transactions"
                        className="lg:col-span-2"
                        headerAction={
                            <Link to="/finance">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    View all
                                </Button>
                            </Link>
                        }
                    >
                        <div className="space-y-2">
                            {recentTransactions.map((tx) => {
                                // @ts-ignore
                                const amount = tx.amount_base || tx.amount || 0;
                                const isIncome = amount > 0; // Assuming positive is income, or check tx.type

                                return (
                                    <div
                                        key={tx.id}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center",
                                            isIncome ? "bg-success/20" : "bg-destructive/20"
                                        )}>
                                            {isIncome ? (
                                                <ArrowUpRight className="h-5 w-5 text-success" />
                                            ) : (
                                                <ArrowDownRight className="h-5 w-5 text-destructive" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <p className={cn(
                                            "font-semibold",
                                            isIncome ? "text-success" : "text-foreground"
                                        )}>
                                            {isIncome ? '+' : ''}{formatCurrency(amount)}
                                        </p>
                                    </div>
                                );
                            })}
                            {recentTransactions.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No recent transactions.</p>
                            )}
                        </div>
                    </BentoCard>
                );

            case 'it':
                return (
                    <BentoCard
                        key={widget.id}
                        title="IT Assets"
                        subtitle="Domains & Renewals"
                        headerAction={
                            <Link to="/it">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <Globe className="h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Domains</p>
                                <p className="text-lg font-bold">{itMetrics.totalDomains}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Annual Cost</p>
                                <p className="text-lg font-bold text-destructive">{formatCurrency(itMetrics.annualCost)}</p>
                            </div>
                        </div>
                    </BentoCard>
                );

            case 'vehicles':
                return (
                    <BentoCard
                        key={widget.id}
                        title="Vehicles"
                        subtitle="Maintenance & Fuel"
                        headerAction={
                            <Link to="/vehicles">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <Car className="h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Vehicles</p>
                                <p className="text-lg font-bold">{vehicleMetrics.totalVehicles}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Costs (Year)</p>
                                <p className="text-lg font-bold text-destructive">
                                    {formatCurrency(vehicleMetrics.totalMaintenanceCostThisYear + vehicleMetrics.totalFuelCostThisYear)}
                                </p>
                            </div>
                        </div>
                    </BentoCard>
                );

            // case 'network': // Delayed
            //     return (...);

            case 'debts':
                return (
                    <BentoCard
                        key={widget.id}
                        title="Debts Overview"
                        subtitle={`${liabilities.length} active debts`}
                        headerAction={
                            <Link to="/finance">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <TrendingDown className="h-4 w-4" />
                                </Button>
                            </Link>
                        }
                    >
                        <div className="space-y-3">
                            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive mb-1">Total Outstanding</p>
                                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalLiabilities)}</p>
                            </div>
                            {liabilities.slice(0, 2).map((l) => (
                                <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{l.name}</p>
                                        {/* @ts-ignore */}
                                        <p className="text-xs text-muted-foreground">{formatCurrency(l.remainingAmount || l.current_balance || 0)} remaining</p>
                                    </div>
                                </div>
                            ))}
                            {liabilities.length === 0 && (
                                <p className="text-sm text-muted-foreground italic">No debts.</p>
                            )}
                        </div>
                    </BentoCard>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back. Here's your overview.</p>
                </div>

                {/* Widget Customization Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Settings2 className="h-4 w-4" />
                            Customize
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Customize Dashboard</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <p className="text-sm text-muted-foreground">
                                Choose which widgets to show on your dashboard.
                            </p>
                            <div className="space-y-3">
                                {widgets.map((widget) => (
                                    <div key={widget.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                                        <Label htmlFor={widget.id} className="cursor-pointer">
                                            {widgetLabels[widget.type]}
                                        </Label>
                                        <Switch
                                            id={widget.id}
                                            checked={widget.enabled}
                                            onCheckedChange={() => toggleWidget(widget.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" size="sm" onClick={resetToDefault} className="w-full">
                                Reset to Default
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enabledWidgets.map(renderWidget)}
            </div>

            {enabledWidgets.length === 0 && (
                <div className="bento-card text-center py-12">
                    <p className="text-muted-foreground">No widgets enabled. Click "Customize" to add widgets to your dashboard.</p>
                </div>
            )}
        </div>
    );
}
