import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction, Category, Asset } from '@/types/finance';
import { formatCurrency, formatRelativeDate } from '@/lib/formatters';
import { 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionLogProps {
  transactions: Transaction[];
  categories: Category[];
  assets: Asset[];
  onDeleteTransaction: (id: string) => void;
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer';
type NatureFilter = 'all' | 'fixed' | 'variable' | 'savings';

export function TransactionLog({ 
  transactions, 
  categories, 
  assets,
  onDeleteTransaction 
}: TransactionLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [natureFilter, setNatureFilter] = useState<NatureFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
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
  }, [transactions, categories, searchQuery, typeFilter, natureFilter, categoryFilter]);

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
                        <p className="font-medium truncate">{transaction.description}</p>
                        {category && (
                          <Badge
                            variant={category.nature === 'fixed' ? 'default' : 'secondary'}
                            className="text-xs shrink-0"
                          >
                            {category.nature === 'fixed' ? 'Need' : category.nature === 'variable' ? 'Want' : 'Save'}
                          </Badge>
                        )}
                        {transaction.isRecurring && (
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
                    
                    <div className="text-right">
                      <p className={cn('font-semibold', colorClass)}>
                        {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
