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
    addDomainsBulk,
    updateDomain,
    deleteDomain,
  } = useIT();

  return (
    <div className="min-h-screen bg-background">

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
          onAddDomainsBulk={addDomainsBulk}
          onUpdateDomain={updateDomain}
          onDeleteDomain={deleteDomain}
          baseCurrency={"EUR"}
        // {userPreferences.base_currency}
        />
      </main>
    </div>
  );
};

export default IT;
