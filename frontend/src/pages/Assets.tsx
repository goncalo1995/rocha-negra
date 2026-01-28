import { useFinance } from '@/hooks/useFinance';
import { AssetManager } from '@/components/assets/AssetManager';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';
import { Spinner } from '@/components/ui/spinner';

export default function AssetsPage() {
    const {
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        addTransaction,
        categories,
        isLoading
    } = useFinance();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Assets</h1>
                    <p className="text-muted-foreground mt-1">Manage your holdings and accounts</p>
                </div>
            </div>

            <AssetManager
                assets={assets}
                baseCurrency="EUR"
                onAddAsset={addAsset}
                onUpdateAsset={updateAsset}
                onDeleteAsset={deleteAsset}
            />

            <QuickAddButton
                categories={categories}
                assets={assets}
                baseCurrency="EUR"
                onAddTransaction={addTransaction}
            />
        </div>
    );
}
