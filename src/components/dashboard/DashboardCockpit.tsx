import { MetricCard } from './MetricCard';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';
import { MonthlyTrendsChart } from './MonthlyTrendsChart';
import { DashboardMetrics, Transaction, Category } from '@/types/finance';
import { Wallet, TrendingDown, PiggyBank, CreditCard } from 'lucide-react';

interface DashboardCockpitProps {
  metrics: DashboardMetrics;
  transactions: Transaction[];
  categories: Category[];
}

export function DashboardCockpit({ metrics, transactions, categories }: DashboardCockpitProps) {
  const burnPercentage = metrics.monthlyBudget > 0 
    ? Math.round((metrics.monthlyBurn / metrics.monthlyBudget) * 100) 
    : 0;

  const burnVariant = burnPercentage > 100 ? 'destructive' : burnPercentage > 80 ? 'warning' : 'default';

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Worth"
          value={metrics.netWorth}
          icon={Wallet}
          variant={metrics.netWorth >= 0 ? 'success' : 'destructive'}
          trend={metrics.netWorth >= 0 ? 'up' : 'down'}
          subtitle={`Assets: €${(metrics.totalAssets / 1000).toFixed(1)}k`}
        />
        
        <MetricCard
          title="Monthly Burn"
          value={metrics.monthlyBurn}
          icon={TrendingDown}
          variant={burnVariant}
          subtitle={metrics.monthlyBudget > 0 ? `${burnPercentage}% of budget` : 'No budget set'}
        />
        
        <MetricCard
          title="Safe to Spend"
          value={metrics.safeToSpend}
          icon={PiggyBank}
          variant={metrics.safeToSpend > 500 ? 'success' : metrics.safeToSpend > 100 ? 'warning' : 'destructive'}
          subtitle="After upcoming bills"
        />
        
        <MetricCard
          title="Upcoming Bills"
          value={metrics.upcomingBills}
          icon={CreditCard}
          variant="default"
          subtitle="Next 30 days"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <ExpenseBreakdownChart transactions={transactions} categories={categories} />
        <MonthlyTrendsChart transactions={transactions} />
      </div>
    </div>
  );
}
