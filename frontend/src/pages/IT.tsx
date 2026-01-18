import { Link } from 'react-router-dom';
import { ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DomainManager from '@/components/it/DomainManager';
import { useIT } from '@/hooks/useIT';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

const IT = () => {
  const {
    domains,
    metrics,
    addDomain,
    updateDomain,
    deleteDomain,
  } = useIT();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50">
        <div className="container flex items-center gap-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-3/10">
              <Globe className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">IT Assets</h1>
              <p className="text-sm text-muted-foreground">Domain portfolio management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Metrics Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Domains</CardDescription>
              <CardTitle className="text-2xl">{metrics.totalDomains}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Annual Cost</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(metrics.annualCost)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Expiring This Month</CardDescription>
              <CardTitle className="text-2xl text-destructive">{metrics.expiringThisMonth}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Next Renewal</CardDescription>
              <CardTitle className="text-lg">
                {metrics.nextRenewal 
                  ? `${metrics.nextRenewal.name} (${format(new Date(metrics.nextRenewal.expirationDate), 'MMM d')})`
                  : 'None'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Domain Manager */}
        <DomainManager
          domains={domains}
          onAddDomain={addDomain}
          onUpdateDomain={updateDomain}
          onDeleteDomain={deleteDomain}
        />
      </main>
    </div>
  );
};

export default IT;
