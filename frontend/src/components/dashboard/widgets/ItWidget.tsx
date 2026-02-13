import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { DashboardResponseDto } from "@/types/dashboard";
import { Globe } from "lucide-react";
import { Link } from "react-router-dom";

interface ItWidgetProps {
    data: DashboardResponseDto['it'];
}

export function ItWidget({ data }: ItWidgetProps) {
    if (!data) return null;

    return (
        <BentoCard
            title="IT Assets"
            subtitle="Domains & Renewals"
            headerAction={
                <Link to="/it">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Globe className="h-4 w-4" />
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Domains</p>
                    <p className="text-lg font-bold">{data.totalDomains}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Annual Cost</p>
                    <p className="text-lg font-bold text-destructive">{formatCurrency(data.annualCost)}</p>
                </div>
            </div>
        </BentoCard>
    );
}
