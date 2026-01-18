import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent, Category } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft,
  Repeat,
  Wrench,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  getDay,
} from 'date-fns';

interface FinanceCalendarProps {
  getCalendarEvents: (month: Date) => CalendarEvent[];
  categories: Category[];
}

export function FinanceCalendar({ getCalendarEvents, categories }: FinanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const events = useMemo(() => {
    return getCalendarEvents(currentMonth);
  }, [getCalendarEvents, currentMonth]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get day offset for first day of month (0 = Sunday, 1 = Monday, etc.)
  const startOffset = getDay(startOfMonth(currentMonth));

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const selectedEvents = selectedDate 
    ? getEventsForDay(selectedDate)
    : [];

  const monthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    events.forEach(event => {
      if (event.transactionType === 'income') {
        income += event.amount;
      } else if (event.transactionType === 'expense') {
        expenses += event.amount;
      }
    });

    return { income, expenses, net: income - expenses };
  }, [events]);

  const getCategoryColor = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'hsl(var(--muted))';
  };

  return (
    <div className="space-y-4">
      {/* Month Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Expected Income</p>
            <p className="text-lg font-bold text-success">{formatCurrency(monthTotals.income)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Expected Expenses</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(monthTotals.expenses)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Net Flow</p>
            <p className={cn(
              'text-lg font-bold',
              monthTotals.net >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {monthTotals.net >= 0 ? '+' : ''}{formatCurrency(monthTotals.net)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasIncome = dayEvents.some(e => e.transactionType === 'income');
                const hasExpense = dayEvents.some(e => e.transactionType === 'expense');

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square p-1 rounded-lg transition-colors relative flex flex-col items-center',
                      'hover:bg-secondary/50',
                      isToday(day) && 'ring-1 ring-primary',
                      isSelected && 'bg-secondary',
                      !isSameMonth(day, currentMonth) && 'opacity-30'
                    )}
                  >
                    <span className={cn(
                      'text-sm',
                      isToday(day) && 'font-bold text-primary'
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-auto">
                        {hasIncome && (
                          <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        )}
                        {hasExpense && (
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {selectedDate 
                ? format(selectedDate, 'EEEE, MMMM d')
                : 'Select a day'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                    >
                      <div className={cn(
                        'rounded-lg p-2',
                        event.transactionType === 'income' ? 'bg-success/20 text-success' :
                        event.transactionType === 'expense' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {event.type === 'recurring' ? (
                          <Repeat className="h-4 w-4" />
                        ) : event.type === 'maintenance' ? (
                          <Wrench className="h-4 w-4" />
                        ) : event.transactionType === 'income' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={event.isPast ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {event.type === 'recurring' ? 'Scheduled' : 
                             event.type === 'maintenance' ? 'Maintenance' : 
                             event.isPast ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      <p className={cn(
                        'font-semibold',
                        event.transactionType === 'income' ? 'text-success' : 'text-destructive'
                      )}>
                        {event.transactionType === 'income' ? '+' : '-'}
                        {formatCurrency(event.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p className="text-sm">No events for this day</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <CalendarIcon className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Click a date to see events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
