import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectedMonth } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';

interface ProjectionsChartProps {
  projections: ProjectedMonth[];
  currentBalance: number;
}

export function ProjectionsChart({ projections, currentBalance }: ProjectionsChartProps) {
  const chartData = useMemo(() => {
    return projections.map((p, idx) => ({
      month: p.month,
      income: p.projectedIncome,
      expenses: p.projectedExpenses,
      balance: p.cumulativeBalance,
      net: p.projectedBalance,
      isCurrent: idx === 0,
    }));
  }, [projections]);

  const summary = useMemo(() => {
    if (projections.length === 0) return null;

    const lastMonth = projections[projections.length - 1];
    const totalIncome = projections.reduce((sum, p) => sum + p.projectedIncome, 0);
    const totalExpenses = projections.reduce((sum, p) => sum + p.projectedExpenses, 0);
    const projectedChange = lastMonth.cumulativeBalance - currentBalance;

    return {
      totalIncome,
      totalExpenses,
      projectedBalance: lastMonth.cumulativeBalance,
      projectedChange,
      isPositive: projectedChange >= 0,
    };
  }, [projections, currentBalance]);

  if (!summary) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">Add recurring rules to see projections</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          12-Month Financial Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">Projected Income</p>
            <p className="text-lg font-bold text-success">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">Projected Expenses</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">End Balance</p>
            <p className="text-lg font-bold">{formatCurrency(summary.projectedBalance)}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <p className="text-xs text-muted-foreground">Net Change</p>
            <div className="flex items-center justify-center gap-1">
              {summary.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <p className={`text-lg font-bold ${summary.isPositive ? 'text-success' : 'text-destructive'}`}>
                {summary.isPositive ? '+' : ''}{formatCurrency(summary.projectedChange)}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'balance' ? 'Balance' : 
                  name === 'income' ? 'Income' : 
                  name === 'expenses' ? 'Expenses' : name
                ]}
              />
              <Legend />
              <ReferenceLine 
                y={currentBalance} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5" 
                label={{ 
                  value: 'Current', 
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 12 
                }} 
              />
              <Area
                type="monotone"
                dataKey="balance"
                name="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorBalance)"
              />
              <Area
                type="monotone"
                dataKey="income"
                name="income"
                stroke="hsl(var(--success))"
                strokeWidth={1}
                fill="url(#colorIncome)"
                opacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
