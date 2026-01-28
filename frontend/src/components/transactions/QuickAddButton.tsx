import { useEffect, useMemo, useState } from 'react';
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
import { Category, Asset, TransactionType, TransactionCreateDto, LIQUID_ASSET_TYPES } from '@/types/finance';
import { Plus, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuickAddButtonProps {
  categories: Category[];
  assets: Asset[];
  baseCurrency: string;
  onAddTransaction: (transaction: TransactionCreateDto) => void;
  // onAddRecurringRule?: (rule: Omit<RecurringRule, 'id'>) => void;
}

const initialFormState = {
  type: 'expense' as TransactionType,
  amount: '',
  description: '',
  categoryId: '',
  assetId: '', // Source asset
  destinationAssetId: '', // Destination asset
  attachmentUrl: ''
};

export function QuickAddButton({ categories, assets, baseCurrency, onAddTransaction }: QuickAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);

  // Filter assets to only show valid payment/deposit sources
  const liquidAssets = useMemo(() => assets.filter(a => LIQUID_ASSET_TYPES.includes(a.type as any)), [assets]);
  const filteredCategories = useMemo(() => categories.filter(c => form.type === 'transfer' ? true : c.type === form.type), [categories, form.type]);
  // const filteredCategories = categories.filter(c =>
  //   type === 'income' ? c.type === 'income' : c.type === 'expense'
  // );

  // const [type, setType] = useState<TransactionType>('expense');
  // const [amount, setAmount] = useState('');
  // const [description, setDescription] = useState('');
  // const [currency, setCurrency] = useState('');
  // const [categoryId, setCategoryId] = useState('');
  // const [assetId, setAssetId] = useState('');
  // const [destinationAssetId, setDestinationAssetId] = useState('');
  // const [dayOfMonth, setDayOfMonth] = useState('1');
  // const [attachmentUrl, setAttachmentUrl] = useState('');



  // const resetForm = () => {
  //   setType('expense');
  //   setAmount('');
  //   setDescription('');
  //   setCategoryId('');
  //   setAssetId('');
  //   setDestinationAssetId('');
  //   setDayOfMonth('1');
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(form.amount);
    if (isNaN(parsedAmount) || !form.assetId || !form.type) return;

    // Validation
    const isTransfer = form.type === 'transfer';
    if (isNaN(parsedAmount) || !form.assetId || (isTransfer && !form.destinationAssetId)) {
      toast.error("Please fill all required fields.");
      return;
    }

    // The amount for transfers should be entered as a positive number representing the moved value.
    const amountOriginal = isTransfer
      ? -Math.abs(parsedAmount) // The source asset loses value
      : (form.type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount));

    // Always add the transaction
    const transactionData: TransactionCreateDto = {
      amountOriginal: amountOriginal,
      currencyOriginal: baseCurrency, // For V1, quick-add uses the base currency
      description: form.description || `${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`,
      date: new Date().toISOString().split('T')[0],
      assetId: form.assetId,
      destinationAssetId: isTransfer ? form.destinationAssetId : null,
      categoryId: !isTransfer ? form.categoryId : null,
      type: form.type, // Send the explicit type
      // The backend expects all fields, so send null for the rest
      attachmentUrl: null,
      customFields: null,
      links: null,
    };

    onAddTransaction(transactionData);
    setIsOpen(false);
  };

  // When dialog closes, reset the form
  useEffect(() => { if (!isOpen) setForm(initialFormState) }, [isOpen]);

  const typeButtons = [
    { value: 'expense' as const, label: 'Expense', icon: ArrowUpRight, color: 'text-destructive border-destructive' },
    { value: 'income' as const, label: 'Income', icon: ArrowDownLeft, color: 'text-success border-success' },
    { value: 'transfer' as const, label: 'Transfer', icon: ArrowLeftRight, color: 'text-foreground border-foreground' },
  ];

  const swapAssets = () => {
    const temp = form.assetId;
    setForm({ ...form, assetId: form.destinationAssetId, destinationAssetId: temp });
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Quick Add Transaction</DialogTitle>
            <DialogDescription>
              Log an expense, income, or transfer quickly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-[60vh]">
              <div className="space-y-4 p-6 pt-2 pb-6 px-1">
                {/* Transaction Type Selector */}
                <div className="flex gap-2">
                  {typeButtons.map(({ value, label, icon: Icon, color }) => (
                    <Button
                      key={value}
                      type="button"
                      variant="outline"
                      className={cn(
                        'flex-1 gap-2',
                        form.type === value && color
                      )}
                      onClick={() => {
                        setForm({ ...form, type: value, categoryId: '' });
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
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    autoFocus
                    required
                  />
                </div>

                {/* --- NEW DYNAMIC ASSET SELECTORS --- */}
                {form.type === 'transfer' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label>From</Label>
                      <Select value={form.assetId} onValueChange={v => setForm(f => ({ ...f, assetId: v }))} required>
                        <SelectTrigger>
                          <SelectValue placeholder="From" />
                        </SelectTrigger>
                        <SelectContent>
                          {liquidAssets.map((asset) => (
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
                      <Select value={form.destinationAssetId} onValueChange={v => setForm(f => ({ ...f, destinationAssetId: v }))} required>
                        <SelectTrigger>
                          <SelectValue placeholder="To" />
                        </SelectTrigger>
                        <SelectContent>
                          {liquidAssets.map((asset) => (
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
                    <Label>{form.type === 'income' ? 'To Account' : 'From Account'}</Label>
                    <Select value={form.assetId} onValueChange={v => setForm(f => ({ ...f, assetId: v }))} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {liquidAssets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category */}
                {form.type !== 'transfer' && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))} required>
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
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this for?"
                    className="resize-none"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>
            </ScrollArea>

            {/* Submit */}
            <div className="flex gap-2 p-6 pt-2 border-t mt-auto">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!form.amount || !form.assetId}>
                Add Transaction
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}