import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Repeat, Pause, Play, Pencil, Trash2, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';
import { AddEditRuleDialog } from './AddEditRuleDialog'; // The new dialog component
import { RecurringRule, Category, Asset, TransactionType } from '@/types/finance';
import { formatCurrency } from '@/lib/utils'; // Assuming you have these formatters
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface RecurringRulesManagerProps {
  recurringRules: RecurringRule[];
  categories: Category[];
  assets: Asset[];
  baseCurrency: string;
  onAddRule: (rule: any) => void; // Use 'any' for now, will match RecurringRuleCreate
  onUpdateRule: (id: string, updates: Partial<RecurringRule>) => void;
  onDeleteRule: (id: string) => void;
}

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export function RecurringRulesManager({ recurringRules, categories, assets, baseCurrency, onAddRule, onUpdateRule, onDeleteRule }: RecurringRulesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  const { activeRules, inactiveRules, monthlyProjection } = useMemo(() => {
    const active = recurringRules.filter(r => r.isActive);
    const inactive = recurringRules.filter(r => !r.isActive);

    const projection = active.reduce((sum, rule) => {
      // Logic to convert various frequencies to a monthly amount for projection
      let monthlyAmount = rule.amount;
      if (rule.frequency === 'weekly') monthlyAmount *= (52 / 12);
      if (rule.frequency === 'daily') monthlyAmount *= 30;
      if (rule.frequency === 'quarterly') monthlyAmount /= 3;
      if (rule.frequency === 'yearly') monthlyAmount /= 12;
      return sum + monthlyAmount;
    }, 0);

    return { activeRules: active, inactiveRules: inactive, monthlyProjection: projection };
  }, [recurringRules]);

  const handleAddClick = () => {
    setEditingRule(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (rule: RecurringRule) => {
    setEditingRule(rule);
    setIsDialogOpen(true);
  };

  const toggleActive = (rule: RecurringRule) => {
    onUpdateRule(rule.id, { isActive: !rule.isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Recurring Rules</h2>
          <p className="text-sm text-muted-foreground">Manage your bills, subscriptions, and income</p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleAddClick}>
          <Plus className="h-4 w-4" /> Add Rule
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Projected Monthly Net</CardTitle></CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${monthlyProjection >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(monthlyProjection, baseCurrency)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Active Rules ({activeRules.length})</CardTitle></CardHeader>
        <CardContent>
          {activeRules.map(rule => {
            const category = categories.find(c => c.id === rule.categoryId);
            return (
              <div key={rule.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                <div className={`p-2 rounded-lg ${rule.type === 'income' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                  {rule.type === 'income' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{rule.description}</p>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Badge variant="outline">{frequencyLabels[rule.frequency]}</Badge>
                    <span>•</span>
                    <span>{category?.name || 'Uncategorized'}</span>
                    <Calendar className="h-3 w-3" />
                    <span>Next: {formatDate(rule.nextDueDate)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${rule.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(rule.amount, rule.currency)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => toggleActive(rule)}><Pause className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleEditClick(rule)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDeleteRule(rule.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {inactiveRules.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Paused Rules ({inactiveRules.length})</CardTitle></CardHeader>
          <CardContent>
            {inactiveRules.map(rule => (
              <div key={rule.id} className="flex items-center gap-4 py-3 border-b opacity-60">
                {/* ... display logic for inactive rules ... */}
                <div className="flex-1"><p>{rule.description}</p></div>
                <Button size="icon" variant="ghost" onClick={() => toggleActive(rule)}><Play className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <AddEditRuleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingRule={editingRule}
        categories={categories}
        assets={assets}
        baseCurrency={baseCurrency}
        onAddRule={onAddRule}
        onUpdateRule={onUpdateRule}
      />
    </div>
  );
}