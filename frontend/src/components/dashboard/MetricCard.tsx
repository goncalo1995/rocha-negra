import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  currency?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  variant = 'default',
  currency = 'EUR',
}: MetricCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const variantStyles = {
    default: 'border-border',
    success: 'border-success/30',
    warning: 'border-warning/30',
    destructive: 'border-destructive/30',
  };

  const valueStyles = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  const trendStyles = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className={cn('border transition-colors hover:border-primary/30', variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold tracking-tight', valueStyles[variant])}>
          {formatCurrency(value, currency)}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2">
            {trend && (
              <div className={cn('flex items-center gap-1 text-xs', trendStyles[trend])}>
                <TrendIcon className="h-3 w-3" />
                {trendValue && <span>{trendValue}</span>}
              </div>
            )}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
