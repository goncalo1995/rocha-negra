import { useFinance } from '@/hooks/useFinance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetManager } from '@/components/assets/AssetManager';
import { LiabilitiesManager } from '@/components/liabilities/LiabilitiesManager';
import { Wallet, CreditCard } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Portfolio() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'assets';

    const {
        assets,
        addAsset,
        updateAsset,
        deleteAsset,
        liabilities,
        addLiability,
        updateLiability,
        deleteLiability,
        isLoading: isLoadingFinance
    } = useFinance();

    const handleTabChange = (value: string) => {
        setSearchParams({ tab: value });
    };

    if (isLoadingFinance) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-pulse text-lg text-muted-foreground font-medium">Loading Portfolio...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Portfolio</h1>
                <p className="text-muted-foreground mt-1">A consolidated view of everything you own and owe.</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="assets" className="gap-2">
                        <Wallet className="h-4 w-4" />
                        Assets
                    </TabsTrigger>
                    <TabsTrigger value="liabilities" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        Liabilities
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="assets" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <AssetManager
                        assets={assets}
                        baseCurrency="EUR"
                        onAddAsset={addAsset}
                        onUpdateAsset={updateAsset}
                        onDeleteAsset={deleteAsset}
                    />
                </TabsContent>

                <TabsContent value="liabilities" className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <LiabilitiesManager
                        liabilities={liabilities}
                        baseCurrency="EUR"
                        onAddLiability={addLiability}
                        onUpdateLiability={updateLiability}
                        onDeleteLiability={deleteLiability}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
