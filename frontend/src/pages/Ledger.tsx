import { useState, useCallback, useMemo } from 'react';
import { useFinance, TransactionFilters } from '@/hooks/useFinance';
import { TransactionLog } from '@/components/transactions/TransactionLog';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { Spinner } from '@/components/ui/spinner';
import { FinanceCalendar } from '@/components/calendar/FinanceCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutList, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent } from '@/types/finance';
import { startOfMonth, endOfMonth, isAfter, isBefore, parseISO } from 'date-fns';

export default function LedgerPage() {
    const [view, setView] = useState('list');
    const [filters, setFilters] = useState<TransactionFilters>({});

    const {
        transactions, // Legacy flat list for calendar
        categories,
        assets,
        deleteTransaction,
        updateTransaction,
        exportData,
        importData,
        addTransactions,
        addTransaction,
        isLoading: isLoadingBase,
        useInfiniteTransactions
    } = useFinance();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingInfinite
    } = useInfiniteTransactions(filters);

    const infiniteTransactions = useMemo(() =>
        data?.pages.flatMap(page => page.content) || [],
        [data]);

    const getCalendarEvents = useCallback((month: Date): CalendarEvent[] => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const now = new Date();
        const events: CalendarEvent[] = [];

        // For the calendar, we still use the base transactions or we could use the infinite ones
        // but base is easier since it's already there and flat. 
        // Note: in a real app, we'd fetch the specific month from the API.
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

        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [transactions, categories]);

    const isLoading = isLoadingBase || (isLoadingInfinite && infiniteTransactions.length === 0);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Ledger</h1>
                    <p className="text-muted-foreground mt-1">Audit your financial history</p>
                </div>
            </div>

            <Tabs value={view} onValueChange={setView} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="list" className="gap-2">
                        <LayoutList className="h-4 w-4" />
                        List View
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Calendar View
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="animate-fade-in outline-none">
                    {isLoading && infiniteTransactions.length === 0 ? (
                        <div className="flex py-20 justify-center"><Spinner /></div>
                    ) : (
                        <TransactionLog
                            transactions={infiniteTransactions}
                            categories={categories}
                            assets={assets}
                            onDeleteTransaction={deleteTransaction}
                            onUpdateTransaction={updateTransaction}
                            onExportData={exportData}
                            onImportData={importData}
                            onAddTransactions={addTransactions}
                            hasNextPage={hasNextPage}
                            isFetchingNextPage={isFetchingNextPage}
                            onLoadMore={() => fetchNextPage()}
                            onFiltersChange={setFilters}
                        />
                    )}
                </TabsContent>

                <TabsContent value="calendar" className="animate-fade-in outline-none">
                    <FinanceCalendar getCalendarEvents={getCalendarEvents} categories={categories} />
                </TabsContent>
            </Tabs>

            <QuickAddButton
                categories={categories}
                assets={assets}
                baseCurrency="EUR"
                onAddTransaction={addTransaction}
            />
        </div>
    );
}
