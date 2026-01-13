import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  RecurringRule, 
  RecurringFrequency, 
  Category, 
  Asset, 
  TransactionType 
} from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { 
  Plus, 
  Repeat,
  Calendar,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Pause,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface RecurringRulesManagerProps {
  recurringRules: RecurringRule[];
  categories: Category[];
  assets: Asset[];
  onAddRule: (rule: Omit<RecurringRule, 'id' | 'createdAt'>) => void;
  onUpdateRule: (id: string, updates: Partial<RecurringRule>) => void;
  onDeleteRule: (id: string) => void;
}

const frequencyLabels: Record<RecurringFrequency, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export function RecurringRulesManager({
  recurringRules,
  categories,
  assets,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
}: RecurringRulesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [nextDueDate, setNextDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setType('expense');
    setAmount('');
    setCategoryId('');
    setAssetId('');
    setFrequency('monthly');
    setDayOfMonth('1');
    setNextDueDate(format(new Date(), 'yyyy-MM-dd'));
    setDescription('');
    setEditingRule(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !name || !categoryId || !assetId) return;

    const ruleData = {
      name,
      type,
      projectedAmount: parsedAmount,
      categoryId,
      assetId,
      frequency,
      dayOfMonth: parseInt(dayOfMonth),
      nextDueDate,
      description,
      isActive: true,
    };

    if (editingRule) {
      onUpdateRule(editingRule.id, ruleData);
    } else {
      onAddRule(ruleData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const startEdit = (rule: RecurringRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setType(rule.type);
    setAmount(rule.projectedAmount.toString());
    setCategoryId(rule.categoryId);
    setAssetId(rule.assetId);
    setFrequency(rule.frequency);
    setDayOfMonth(rule.dayOfMonth?.toString() || '1');
    setNextDueDate(rule.nextDueDate);
    setDescription(rule.description);
    setIsDialogOpen(true);
  };

  const toggleActive = (rule: RecurringRule) => {
    onUpdateRule(rule.id, { isActive: !rule.isActive });
  };

  const filteredCategories = categories.filter(c => 
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  const activeRules = recurringRules.filter(r => r.isActive);
  const inactiveRules = recurringRules.filter(r => !r.isActive);

  const monthlyProjection = activeRules.reduce((sum, rule) => {
    let monthlyAmount = rule.projectedAmount;
    if (rule.frequency === 'weekly') monthlyAmount *= 4;
    if (rule.frequency === 'quarterly') monthlyAmount /= 3;
    if (rule.frequency === 'yearly') monthlyAmount /= 12;
    
    return rule.type === 'income' ? sum + monthlyAmount : sum - monthlyAmount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recurring Rules</h2>
          <p className="text-sm text-muted-foreground">Manage your bills, subscriptions, and income</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Rule' : 'Add Recurring Rule'}</DialogTitle>
              <DialogDescription>
                Set up automatic tracking for regular income or expenses.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className={cn('flex-1 gap-2', type === 'expense' && 'border-destructive text-destructive')}
                  onClick={() => { setType('expense'); setCategoryId(''); }}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Expense
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn('flex-1 gap-2', type === 'income' && 'border-success text-success')}
                  onClick={() => { setType('income'); setCategoryId(''); }}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Income
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Netflix, Salary, Rent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(frequencyLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Account</Label>
                <Select value={assetId} onValueChange={setAssetId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.filter(a => a.type !== 'liability').map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextDue">Next Due Date</Label>
                <Input
                  id="nextDue"
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">{editingRule ? 'Save Changes' : 'Add Rule'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Monthly Projection Summary */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projected Monthly Net</p>
              <p className={cn(
                'text-2xl font-bold',
                monthlyProjection >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {monthlyProjection >= 0 ? '+' : ''}{formatCurrency(monthlyProjection)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Active Rules</p>
              <p className="text-2xl font-bold">{activeRules.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Repeat className="h-4 w-4" />
            Active Rules
            <Badge variant="secondary">{activeRules.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeRules.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Repeat className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No recurring rules yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeRules.map(rule => {
                const category = categories.find(c => c.id === rule.categoryId);
                const asset = assets.find(a => a.id === rule.assetId);
                
                return (
                  <div
                    key={rule.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/30"
                  >
                    <div className={cn(
                      'rounded-lg p-2',
                      rule.type === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    )}>
                      {rule.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{rule.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{frequencyLabels[rule.frequency]}</Badge>
                        <span>•</span>
                        <span>{category?.name}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>Next: {formatDate(rule.nextDueDate)}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={cn(
                        'font-semibold',
                        rule.type === 'income' ? 'text-success' : 'text-destructive'
                      )}>
                        {rule.type === 'income' ? '+' : '-'}{formatCurrency(rule.projectedAmount)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleActive(rule)}>
                        <Pause className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(rule)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive Rules */}
      {inactiveRules.length > 0 && (
        <Card className="opacity-70">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Pause className="h-4 w-4" />
              Paused Rules
              <Badge variant="secondary">{inactiveRules.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactiveRules.map(rule => (
                <div
                  key={rule.id}
                  className="flex items-center gap-4 rounded-lg border border-border/50 p-3"
                >
                  <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-muted-foreground">{rule.name}</p>
                  </div>
                  <p className="text-muted-foreground">{formatCurrency(rule.projectedAmount)}</p>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleActive(rule)}>
                    <Play className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
