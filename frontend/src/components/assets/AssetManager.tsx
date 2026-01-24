import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Asset, AssetCreateDto, AssetType } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import {
  Plus,
  Banknote,
  TrendingUp,
  Car,
  ChartCandlestickIcon,
  Home,
  Gem,
  ShieldQuestionIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AssetList from './AssetList';
import AddAssetDialog from './AddAssetDialog';

interface AssetManagerProps {
  assets: Asset[];
  baseCurrency: string;
  onAddAsset: (asset: AssetCreateDto) => void;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
}

export const assetTypeConfig: Record<AssetType, { label: string; icon: typeof Banknote; color: string }> = {
  cash: { label: 'Cash', icon: Banknote, color: 'text-success' },
  bank_account: { label: 'Bank Account', icon: Banknote, color: 'text-success' },
  credit_card: { label: 'Credit Card', icon: Banknote, color: 'text-success' }, // FIX recreate enum and then remove this
  investment: { label: 'Investment', icon: TrendingUp, color: 'text-chart-2' },
  crypto: { label: 'Crypto', icon: TrendingUp, color: 'text-success' },
  stock: { label: 'Stock', icon: ChartCandlestickIcon, color: 'text-success' },
  vehicle: { label: 'Vehicle', icon: Car, color: 'text-chart-3' },
  property: { label: 'Property', icon: Home, color: 'text-chart-3' },
  jewelry: { label: 'Jewelry', icon: Gem, color: 'text-chart-3' },
  other: { label: 'Other', icon: ShieldQuestionIcon, color: 'text-chart-3' },
};

export function AssetManager({ assets, baseCurrency, onAddAsset, onUpdateAsset, onDeleteAsset }: AssetManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const handleAddClick = () => {
    setEditingAsset(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAddDialogOpen(true);
  };

  // We are assuming the 'totalsByType' data will come from a new backend endpoint.
  // For now, we can show a simpler total.
  const totalAssetValue = useMemo(() => {
    // This is a simplified client-side calculation. The backend dashboard is the source of truth.
    return assets.reduce((sum, asset) => sum + (asset.balance || 0), 0);
  }, [assets]);

  const groupedAssets = assets.reduce((acc, asset) => {
    if (!acc[asset.type]) acc[asset.type] = [];
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<AssetType, Asset[]>);

  const totalsByType = (Object.keys(assetTypeConfig) as AssetType[]).map(type => ({
    type,
    total: (groupedAssets[type] || []).reduce((sum, a) => sum + (a.balance || a.quantity || 0), 0),
    count: (groupedAssets[type] || []).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Asset Manager</h2>
          <p className="text-sm text-muted-foreground">
            Total Asset Value: <span className="font-bold text-success">{formatCurrency(totalAssetValue, baseCurrency)}</span>
          </p>
        </div>
        <Button size="sm" className="gap-2" onClick={handleAddClick}>
          <Plus className="h-4 w-4" /> Add Asset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {totalsByType.map(({ type, total, count }) => {
          const config = assetTypeConfig[type];
          const Icon = config.icon;
          if (count === 0) {
            return null;
          }
          return (
            <Card key={type} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg bg-secondary p-2', config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className={'text-lg font-semibold'}>
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
      <AssetList assets={assets} baseCurrency={baseCurrency} onEdit={handleEditClick} onDelete={onDeleteAsset} />

      <AddAssetDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        editingAsset={editingAsset}
        onAddAsset={onAddAsset}
        onUpdateAsset={onUpdateAsset}
        baseCurrency={baseCurrency}
      />
    </div>
  );
}
