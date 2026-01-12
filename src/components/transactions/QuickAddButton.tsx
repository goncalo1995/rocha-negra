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
import { Transaction, Category, Asset, TransactionType } from '@/types/finance';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAddButtonProps {
  categories: Category[];
  assets: Asset[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function QuickAddButton({ categories, assets, onAddTransaction }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setDescription('');
    setCategoryId('');
    setAssetId('');
    setIsRecurring(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !categoryId || !assetId) return;

    onAddTransaction({
      type,
      amount: parsedAmount,
      description: description || 'Quick expense',
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

            {/* Asset/Account */}
            <div className="space-y-2">
              <Label htmlFor="asset">From Account</Label>
              <Select value={assetId} onValueChange={setAssetId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {assets.filter(a => a.type !== 'liability').map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
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
            <div className="flex items-center justify-between rounded-lg border p-3">
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
