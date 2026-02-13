import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { DashboardResponseDto } from "@/types/dashboard";
import { Car } from "lucide-react";
import { Link } from "react-router-dom";

interface VehiclesWidgetProps {
    data: DashboardResponseDto['vehicles'];
}

export function VehiclesWidget({ data }: VehiclesWidgetProps) {
    if (!data) return null;

    return (
        <BentoCard
            title="Vehicles"
            subtitle="Maintenance & Fuel"
            headerAction={
                <Link to="/vehicles">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <Car className="h-4 w-4" />
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Vehicles</p>
                    <p className="text-lg font-bold">{data.totalVehicles}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Costs (Year)</p>
                    <p className="text-lg font-bold text-destructive">
                        {formatCurrency(data.yearlyCost)}
                    </p>
                </div>
            </div>
        </BentoCard>
    );
}
