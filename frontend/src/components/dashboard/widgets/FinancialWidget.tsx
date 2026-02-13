import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { DashboardResponseDto } from "@/types/dashboard";
import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

interface FinancialWidgetProps {
    data: DashboardResponseDto['financial'];
    debts: DashboardResponseDto['debts'];
}

export function FinancialWidget({ data, debts }: FinancialWidgetProps) {
    if (!data) return null;

    return (
        <BentoCard
            title="Financial Health"
            subtitle="Your wealth at a glance"
            headerAction={
                <Link to="/finance">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Wallet className="h-4 w-4" />
                    </Button>
                </Link>
            }
        >
            <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 border border-emerald-700/30">
                    <p className="text-sm text-emerald-400 mb-1">Net Worth</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(data.totalNetWorth)}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Debt: {formatCurrency(debts?.totalDebt || 0)}</span>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-accent">
                    <p className="text-sm text-muted-foreground mb-1">Safe to Spend</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        After {formatCurrency(data.monthlyExpenses)} monthly costs
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.monthlySavings > 0 ? `+${formatCurrency(data.monthlySavings)} monthly savings` : "No savings"}
                    </p>
                </div>
            </div>
        </BentoCard>
    );
}
