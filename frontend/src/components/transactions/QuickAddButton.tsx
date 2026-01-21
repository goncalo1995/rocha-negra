import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Transaction, Category, Asset, TransactionType, RecurringRule, RecurringFrequency, TransactionCreateDto } from '@/types/finance';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addMonths, addWeeks, addQuarters, addYears, setDate, addDays } from 'date-fns';

interface QuickAddButtonProps {
  categories: Category[];
  assets: Asset[];
  onAddTransaction: (transaction: TransactionCreateDto) => void;
  onAddRecurringRule?: (rule: Omit<RecurringRule, 'id'>) => void;
}

function getNextDueDate(frequency: RecurringFrequency, dayOfMonth: number): string {
  const now = new Date();
  let nextDate = setDate(now, dayOfMonth);

  // If the day has passed this period, move to next period
  if (nextDate <= now) {
    switch (frequency) {
      case 'daily':
        nextDate = addDays(nextDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(nextDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(nextDate, 1);
        break;
      case 'quarterly':
        nextDate = addQuarters(nextDate, 1);
        break;
      case 'yearly':
        nextDate = addYears(nextDate, 1);
        break;
    }
  }

  return nextDate.toISOString();
}

export function QuickAddButton({ categories, assets, onAddTransaction, onAddRecurringRule }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [destinationAssetId, setDestinationAssetId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [dayOfMonth, setDayOfMonth] = useState('1');

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId('');
    setAssetId('');
    setIsRecurring(false);
    setFrequency('monthly');
    setDayOfMonth('1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    const parsedDayOfMonth = parseInt(dayOfMonth) || 1;
    if (isNaN(parsedAmount) || !categoryId || !assetId) return;

    // Always add the transaction
    onAddTransaction({
      type,
      amountOriginal: parsedAmount,
      currencyOriginal: currency || "EUR",
      description: description || 'Quick transaction',
      date: new Date().toISOString(),
      categoryId,
      assetId,
      isRecurring,
    });

    resetForm();
    setIsOpen(false);
  };

  const filteredCategories = categories.filter(c =>
    type === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  const typeButtons = [
    { value: 'expense' as const, label: 'Expense', icon: ArrowUpRight, color: 'text-destructive border-destructive' },
    { value: 'income' as const, label: 'Income', icon: ArrowDownLeft, color: 'text-success border-success' },
    { value: 'transfer' as const, label: 'Transfer', icon: ArrowLeftRight, color: 'text-muted-foreground border-muted' },
  ];

  const swapAssets = () => {
    const temp = assetId;
    setAssetId(destinationAssetId);
    setDestinationAssetId(temp);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/25 animate-pulse-glow z-50"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Quick Add Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Add Transaction</DialogTitle>
            <DialogDescription>
              Log an expense, income, or transfer quickly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type Selector */}
            <div className="flex gap-2">
              {typeButtons.map(({ value, label, icon: Icon, color }) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  className={cn(
                    'flex-1 gap-2',
                    type === value && color
                  )}
                  onClick={() => {
                    setType(value);
                    setCategoryId('');
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="text-2xl font-bold h-14"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* --- NEW DYNAMIC ASSET SELECTORS --- */}
            {type === 'transfer' ? (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>From</Label>
                  <Select value={assetId} onValueChange={setAssetId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" variant="ghost" size="icon" onClick={() => { swapAssets() }}>
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>

                <div className="flex-1">
                  <Label>To</Label>
                  <Select value={destinationAssetId} onValueChange={setDestinationAssetId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{type === 'income' ? 'To Account' : 'From Account'}</Label>
                <Select value={assetId} onValueChange={setAssetId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this for?"
                className="resize-none"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Recurring Toggle */}
            {/* <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="recurring" className="font-medium">Recurring</Label>
                <p className="text-xs text-muted-foreground">This happens regularly</p>
              </div>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>

            {isRecurring && (
              <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Day of {frequency === 'weekly' ? 'week' : 'month'}</Label>
                  <Input
                    id="dayOfMonth"
                    type="number"
                    min="1"
                    max={frequency === 'weekly' ? 7 : 31}
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                  />
                </div>
              </div>
            )} */}

            {/* Submit */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!amount || !categoryId || !assetId}>
                Add Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}