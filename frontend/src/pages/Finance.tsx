import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DashboardCockpit } from '@/components/dashboard/DashboardCockpit';
import { ProjectionsChart } from '@/components/dashboard/ProjectionsChart';
import { AssetManager } from '@/components/assets/AssetManager';
import { TransactionLog } from '@/components/transactions/TransactionLog';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { FinanceCalendar } from '@/components/calendar/FinanceCalendar';
import { RecurringRulesManager } from '@/components/recurring/RecurringRulesManager';
import { useFinance } from '@/hooks/useFinance';
import { CalendarEvent } from '@/types/finance';
import { LayoutDashboard, Wallet, Receipt, Mountain, Calendar, Repeat, ChevronLeft } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
  addMonths,
  parseISO,
  addDays,
  addWeeks,
} from 'date-fns';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    assets,
    categories,
    transactions,
    recurringRules,
    metrics,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    addTransactions,
    exportData,
    importData,
  } = useFinance();

  // Calendar events function
  const getCalendarEvents = useCallback((month: Date): CalendarEvent[] => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const now = new Date();
    const events: CalendarEvent[] = [];

    // Add transactions
    transactions.forEach(t => {
      const date = parseISO(t.date);
      if (isAfter(date, monthStart) && isBefore(date, monthEnd)) {
        const category = categories.find(c => c.id === t.categoryId);
        events.push({
          id: t.id,
          date,
          title: t.description || category?.name || 'Transaction',
          amount: t.amountOriginal,
          type: 'transaction',
          transactionType: t.type,
          categoryId: t.categoryId,
          isPast: isBefore(date, now),
        });
      }
    });

    // Add recurring rule occurrences
    recurringRules.forEach(rule => {
      if (!rule.isActive) return;

      const dueDate = parseISO(rule.nextDueDate);
      let current = new Date(dueDate);

      // Find occurrences in the month
      while (isBefore(current, monthStart)) {
        switch (rule.frequency) {
          case 'daily': current = addDays(current, 1); break;
          case 'weekly': current = addWeeks(current, 1); break;
          case 'monthly': current = addMonths(current, 1); break;
          case 'quarterly': current = addMonths(current, 3); break;
          case 'yearly': current = addMonths(current, 12); break;
        }
      }

      if (isAfter(current, monthStart) && isBefore(current, monthEnd)) {
        events.push({
          id: `recurring-${rule.id}`,
          date: current,
          title: rule.description || 'Recurring',
          amount: rule.amount,
          type: 'recurring',
          transactionType: rule.type || 'expense',
          categoryId: rule.categoryId,
          isPast: isBefore(current, now),
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions, recurringRules, categories]);

  // Projections
  const projections = useMemo(() => {
    const result = [];
    const now = new Date();
    let cumulativeBalance = metrics.netWorth;

    for (let i = 0; i < 12; i++) {
      const targetMonth = addMonths(now, i);
      let projectedIncome = 0;
      let projectedExpenses = 0;

      recurringRules.forEach(rule => {
        if (!rule.isActive) return;

        // ASSUMPTION: rule.amount is in the user's base currency.
        let monthlyAmount = rule.amount;
        if (rule.frequency === 'daily') monthlyAmount *= 30;
        else if (rule.frequency === 'weekly') monthlyAmount *= 4;
        else if (rule.frequency === 'quarterly') monthlyAmount /= 3;
        else if (rule.frequency === 'yearly') monthlyAmount /= 12;

        if (rule.type === 'income') projectedIncome += monthlyAmount;
        else projectedExpenses += monthlyAmount; // It's already negative
      });

      const projectedBalance = projectedIncome + projectedExpenses;
      cumulativeBalance += projectedBalance;

      result.push({
        month: targetMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        date: targetMonth,
        projectedIncome,
        projectedExpenses,
        projectedBalance,
        cumulativeBalance,
      });
    }

    return result;
  }, [recurringRules, metrics.netWorth]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Finance</h1>
              <p className="text-xs text-muted-foreground">Rocha Negra</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Assets</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Log</span>
            </TabsTrigger>
            <TabsTrigger value="recurring" className="gap-2">
              <Repeat className="h-4 w-4" />
              <span className="hidden sm:inline">Recurring</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <DashboardCockpit
              metrics={metrics}
              transactions={transactions}
              categories={categories}
            />
            <ProjectionsChart projections={projections} currentBalance={metrics.netWorth} />
          </TabsContent>

          <TabsContent value="calendar" className="animate-fade-in">
            <FinanceCalendar getCalendarEvents={getCalendarEvents} categories={categories} />
          </TabsContent>

          <TabsContent value="assets" className="animate-fade-in">
            <AssetManager
              assets={assets}
              onAddAsset={addAsset}
              onUpdateAsset={updateAsset}
              onDeleteAsset={deleteAsset}
            />
          </TabsContent>

          <TabsContent value="transactions" className="animate-fade-in">
            <TransactionLog
              transactions={transactions}
              categories={categories}
              assets={assets}
              onDeleteTransaction={deleteTransaction}
              onUpdateTransaction={updateTransaction}
              onExportData={exportData}
              onImportData={importData}
              onAddTransactions={addTransactions}
            />
          </TabsContent>

          <TabsContent value="recurring" className="animate-fade-in">
            <RecurringRulesManager
              recurringRules={recurringRules}
              categories={categories}
              assets={assets}
              baseCurrency={"EUR"}
              onAddRule={addRecurringRule}
              onUpdateRule={updateRecurringRule}
              onDeleteRule={deleteRecurringRule}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Add FAB */}
      <QuickAddButton
        categories={categories}
        assets={assets}
        onAddTransaction={addTransaction}
        onAddRecurringRule={addRecurringRule}
      />
    </div>
  );
};

export default Finance;
