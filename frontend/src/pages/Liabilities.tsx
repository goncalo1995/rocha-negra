import { useFinance } from '@/hooks/useFinance';
import { LiabilitiesManager } from '@/components/liabilities/LiabilitiesManager';
import { Spinner } from '@/components/ui/spinner';

export default function LiabilitiesPage() {
    const {
        liabilities,
        addLiability,
        updateLiability,
        deleteLiability,
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
                    <h1 className="text-3xl font-bold text-foreground">Liabilities</h1>
                    <p className="text-muted-foreground mt-1">Track your debts and obligations</p>
                </div>
            </div>

            <LiabilitiesManager
                liabilities={liabilities}
                baseCurrency="EUR"
                onAddLiability={addLiability}
                onUpdateLiability={updateLiability}
                onDeleteLiability={deleteLiability}
            />
        </div>
    );
}
