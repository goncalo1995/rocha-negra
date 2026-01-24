import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Liability, LiabilityCreateDto, LiabilityType, LiabilityUpdateDto } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Plus, Landmark, CreditCard, Home, Pencil, Trash2 } from 'lucide-react';

// --- Props for the component ---
interface LiabilitiesManagerProps {
  liabilities: Liability[];
  baseCurrency: string; // Pass the user's base currency as a prop
  onAddLiability: (liability: LiabilityCreateDto) => void;
  onUpdateLiability: (id: string, updates: LiabilityUpdateDto) => void;
  onDeleteLiability: (id: string) => void;
}

// --- Configuration for liability types (icons, labels) ---
const liabilityTypeConfig: Record<LiabilityType, { label: string; icon: React.ElementType }> = {
  loan: { label: 'Loan', icon: Landmark },
  credit_card: { label: 'Credit Card', icon: CreditCard },
  mortgage: { label: 'Mortgage', icon: Home },
  other: { label: 'Other', icon: Landmark },
};

export function LiabilitiesManager({ liabilities, baseCurrency, onAddLiability, onUpdateLiability, onDeleteLiability }: LiabilitiesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  // --- Form state, now specific to Liabilities ---
  const [name, setName] = useState('');
  const [type, setType] = useState<LiabilityType>('loan');
  const [initialAmount, setInitialAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const resetForm = () => {
    setName('');
    setType('loan');
    setInitialAmount('');
    setCurrentBalance('');
    setInterestRate('');
    setEditingLiability(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const initial = parseFloat(initialAmount);
    const current = parseFloat(currentBalance);
    if (isNaN(initial) || isNaN(current)) return;

    const liabilityData = {
      name,
      type,
      currency: baseCurrency,
      initialAmount: initial,
      currentBalance: current,
      interestRate: parseFloat(interestRate) || undefined,
      description: '',
      customFields: {},
    };

    if (editingLiability) {
      onUpdateLiability(editingLiability.id, liabilityData);
    } else {
      onAddLiability(liabilityData);
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const startEdit = (liability: Liability) => {
    setEditingLiability(liability);
    setName(liability.name);
    setType(liability.type);
    setInitialAmount(liability.initial_amount.toString());
    setCurrentBalance(liability.current_balance.toString());
    setInterestRate(liability.interest_rate?.toString() || '');
    setIsDialogOpen(true);
  };

  const totalDebt = liabilities.reduce((sum, l) => sum + l.current_balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Liabilities Manager</h2>
          <p className="text-sm text-muted-foreground">
            Total Debt: <span className="font-bold text-destructive">{formatCurrency(totalDebt, baseCurrency)}</span>
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Liability</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLiability ? 'Edit Liability' : 'Add New Liability'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="e.g., Car Loan, Visa Card" value={name} onChange={(e) => setName(e.target.value)} required />

              <Select value={type} onValueChange={(v) => setType(v as LiabilityType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(liabilityTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2"><config.icon className="h-4 w-4" /> {config.label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Initial Amount" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} required />
                <Input type="number" placeholder="Current Balance" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} required />
              </div>
              <Input type="number" step="0.01" placeholder="Interest Rate % (Optional)" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingLiability ? 'Save Changes' : 'Add Liability'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">All Liabilities</CardTitle></CardHeader>
        <CardContent>
          {liabilities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No liabilities yet.</p>
          ) : (
            <div className="space-y-2">
              {liabilities.map((liability) => {
                const config = liabilityTypeConfig[liability.type];
                const Icon = config.icon;
                return (
                  <div key={liability.id} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="rounded-lg bg-secondary p-2 text-destructive/80"><Icon className="h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="font-medium">{liability.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {liability.interest_rate ? `${liability.interest_rate}% • ` : ''}
                        Updated {formatDate(liability.updated_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">{formatCurrency(liability.current_balance, liability.currency)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(liability.initial_amount, liability.currency)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(liability)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onDeleteLiability(liability.id)}><Trash2 className="h-3 w-3" /></Button>
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