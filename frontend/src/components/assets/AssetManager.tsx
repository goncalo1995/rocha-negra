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
import { Asset, AssetType } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/formatters';
import {
  Plus,
  Banknote,
  TrendingUp,
  Car,
  CreditCard,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetManagerProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
}

const assetTypeConfig: Record<AssetType, { label: string; icon: typeof Banknote; color: string }> = {
  cash: { label: 'Cash', icon: Banknote, color: 'text-success' },
  bank_account: { label: 'Bank Account', icon: Banknote, color: 'text-success' },
  credit_card: { label: 'Credit Card', icon: Banknote, color: 'text-success' },
  investment: { label: 'Investment', icon: TrendingUp, color: 'text-chart-2' },
  vehicle: { label: 'Vehicle', icon: Car, color: 'text-chart-3' },
  property: { label: 'Property', icon: Car, color: 'text-chart-3' },
  jewelry: { label: 'Jewelry', icon: Car, color: 'text-chart-3' },
  other: { label: 'Other', icon: Car, color: 'text-chart-3' },
};

export function AssetManager({ assets, onAddAsset, onUpdateAsset, onDeleteAsset }: AssetManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('cash');
  const [initialValue, setInitialValue] = useState('');
  const [description, setDescription] = useState('');

  const isLiability = type === 'credit_card';

  const resetForm = () => {
    setName('');
    setType('cash');
    setInitialValue('');
    setDescription('');
    setEditingAsset(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const value = parseFloat(initialValue);
    if (isNaN(value)) return;

    if (editingAsset) {
      onUpdateAsset(editingAsset.id, {
        name,
        type,
        current_value: isLiability ? -Math.abs(value) : value,
        description,
      });
    } else {
      onAddAsset({
        name,
        type,
        current_value: isLiability ? -Math.abs(value) : value,
        currency: 'EUR',
        description,
        institution: '',
        custom_fields: {},
      });
    }

    resetForm();
    setIsAddDialogOpen(false);
  };

  const startEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setName(asset.name);
    setType(asset.type);
    setInitialValue(Math.abs(asset.current_value).toString());
    setDescription(asset.description || '');
    setIsAddDialogOpen(true);
  };

  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) acc[asset.type] = [];
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<AssetType, Asset[]>);

  const totalsByType = (Object.keys(assetTypeConfig) as AssetType[]).map(type => ({
    type,
    total: (groupedAssets[type] || []).reduce((sum, a) => sum + a.current_value, 0),
    count: (groupedAssets[type] || []).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Asset Manager</h2>
          <p className="text-sm text-muted-foreground">Track your accounts and property</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
              <DialogDescription>
                {editingAsset ? 'Update the details of your asset.' : 'Add a new asset to track your wealth.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Bank Account"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AssetType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(assetTypeConfig) as [AssetType, typeof assetTypeConfig.cash][]).map(
                      ([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className={cn('h-4 w-4', config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Label htmlFor="value">
                {editingAsset ? 'Current Value (€)' : 'Initial Value (€)'}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={initialValue} // Use the new state variable
                onChange={(e) => setInitialValue(e.target.value)}
                required
              />

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Any notes about this asset"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">{editingAsset ? 'Save Changes' : 'Add Asset'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {totalsByType.map(({ type, total, count }) => {
          const config = assetTypeConfig[type];
          const Icon = config.icon;
          return (
            <Card key={type} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg bg-secondary p-2', config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className={cn('text-lg font-semibold', isLiability ? 'text-destructive' : '')}>
                      {formatCurrency(Math.abs(total))}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Asset List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">All Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Banknote className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No assets yet. Add your first asset to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assets.map((asset) => {
                const config = assetTypeConfig[asset.type];
                const Icon = config.icon;
                return (
                  <div
                    key={asset.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/30"
                  >
                    <div className={cn('rounded-lg bg-secondary p-2', config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(asset.updated_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn('font-semibold', isLiability ? 'text-destructive' : 'text-foreground')}>
                        {formatCurrency(asset.current_value)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(asset)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDeleteAsset(asset.id)}
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
    </div>
  );
}
