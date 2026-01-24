import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DashboardCockpit } from '@/components/dashboard/DashboardCockpit';
import { AssetManager } from '@/components/assets/AssetManager';
import { TransactionLog } from '@/components/transactions/TransactionLog';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { FinanceCalendar } from '@/components/calendar/FinanceCalendar';
import { RecurringRulesManager } from '@/components/recurring/RecurringRulesManager';
import { useFinance } from '@/hooks/useFinance';
import { CalendarEvent } from '@/types/finance';
import { LayoutDashboard, Wallet, Receipt, Calendar, Repeat, ChevronLeft, LineChart } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    assets,
    categories,
    transactions,
    recurringRules,
    metrics,
    isLoadingMetrics,
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


  if (isLoadingMetrics || metrics == null) {
    return <div>Loading Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
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
            <Card>
              <CardHeader>
                <CardTitle>Financial Forecast</CardTitle>
                <CardDescription>
                  View a detailed 24-month projection of your net worth based on your recurring rules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/finance/projections">
                  <Button>
                    <LineChart className="mr-2 h-4 w-4" />
                    View Projections
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
