import { useState, useCallback, useMemo } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useTaskMutations, useTasks } from '@/hooks/useTasks';
import { useNodes } from '@/hooks/useNodes';
import { FinanceCalendar } from '@/components/calendar/FinanceCalendar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CalendarEvent, Transaction } from '@/types/finance';
import { Node } from '@/types/nodes';
import {
    startOfMonth,
    endOfMonth,
    isAfter,
    isBefore,
    addMonths,
    subMonths,
    parseISO,
    addDays,
    addWeeks,
    isSameDay,
    format
} from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckSquare, Receipt, Repeat, Calendar as CalendarIcon, ListTodo, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

import { useNavigate, Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AgendaPage() {
    const [view, setView] = useState('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [filter, setFilter] = useState<'all' | 'tasks' | 'finance'>('all');

    const [editingTransaction, setEditingTransaction] = useState<any | null>(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        description: '',
        categoryId: '',
        assetId: '',
        date: '',
    });

    const {
        transactions: legacyTransactions,
        recurringRules,
        categories,
        assets,
        isLoading: isLoadingFinance,
        updateTransaction,
        useInfiniteTransactions
    } = useFinance();
    const { data: tasks = [], isLoading: isLoadingTasks } = useTasks();
    const { updateTask } = useTaskMutations();
    const { data: nodes } = useNodes();

    const {
        data: infiniteData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isLoadingInfinite
    } = useInfiniteTransactions({}, 20, filter !== 'tasks');

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    };

    const startEdit = (t: any) => {
        setEditingTransaction(t);
        setEditForm({
            amount: Math.abs(t.amount || t.amountOriginal).toString(),
            description: t.title || t.description,
            categoryId: t.categoryId,
            assetId: t.assetId,
            date: format(t.date, 'yyyy-MM-dd'),
        });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTransaction) return;

        try {
            await updateTransaction(editingTransaction.id, {
                amountOriginal: parseFloat(editForm.amount),
                description: editForm.description,
                categoryId: editForm.categoryId,
                assetId: editForm.assetId,
                date: editForm.date,
            });
            setEditingTransaction(null);
            toast.success('Transaction updated');
        } catch (error) {
            toast.error('Failed to update transaction');
        }
    };

    const getCalendarEvents = useCallback((month: Date): CalendarEvent[] => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const now = new Date();
        const events: CalendarEvent[] = [];

        // 1. Add Transactions
        if (filter === 'all' || filter === 'finance') {
            legacyTransactions.forEach(t => {
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

            // 2. Add Recurring Rules
            recurringRules.forEach(rule => {
                if (!rule.isActive) return;
                const dueDate = parseISO(rule.nextDueDate);
                let current = new Date(dueDate);

                while (isBefore(current, monthStart)) {
                    switch (rule.frequency) {
                        case 'daily': current = addDays(current, 1); break;
                        case 'weekly': current = addWeeks(current, 1); break;
                        case 'monthly': current = addMonths(current, 1); break;
                        case 'quarterly': current = addMonths(current, 3); break;
                        case 'yearly': current = addMonths(current, 12); break;
                    }
                }

                // Reset current to calculate correctly for the target month
                current = new Date(dueDate);
                // Simple occurrence generator for the month
                for (let i = 0; i < 24; i++) { // look ahead 2 years
                    if (isAfter(current, monthEnd)) break;
                    if (isAfter(current, monthStart) || isSameDay(current, monthStart)) {
                        events.push({
                            id: `recurring-${rule.id}-${current.getTime()}`,
                            date: new Date(current),
                            title: rule.description || 'Recurring',
                            amount: rule.amount,
                            type: 'recurring',
                            transactionType: rule.type || 'expense',
                            categoryId: rule.categoryId,
                            isPast: isBefore(current, now),
                        });
                    }
                    switch (rule.frequency) {
                        case 'daily': current = addDays(current, 1); break;
                        case 'weekly': current = addWeeks(current, 1); break;
                        case 'monthly': current = addMonths(current, 1); break;
                        case 'quarterly': current = addMonths(current, 3); break;
                        case 'yearly': current = addMonths(current, 12); break;
                        default: i = 100; // break
                    }
                }
            });
        }

        // 3. Add Tasks
        if (filter === 'all' || filter === 'tasks') {
            tasks.forEach(task => {
                if (!task.dueDate) return;
                const date = parseISO(task.dueDate);
                if (isAfter(date, monthStart) && isBefore(date, monthEnd)) {
                    events.push({
                        id: `task-${task.id}`,
                        date,
                        title: task.title,
                        type: 'task',
                        isPast: isBefore(date, now),
                        status: task.status,
                        projectId: task.nodeId || undefined,
                    });
                }
            });
        }

        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [legacyTransactions, recurringRules, tasks, categories, filter]);

    const combinedInfiniteEvents = useMemo(() => {
        const events: CalendarEvent[] = [];
        const now = new Date();

        // Add infinite transactions
        if (filter === 'all' || filter === 'finance') {
            infiniteData?.pages.forEach(page => {
                page.content.forEach((t: any) => {
                    events.push({
                        id: t.id,
                        date: parseISO(t.date),
                        title: t.description || 'Transaction',
                        amount: t.amountOriginal,
                        type: 'transaction',
                        transactionType: t.type,
                        categoryId: t.categoryId,
                        isPast: isBefore(parseISO(t.date), now),
                    });
                });
            });
        }

        // Add tasks (all loaded tasks for now)
        if (filter === 'all' || filter === 'tasks') {
            tasks.forEach(task => {
                if (!task.dueDate) return;
                events.push({
                    id: `task-${task.id}`,
                    date: parseISO(task.dueDate),
                    title: task.title,
                    type: 'task',
                    isPast: isBefore(parseISO(task.dueDate), now),
                    status: task.status,
                    projectId: task.nodeId || undefined,
                });
            });
        }

        return events.sort((a, b) => b.date.getTime() - a.date.getTime()); // Latest first for feed
    }, [infiniteData, tasks, filter]);

    const handleToggleTaskStatus = async (taskToToggle: any) => {
        const newStatus = taskToToggle.status === 'DONE' ? 'TODO' : 'DONE';

        if (newStatus === 'DONE') {
            const hasSubtasks = tasks.some(t => t.parentId === taskToToggle.id && t.status !== 'DONE');
            if (hasSubtasks) {
                toast.error("Cannot mark task as done because it has incomplete subtasks.");
                return;
            }
        }

        try {
            await updateTask.mutateAsync({ id: taskToToggle.id, updates: { status: newStatus } });
            toast.success("Task updated");
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to update task";
            toast.error(message);
        }
    };

    const isLoading = isLoadingFinance || isLoadingTasks || (isLoadingInfinite && combinedInfiniteEvents.length === 0);

    if (isLoading && combinedInfiniteEvents.length === 0) {
        return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Agenda</h1>
                    <p className="text-muted-foreground mt-1">
                        {view === 'calendar' ? `Calendar for ${format(currentMonth, 'MMMM yyyy')}` : 'Project and Financial Feed'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {view === 'calendar' && (
                        <div className="flex items-center rounded-lg border bg-card p-1">
                            <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')} className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="h-8 px-3 text-xs">
                                Today
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')} className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center rounded-lg border bg-card p-1">
                        <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')} className="h-8 text-xs">All</Button>
                        <Button variant={filter === 'tasks' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('tasks')} className="h-8 text-xs">Tasks</Button>
                        <Button variant={filter === 'finance' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('finance')} className="h-8 text-xs">Finance</Button>
                    </div>
                </div>
            </div>

            <Tabs value={view} onValueChange={setView} className="space-y-6 outline-none">
                <TabsList>
                    <TabsTrigger value="calendar" className="gap-2"><CalendarIcon className="h-4 w-4" />Calendar</TabsTrigger>
                    <TabsTrigger value="agenda" className="gap-2"><ListTodo className="h-4 w-4" />Feed</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="animate-fade-in outline-none">
                    <FinanceCalendar
                        getCalendarEvents={getCalendarEvents}
                        categories={categories}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                    />
                </TabsContent>

                <TabsContent value="agenda" className="animate-fade-in outline-none">
                    <AgendaListView
                        events={combinedInfiniteEvents}
                        nodes={nodes}
                        tasks={tasks}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onLoadMore={fetchNextPage}
                        onEditTransaction={startEdit}
                        onToggleTaskStatus={handleToggleTaskStatus}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Update the details of this transaction.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={editForm.description}
                                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editForm.amount}
                                    onChange={e => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={editForm.date}
                                    onChange={e => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={editForm.categoryId} onValueChange={v => setEditForm(prev => ({ ...prev, categoryId: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Account</Label>
                            <Select value={editForm.assetId} onValueChange={v => setForm => setEditForm(prev => ({ ...prev, assetId: v }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map(asset => (
                                        <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingTransaction(null)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface AgendaListViewProps {
    events: CalendarEvent[];
    nodes: Node[];
    tasks: any[];
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    onLoadMore?: () => void;
    onEditTransaction?: (transaction: any) => void;
    onToggleTaskStatus?: (task: any) => Promise<void>;
}

function AgendaListView({
    events,
    nodes,
    tasks,
    hasNextPage,
    isFetchingNextPage,
    onLoadMore,
    onEditTransaction,
    onToggleTaskStatus
}: AgendaListViewProps) {
    const navigate = useNavigate();
    if (events.length === 0) {
        return (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
                <CalendarIcon className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p>No events found for this filter.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="space-y-6">
                {events.map((event) => {
                    const node = nodes.find(p => p.id === event.projectId);
                    return (
                        <div key={event.id} className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-all group relative overflow-hidden">
                            {event.type === 'task' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                            <div className={cn(
                                "p-2.5 rounded-lg shrink-0",
                                event.type === 'task' ? "bg-blue-500/10 text-blue-500" :
                                    event.transactionType === 'income' ? "bg-success/10 text-success" :
                                        "bg-destructive/10 text-destructive"
                            )}>
                                {event.type === 'task' ? <CheckSquare className="h-5 w-5" /> :
                                    event.type === 'recurring' ? <Repeat className="h-5 w-5" /> :
                                        <Receipt className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{event.title}</h3>
                                    {event.amount !== undefined && (
                                        <span className={cn(
                                            "font-bold text-lg shrink-0",
                                            event.transactionType === 'income' ? "text-success" : "text-destructive"
                                        )}>
                                            {formatCurrency(event.amount)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground whitespace-nowrap">
                                        {format(event.date, 'EEEE, MMM d, yyyy')}
                                    </span>
                                    {event.type === 'task' && node && (
                                        <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 px-2 py-0">
                                            {node.name}
                                        </Badge>
                                    )}
                                    {event.status && (
                                        <Badge variant="secondary" className="px-2 py-0 capitalize text-[10px]">
                                            {event.status.replace('_', ' ')}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {event.type === 'transaction' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEditTransaction(event)}
                                    className="ml-auto"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            )}
                            {event.type === 'task' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/tasks/${event.id.replace('task-', '')}`)}
                                    className="ml-auto"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    );
                })}
            </div>

            {hasNextPage && (
                <div className="flex justify-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={onLoadMore}
                        disabled={isFetchingNextPage}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        {isFetchingNextPage ? (
                            <><Spinner className="mr-2 h-4 w-4" />Loading...</>
                        ) : (
                            'Show more history...'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
