import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { DashboardResponseDto } from "@/types/dashboard";
import { TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

interface DebtsWidgetProps {
    data: DashboardResponseDto['debts'];
}

export function DebtsWidget({ data }: DebtsWidgetProps) {
    if (!data) return null;

    const totalLiabilities = data.totalDebt || 0;

    return (
        <BentoCard
            title="Debts Overview"
            subtitle={`${totalLiabilities} active debts`}
            headerAction={
                <Link to="/finance">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <TrendingDown className="h-4 w-4" />
                    </Button>
                </Link>
            }
        >
            <div className="space-y-3">
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive mb-1">Total Outstanding</p>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(totalLiabilities)}</p>
                </div>
                {totalLiabilities === 0 && (
                    <p className="text-sm text-muted-foreground italic">No debts.</p>
                )}
            </div>
        </BentoCard>
    );
}
