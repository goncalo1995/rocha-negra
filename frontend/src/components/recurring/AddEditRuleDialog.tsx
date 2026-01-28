import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RecurringRule, RecurringRuleCreate, Category, Asset, TransactionType, RecurringFrequency, LIQUID_ASSET_TYPES } from '@/types/finance';
import { format } from 'date-fns';
import { RecurringRuleUpdateDto } from '@/types/finance';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddEditRuleDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    editingRule: RecurringRule | null;
    categories: Category[];
    assets: Asset[];
    baseCurrency: string;
    onAddRule: (rule: RecurringRuleCreate) => void;
    onUpdateRule: (id: string, updates: Partial<RecurringRuleUpdateDto>) => void;
}

const frequencies: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
const frequencyLabels: Record<RecurringFrequency, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
};

export function AddEditRuleDialog({ isOpen, onOpenChange, editingRule, categories, assets, baseCurrency, onAddRule, onUpdateRule }: AddEditRuleDialogProps) {
    const [type, setType] = useState<TransactionType>('expense');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [categoryId, setCategoryId] = useState('');
    const [assetId, setAssetId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingRule) {
                setType(editingRule.type);
                setDescription(editingRule.description);
                setAmount(Math.abs(editingRule.amount).toString());
                setFrequency(editingRule.frequency);
                setStartDate(editingRule.nextDueDate); // Use next_due_date as a sensible default
                setEndDate(editingRule.endDate || '');
                setCategoryId(editingRule.categoryId || '');
                setAssetId(editingRule.assetId || '');
            } else {
                // Reset form for a new rule
                setType('expense');
                setDescription('');
                setAmount('');
                setFrequency('monthly');
                setStartDate(format(new Date(), 'yyyy-MM-dd'));
                setEndDate(format(new Date(), 'yyyy-MM-dd'));
                setCategoryId('');
                setAssetId('');
            }
        }
    }, [isOpen, editingRule]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || !description) {
            toast.error("Please provide a description and a valid amount.");
            return;
        }

        if (editingRule) {
            // For V1, a simple description update is a safe bet.
            // A full update requires more complex backend endpoints.
            onUpdateRule(editingRule.id, { description, startDate, categoryId, assetId });
            toast.success("Rule description updated.");
        } else {
            const ruleData: RecurringRuleCreate = {
                description,
                frequency,
                startDate,
                endDate,
                amount: type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount), // Set sign based on type
                currency: baseCurrency,
                type,
                categoryId: categoryId || null,
                assetId: assetId || null,
                destinationAssetId: null,
            };
            onAddRule(ruleData);
            toast.success("New recurring rule added.");
        }
        onOpenChange(false);
    };

    const liquidAssets = useMemo(() => assets.filter(a => LIQUID_ASSET_TYPES.includes(a.type as any)), [assets]);
    const filteredCategories = useMemo(() => categories.filter(c => c.type === type), [categories, type]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>{editingRule ? 'Edit Rule' : 'Add Recurring Rule'}</DialogTitle>
                    <DialogDescription>Set up a bill, subscription, or recurring income.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-6 pt-2">
                        <div className="space-y-4 py-2">
                            <div className="flex gap-2">
                                <Button type="button" variant={type === 'expense' ? 'destructive' : 'outline'} onClick={() => setType('expense')}>Expense</Button>
                                <Button type="button" variant={type === 'income' ? 'success' : 'outline'} onClick={() => setType('income')}>Income</Button>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Amount ({baseCurrency})</Label>
                                    <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Frequency</Label>
                                    <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{frequencies.map(f => <SelectItem key={f} value={f}>{frequencyLabels[f]}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>First Payment Date</Label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{filteredCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Asset</Label>
                                    <Select value={assetId} onValueChange={(v) => setAssetId(v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{liquidAssets.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 p-6 pt-2 border-t mt-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">{editingRule ? 'Save Changes' : 'Add Rule'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}