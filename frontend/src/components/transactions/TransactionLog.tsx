import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Transaction, Category, Asset, FinanceState } from '@/types/finance';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  CalendarIcon,
  Download,
  Upload,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { toast } from 'sonner';

interface TransactionLogProps {
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction?: (id: string, updates: Partial<Transaction>) => void;
  onImportData?: (data: Partial<FinanceState>) => void;
  onExportData?: () => FinanceState;
  onAddTransactions?: (transactions: any[]) => Promise<void>;
  // For pagination
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onFiltersChange?: (filters: TransactionFilters) => void;
}

import { BankImportDialog } from './BankImportDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2 } from 'lucide-react';

import { TransactionFilters } from '@/hooks/useFinance';

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type NatureFilter = 'all' | 'fixed' | 'variable' | 'savings';
type TimeRange = 'all' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';

export function TransactionLog({
  transactions,
  categories,
  assets,
  onDeleteTransaction,
  onUpdateTransaction,
  onImportData,
  onExportData,
  onAddTransactions,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onFiltersChange,
}: TransactionLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [natureFilter, setNatureFilter] = useState<NatureFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [isBankImportOpen, setIsBankImportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    description: '',
    categoryId: '',
    assetId: '',
    date: '',
  });

  // Sync filters to parent for server-side pagination
  useEffect(() => {
    if (!onFiltersChange) return;

    const timeFilter = getTimeRangeFilter(timeRange);
    const filters: TransactionFilters = {
      startDate: timeFilter?.start ? format(timeFilter.start, 'yyyy-MM-dd') : undefined,
      endDate: timeFilter?.end ? format(timeFilter.end, 'yyyy-MM-dd') : undefined,
      categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
      assetId: assetFilter === 'all' ? undefined : assetFilter,
    };

    onFiltersChange(filters);
  }, [timeRange, categoryFilter, assetFilter, customStartDate, customEndDate, onFiltersChange]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setEditForm({
      amount: t.amountOriginal.toString(),
      description: t.description,
      categoryId: t.categoryId,
      assetId: t.assetId,
      date: t.date.split('T')[0],
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !onUpdateTransaction) return;

    onUpdateTransaction(editingTransaction.id, {
      amountOriginal: parseFloat(editForm.amount),
      description: editForm.description,
      categoryId: editForm.categoryId,
      assetId: editForm.assetId,
      date: editForm.date,
    });
    setEditingTransaction(null);
    toast.success('Transaction updated');
  };

  const getTimeRangeFilter = (range: TimeRange): { start: Date; end: Date } | null => {
    const now = new Date();
    switch (range) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'this_week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'this_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'this_year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: startOfDay(customStartDate), end: endOfDay(customEndDate) };
        }
        return null;
      default:
        return null;
    }
  };

  const filteredTransactions = useMemo(() => {
    const timeFilter = getTimeRangeFilter(timeRange);

    return transactions
      .filter(t => {
        // Search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const category = categories.find(c => c.id === t.categoryId);
          const matchesSearch =
            t.description.toLowerCase().includes(searchLower) ||
            category?.name.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Time range filter
        if (timeFilter) {
          const transactionDate = parseISO(t.date);
          if (!isWithinInterval(transactionDate, { start: timeFilter.start, end: timeFilter.end })) {
            return false;
          }
        }

        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

        // Nature filter
        if (natureFilter !== 'all') {
          const category = categories.find(c => c.id === t.categoryId);
          if (category?.nature !== natureFilter) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, categories, searchQuery, typeFilter, natureFilter, categoryFilter, timeRange, customStartDate, customEndDate]);

  const handleExport = () => {
    if (!onExportData) return;

    const data = onExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rocha-negra-finance-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImportData) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Partial<FinanceState>;
        onImportData(data);
        toast.success('Data imported successfully');
      } catch (error) {
        toast.error('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'income': return ArrowDownLeft;
      case 'expense': return ArrowUpRight;
      case 'transfer': return ArrowLeftRight;
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'income': return 'text-success';
      case 'expense': return 'text-destructive';
      case 'transfer': return 'text-muted-foreground';
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-[140px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {timeRange === 'custom' && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[120px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customStartDate ? format(customStartDate, 'MMM d') : 'Start'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customStartDate}
                      onSelect={setCustomStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-[120px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customEndDate ? format(customEndDate, 'MMM d') : 'End'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={customEndDate}
                      onSelect={setCustomEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={natureFilter} onValueChange={(v) => setNatureFilter(v as NatureFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Nature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="fixed">Needs (Fixed)</SelectItem>
                <SelectItem value="variable">Wants (Variable)</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={assetFilter} onValueChange={setAssetFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export/Import buttons */}
            <div className="flex gap-2 ml-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={!onImportData}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsBankImportOpen(true)}
                disabled={!onAddTransactions}
              >
                <FileText className="mr-2 h-4 w-4" />
                Bank Statement
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!onExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm font-medium">
            <span>Transactions</span>
            <Badge variant="secondary">{filteredTransactions.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Receipt className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                const asset = assets.find(a => a.id === transaction.assetId);
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);

                return (
                  <div
                    key={transaction.id}
                    className="group flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/30"
                  >
                    <div className={cn('rounded-lg bg-secondary p-2', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/finance/transactions/${transaction.id}`} className="font-medium truncate hover:text-primary transition-colors">
                          {transaction.description}
                        </Link>
                        {category && (
                          <Badge
                            variant={category.nature === 'fixed' ? 'default' : 'secondary'}
                            className="text-xs shrink-0"
                          >
                            {category.nature === 'fixed' ? 'Need' : category.nature === 'variable' ? 'Want' : 'Save'}
                          </Badge>
                        )}
                        {transaction.generatorId && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{category?.name || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>{asset?.name || 'Unknown account'}</span>
                        <span>•</span>
                        <span>{formatRelativeDate(transaction.date)}</span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className={cn('font-semibold', colorClass)}>
                          {/* {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''} */}
                          {formatCurrency(transaction.amountOriginal || transaction.amountBase, transaction.currencyOriginal || "EUR")}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasNextPage && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isFetchingNextPage}
                className="w-full sm:w-auto"
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Loading more...
                  </>
                ) : (
                  'Load More Transactions'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Select value={editForm.assetId} onValueChange={v => setEditForm(prev => ({ ...prev, assetId: v }))}>
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

      <BankImportDialog
        isOpen={isBankImportOpen}
        onOpenChange={setIsBankImportOpen}
        categories={categories}
        assets={assets}
        onImport={onAddTransactions || (async () => { })}
      />
    </div>
  );
}
