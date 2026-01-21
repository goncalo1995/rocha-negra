import { Vehicle, MaintenanceRecord, FuelRecord } from '@/types/vehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Car, Edit2, Fuel, Trash2 } from 'lucide-react';
import { Wrench } from 'lucide-react';
import { Gauge } from 'lucide-react';
import { Button } from '../ui/button';

interface VehicleCardProps {
    vehicle: Vehicle;
    baseCurrency: string;
    maintenanceRecords: MaintenanceRecord[];
    fuelRecords: FuelRecord[];
    // You would pass down handler functions from the parent component
    handleEditVehicle: (vehicle: Vehicle) => void;
    handleEditMaintenance: (maintenance: MaintenanceRecord) => void;
    handleEditFuel: (fuel: FuelRecord) => void;
    onDeleteVehicle: (id: string) => void;
    onDeleteMaintenanceRecord: (id: string) => void;
    onDeleteFuelRecord: (id: string) => void;
}

// --- NEW: A smaller, focused sub-component for the log list ---
const LogList = ({ records, vehicle, currency, type, onEdit, onDelete }: any) => {
    if (records.length === 0) {
        return <p className="py-4 text-center text-sm text-muted-foreground">No {type} records yet</p>;
    }

    return (
        <div className="space-y-2">
            {records.slice(0, 5).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                    {/* Display logic for either maintenance or fuel */}
                    {type === 'maintenance' ? (
                        <div>
                            <p className="font-medium">{record.description}</p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(record.date), 'MMM d, yyyy')}
                                {record.mileage_at_service ? ` • ${record.mileage_at_service.toLocaleString()} ${vehicle.mileage_unit}` : ''}
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-medium">
                                {record.quantity} {record.quantity_unit?.startsWith('gallons') ? 'gal' : 'L'}
                                {record.station && ` at ${record.station}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(record.date), 'MMM d, yyyy')} • {record.mileage_at_fill?.toLocaleString()} {vehicle.mileage_unit}
                            </p>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-destructive mr-2">-{formatCurrency(record.cost || record.total_cost, currency)}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(record)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(record.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export function VehicleCard({
    vehicle,
    baseCurrency,
    maintenanceRecords,
    fuelRecords,
    onDeleteVehicle,
    onDeleteMaintenanceRecord,
    onDeleteFuelRecord,
    handleEditVehicle,
    handleEditMaintenance,
    handleEditFuel,
}: VehicleCardProps) {

    // --- Use `useMemo` to prevent expensive re-calculations on every render ---
    const memoizedData = useMemo(() => {
        const currency = maintenanceRecords[0]?.currency || fuelRecords[0]?.currency || baseCurrency;

        const maintenanceThisYear = maintenanceRecords
            .filter(m => new Date(m.date).getFullYear() === new Date().getFullYear())
            .reduce((sum, m) => sum + m.cost, 0);

        const fuelThisYear = fuelRecords
            .filter(f => new Date(f.date).getFullYear() === new Date().getFullYear())
            .reduce((sum, f) => sum + f.totalCost, 0);

        // Sort the records once
        const sortedMaintenance = [...maintenanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const sortedFuel = [...fuelRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { currency, maintenanceThisYear, fuelThisYear, sortedMaintenance, sortedFuel };
    }, [maintenanceRecords, fuelRecords, baseCurrency]);

    // Destructure for cleaner access
    const { currency, maintenanceThisYear, fuelThisYear, sortedMaintenance, sortedFuel } = memoizedData;


    // --- FIX: This logic should ideally move to a backend endpoint ---
    // For now, let's make the client-side calculation more robust.
    const getFuelEfficiency = () => {
        const sortedRecords = [...fuelRecords].sort((a, b) => a.mileageAtFill - b.mileageAtFill);
        if (sortedRecords.length < 2) return null;

        const lastFill = sortedRecords[sortedRecords.length - 1];
        const previousFill = sortedRecords[sortedRecords.length - 2];

        const distance = lastFill.mileageAtFill - previousFill.mileageAtFill;
        const fuelUsed = previousFill.quantity; // Assumes fill-up method

        if (distance <= 0 || fuelUsed <= 0) return null;

        // This is a simplified calculation
        return distance / fuelUsed;
    };

    const efficiency = getFuelEfficiency();

    return (
        <Card key={vehicle.id}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                            <CardDescription>
                                {vehicle.licensePlate && `${vehicle.licensePlate} • `}
                                {vehicle.currentMileage.toLocaleString()} {vehicle.mileageUnit}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* {insuranceStatus && (
                <Badge variant={insuranceStatus.variant} className="gap-1">
                    <Shield className="h-3 w-3" />
                    {insuranceStatus.label}
                </Badge>
                )} */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditVehicle(vehicle)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => onDeleteVehicle(vehicle.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Fuel className="h-4 w-4" />
                            <span>Avg Fuel Efficiency</span>
                        </div>
                        <p className="mt-1 text-lg font-semibold">
                            {/* FIX: Adjust efficiency display logic */}
                            {efficiency !== null
                                ? `${efficiency.toFixed(1)} ${vehicle.mileageUnit === 'mi' ? 'mpg' : 'km/L'}`
                                : 'N/A'}
                        </p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Wrench className="h-4 w-4" />
                            <span>Maintenance (This Year)</span>
                        </div>
                        <p className="mt-1 text-lg font-semibold">{formatCurrency(maintenanceThisYear, currency)}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Gauge className="h-4 w-4" />
                            <span>Fuel (This Year)</span>
                        </div>
                        <p className="mt-1 text-lg font-semibold">{formatCurrency(fuelThisYear, currency)}</p>
                    </div>
                </div>

                <Tabs defaultValue="maintenance" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="maintenance">
                            Maintenance ({maintenanceRecords.length})
                        </TabsTrigger>
                        <TabsTrigger value="fuel">
                            Fuel ({fuelRecords.length})
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="maintenance" className="mt-4">
                        <LogList
                            records={sortedMaintenance}
                            vehicle={vehicle}
                            currency={currency}
                            type="maintenance"
                            onEdit={handleEditMaintenance}
                            onDelete={onDeleteMaintenanceRecord}
                        />
                    </TabsContent>
                    <TabsContent value="fuel" className="mt-4">
                        <LogList
                            records={sortedFuel}
                            vehicle={vehicle}
                            currency={currency}
                            type="fuel"
                            onEdit={handleEditFuel}
                            onDelete={onDeleteFuelRecord}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}