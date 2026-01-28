import { useFinance } from '@/hooks/useFinance';
import { RecurringRulesManager } from '@/components/recurring/RecurringRulesManager';
import { Spinner } from '@/components/ui/spinner';

export default function FixedCostsPage() {
    const {
        recurringRules,
        categories,
        assets,
        addRecurringRule,
        updateRecurringRule,
        deleteRecurringRule,
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
                    <h1 className="text-3xl font-bold text-foreground">Fixed Costs</h1>
                    <p className="text-muted-foreground mt-1">Manage your recurring subscriptions and bills</p>
                </div>
            </div>

            <RecurringRulesManager
                recurringRules={recurringRules}
                categories={categories}
                assets={assets}
                baseCurrency="EUR"
                onAddRule={addRecurringRule}
                onUpdateRule={updateRecurringRule}
                onDeleteRule={deleteRecurringRule}
            />
        </div>
    );
}
