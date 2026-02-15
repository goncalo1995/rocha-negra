import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth, isAfter, isBefore, addMonths, subMonths, parseISO, format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckSquare, Calendar as CalendarIcon, ListTodo, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTaskMutations, useTasks } from '@/hooks/useTasks';
import { useNodes } from '@/hooks/useNodes';
import { FinanceCalendar } from '@/components/calendar/FinanceCalendar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CalendarEvent } from '@/types/finance';
import { Node } from '@/types/nodes';

export default function AgendaPage() {
    const [view, setView] = useState('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { data: tasks = [], isLoading: isLoadingTasks } = useTasks();
    const { updateTask } = useTaskMutations();
    const { data: nodes } = useNodes();

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    };

    const getCalendarEvents = useCallback((month: Date): CalendarEvent[] => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const now = new Date();
        const events: CalendarEvent[] = [];

        // Add Tasks
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
                } as CalendarEvent);
            }
        });

        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [tasks]);

    const combinedEvents = useMemo(() => {
        const events: CalendarEvent[] = [];
        const now = new Date();

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
            } as CalendarEvent);
        });

        return events.sort((a, b) => b.date.getTime() - a.date.getTime()); // Latest first for feed
    }, [tasks]);

    const handleToggleTaskStatus = async (taskToToggle: any) => {
        const newStatus = taskToToggle.status === 'DONE' ? 'TODO' : 'DONE';

        if (newStatus === 'DONE') {
            const hasSubtasks = tasks.some(t => t.parentId === taskToToggle.id && t.status !== 'DONE');
            if (hasSubtasks) {
                toast.error("Cannot mark task as done because it has incomplete subtasks.");
                return;
            }
        }

        updateTask.mutate(
            { id: taskToToggle.id, updates: { status: newStatus } },
            {
                onSuccess: () => toast.success("Task updated"),
                onError: (error) => toast.error(error.message),
            }
        );
    };

    if (isLoadingTasks) {
        return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-6 text-foreground">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Agenda</h1>
                    <p className="text-muted-foreground mt-1">
                        {view === 'calendar' ? `Calendar for ${format(currentMonth, 'MMMM yyyy')}` : 'Project and Task Feed'}
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
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        categories={[]}
                    />
                </TabsContent>

                <TabsContent value="agenda" className="animate-fade-in outline-none">
                    <AgendaListView
                        events={combinedEvents}
                        nodes={nodes || []}
                        tasks={tasks}
                        onToggleTaskStatus={handleToggleTaskStatus}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface AgendaListViewProps {
    events: CalendarEvent[];
    nodes: Node[];
    tasks: any[];
    onToggleTaskStatus?: (task: any) => Promise<void>;
}

function AgendaListView({
    events,
    nodes,
    tasks,
    onToggleTaskStatus
}: AgendaListViewProps) {
    const navigate = useNavigate();
    if (events.length === 0) {
        return (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
                <CalendarIcon className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p>No events found.</p>
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
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            <div className="p-2.5 rounded-lg shrink-0 bg-blue-500/10 text-blue-500">
                                <CheckSquare className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{event.title}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground whitespace-nowrap">
                                        {format(event.date, 'EEEE, MMM d, yyyy')}
                                    </span>
                                    {node && (
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
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/tasks/${event.id.replace('task-', '')}`)}
                                className="ml-auto"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
