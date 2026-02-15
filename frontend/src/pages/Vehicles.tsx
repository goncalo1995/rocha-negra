import { useNavigate } from 'react-router-dom';
import { Car, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehicles } from '@/hooks/useVehicles';
import { formatCurrency } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import VehicleManager from '@/components/vehicles/VehicleManager';

export default function Vehicles() {
  const navigate = useNavigate();
  const {
    vehicles,
    maintenanceRecords,
    fuelRecords,
    metrics,
    addVehicle,
    updateVehicle,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    addFuelRecord,
    updateFuelRecord,
  } = useVehicles();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage your fleet, track maintenance, and monitor fuel efficiency.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Total Vehicles</CardDescription>
            <CardTitle className="text-3xl font-bold">{metrics.totalVehicles}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-destructive/5 border-destructive/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Maintenance (Year)</CardDescription>
            <CardTitle className="text-3xl font-bold text-destructive">
              {formatCurrency(metrics.totalMaintenanceCostThisYear)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Fuel (Year)</CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-600">
              {formatCurrency(metrics.totalFuelCostThisYear)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-success/5 border-success/10">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Avg. Efficiency</CardDescription>
            <CardTitle className="text-3xl font-bold text-success">
              {metrics.averageFuelEfficiency !== null
                ? `${metrics.averageFuelEfficiency.toFixed(1)} km/L`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Vehicle Overview Manager */}
      <VehicleManager
        vehicles={vehicles}
        maintenanceRecords={maintenanceRecords}
        fuelRecords={fuelRecords}
        onAddVehicle={addVehicle}
        onUpdateVehicle={updateVehicle}
        onAddMaintenanceRecord={addMaintenanceRecord}
        onUpdateMaintenanceRecord={updateMaintenanceRecord}
        onAddFuelRecord={addFuelRecord}
        onUpdateFuelRecord={updateFuelRecord}
      />

      {/* List of Vehicles with Link to Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
            <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Car className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="capitalize text-[10px]">{vehicle.fuelType}</Badge>
              </div>
              <CardTitle className="text-xl mt-4">{vehicle.name}</CardTitle>
              <CardDescription>{vehicle.make} {vehicle.model} ({vehicle.year})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Mileage</span>
                  <span className="font-medium">{vehicle.currentMileage.toLocaleString()} {vehicle.mileageUnit}</span>
                </div>
                <div className="pt-3 border-t flex items-center justify-between text-primary font-medium text-sm">
                  <span>View Full Details</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
