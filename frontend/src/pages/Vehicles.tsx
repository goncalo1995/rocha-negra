import { Link } from 'react-router-dom';
import { ArrowLeft, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VehicleManager from '@/components/vehicles/VehicleManager';
import { useVehicles } from '@/hooks/useVehicles';
import { formatCurrency } from '@/lib/formatters';

const Vehicles = () => {
  const {
    vehicles,
    maintenanceRecords,
    fuelRecords,
    metrics,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenanceRecord,
    deleteMaintenanceRecord,
    addFuelRecord,
    deleteFuelRecord,
    getFuelEfficiency,
  } = useVehicles();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50">
        <div className="container flex items-center gap-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
              <Car className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Vehicles</h1>
              <p className="text-sm text-muted-foreground">Maintenance & fuel tracking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Metrics Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Vehicles</CardDescription>
              <CardTitle className="text-2xl">{metrics.totalVehicles}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Maintenance (Year)</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {formatCurrency(metrics.totalMaintenanceCostThisYear)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Fuel (Year)</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {formatCurrency(metrics.totalFuelCostThisYear)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Fuel Efficiency</CardDescription>
              <CardTitle className="text-2xl">
                {metrics.averageFuelEfficiency !== null 
                  ? `${metrics.averageFuelEfficiency.toFixed(1)} km/L`
                  : 'N/A'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Vehicle Manager */}
        <VehicleManager
          vehicles={vehicles}
          maintenanceRecords={maintenanceRecords}
          fuelRecords={fuelRecords}
          onAddVehicle={addVehicle}
          onUpdateVehicle={updateVehicle}
          onDeleteVehicle={deleteVehicle}
          onAddMaintenanceRecord={addMaintenanceRecord}
          onDeleteMaintenanceRecord={deleteMaintenanceRecord}
          onAddFuelRecord={addFuelRecord}
          onDeleteFuelRecord={deleteFuelRecord}
          getFuelEfficiency={getFuelEfficiency}
        />
      </main>
    </div>
  );
};

export default Vehicles;
