import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction, Category } from '@/types/finance';
import { formatCurrency } from '@/lib/formatters';

interface ExpenseBreakdownChartProps {
  transactions: Transaction[];
  categories: Category[];
}

const FIXED_COLOR = 'hsl(220, 70%, 55%)';
const VARIABLE_COLOR = 'hsl(152, 60%, 45%)';
const SAVINGS_COLOR = 'hsl(38, 92%, 50%)';

export function ExpenseBreakdownChart({ transactions, categories }: ExpenseBreakdownChartProps) {
  const data = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const breakdown = expenseTransactions.reduce(
      (acc, t) => {
        const category = categories.find(c => c.id === t.categoryId);
        if (category) {
          if (category.nature === 'fixed') {
            acc.fixed += t.amountOriginal;
          } else if (category.nature === 'variable') {
            acc.variable += t.amountOriginal;
          } else if (category.nature === 'savings') {
            acc.savings += t.amountOriginal;
          }
        }
        return acc;
      },
      { fixed: 0, variable: 0, savings: 0 }
    );

    return [
      { name: 'Fixed (Needs)', value: breakdown.fixed, color: FIXED_COLOR },
      { name: 'Variable (Wants)', value: breakdown.variable, color: VARIABLE_COLOR },
      { name: 'Savings', value: breakdown.savings, color: SAVINGS_COLOR },
    ].filter(item => item.value > 0);
  }, [transactions, categories]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No expenses this month</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.value)} ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                content={({ payload }) => (
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-muted-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
