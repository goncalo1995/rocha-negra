import { Link } from 'react-router-dom';
import { DashboardCockpit } from '@/components/dashboard/DashboardCockpit';
import { useFinance } from '@/hooks/useFinance';
import { LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { QuickAddButton } from '@/components/transactions/QuickAddButton';

const Finance = () => {
  const {
    assets,
    categories,
    transactions,
    metrics,
    isLoadingMetrics,
    addTransaction
  } = useFinance();

  if (isLoadingMetrics || metrics == null) {
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
          <h1 className="text-3xl font-bold text-foreground">Treasury</h1>
          <p className="text-muted-foreground mt-1">Global financial overview and metrics</p>
        </div>
      </div>

      <div className="grid gap-6">
        <DashboardCockpit
          metrics={metrics}
          transactions={transactions}
          categories={categories}
        />

        <Card className="bg-gradient-to-br from-card to-accent/5 border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl">Financial Forecast</CardTitle>
            <CardDescription>
              View a detailed 24-month projection of your net worth based on your recurring rules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/finance/projections">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/20">
                <LineChart className="mr-2 h-5 w-5" />
                Analyze Projective Net Worth
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add FAB remains available everywhere in Treasury */}
      <QuickAddButton
        categories={categories}
        assets={assets}
        baseCurrency="EUR"
        onAddTransaction={addTransaction}
      />
    </div>
  );
};

export default Finance;
