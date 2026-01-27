import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Wallet, Dumbbell, Brain, ChartLine, Sparkles, Globe, Car } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useIT } from '@/hooks/useIT';
import { useVehicles } from '@/hooks/useVehicles';
import { formatCurrency } from '@/lib/formatters';

interface ModuleWidget {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  enabled: boolean;
  gradient: string;
  summary?: React.ReactNode;
}

const Home = () => {
  const { metrics, recurringRules } = useFinance();
  const { metrics: itMetrics } = useIT();
  const { metrics: vehicleMetrics } = useVehicles();

  const modules: ModuleWidget[] = [
    {
      id: 'finance',
      title: 'Finance',
      description: 'Track assets, expenses, and build wealth',
      icon: Wallet,
      href: '/finance',
      enabled: true,
      gradient: 'from-primary/20 to-primary/5',
      summary: (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Net Worth</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(metrics.netWorth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Burn</p>
            <p className="text-lg font-bold text-destructive">-{formatCurrency(metrics.monthlyBurn)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Safe to Spend</p>
            <p className="text-lg font-bold">{formatCurrency(metrics.safeToSpend)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Upcoming Bills</p>
            <p className="text-lg font-bold text-warning">{metrics.upcomingBillsCount}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'it',
      title: 'IT Assets',
      description: 'Domains, renewals, and annual costs',
      icon: Globe,
      href: '/it',
      enabled: true,
      gradient: 'from-chart-3/20 to-chart-3/5',
      summary: (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Domains</p>
            <p className="text-lg font-bold">{itMetrics.totalDomains}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Annual Cost</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(itMetrics.annualCost)}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      description: 'Maintenance, fuel, and insurance tracking',
      icon: Car,
      href: '/vehicles',
      enabled: true,
      gradient: 'from-chart-1/20 to-chart-1/5',
      summary: (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Vehicles</p>
            <p className="text-lg font-bold">{vehicleMetrics.totalVehicles}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Costs (Year)</p>
            <p className="text-lg font-bold text-destructive">
              {formatCurrency(vehicleMetrics.totalMaintenanceCostThisYear + vehicleMetrics.totalFuelCostThisYear)}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sports',
      title: 'Sports',
      description: 'Training plans, progress, and achievements',
      icon: Dumbbell,
      href: '/sports',
      enabled: false,
      gradient: 'from-chart-2/20 to-chart-2/5',
    },
    {
      id: 'mindset',
      title: 'Mindset',
      description: 'Habits, goals, and personal growth',
      icon: Brain,
      href: '/mindset',
      enabled: false,
      gradient: 'from-chart-4/20 to-chart-4/5',
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Module Grid */}
      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Your Modules</h2>
            <p className="text-sm text-muted-foreground">Click to open</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>More modules coming soon</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;

            if (!module.enabled) {
              return (
                <Card
                  key={module.id}
                  className="relative overflow-hidden border-dashed opacity-50 transition-opacity hover:opacity-70"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient}`} />
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-sm text-muted-foreground italic">Coming soon...</p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Link key={module.id} to={module.href} className="group">
                <Card className="relative overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} transition-opacity group-hover:opacity-150`} />
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    {module.summary}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-12 rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChartLine className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active recurring rules:</span>
              <span className="font-semibold">{recurringRules.filter(r => r.isActive).length}</span>
            </div>
            <Link to="/finance" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
