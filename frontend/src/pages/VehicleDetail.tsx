import { useParams, useNavigate } from 'react-router-dom';
import { useVehicleDetails, useVehicles } from '@/hooks/useVehicles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Wrench, Fuel, Calendar, MapPin, TrendingUp, Info } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/formatters';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VehicleDetail() {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const navigate = useNavigate();
    const { vehicle, maintenanceRecords, fuelRecords, isLoading } = useVehicleDetails(vehicleId);
    const { deleteVehicle } = useVehicles();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
                <p className="text-lg font-medium text-muted-foreground">Vehicle not found.</p>
                <Button onClick={() => navigate('/vehicles')}>Back to Vehicles</Button>
            </div>
        );
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this vehicle?')) {
            await deleteVehicle(vehicle.id);
            navigate('/vehicles');
        }
    };

    const totalMaintenance = maintenanceRecords.reduce((acc, r) => acc + (r.cost || 0), 0);
    const totalFuel = fuelRecords.reduce((acc, r) => acc + (r.totalCost || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/vehicles')} className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Header/Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <TrendingUp className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl">{vehicle.name}</CardTitle>
                                <CardDescription className="text-lg">
                                    {vehicle.make} {vehicle.model} • {vehicle.year}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-bold">License Plate</span>
                                <p className="text-lg font-medium">{vehicle.licensePlate || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-bold">Current Mileage</span>
                                <p className="text-lg font-medium">{vehicle.currentMileage.toLocaleString()} {vehicle.mileageUnit}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground uppercase font-bold">Fuel Type</span>
                                <Badge variant="secondary" className="capitalize">{vehicle.fuelType}</Badge>
                            </div>
                            <div className="space-y-1 md:col-span-3 pt-4 border-t">
                                <span className="text-xs text-muted-foreground uppercase font-bold">Insurance</span>
                                <p className="text-sm">
                                    {vehicle.insuranceProvider ? `${vehicle.insuranceProvider} (${vehicle.insurancePolicyNumber})` : 'No insurance policy recorded.'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cost Summary */}
                <Card className="bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">Financial Impact</CardTitle>
                        <CardDescription>Total costs associated with this vehicle</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-end border-b pb-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalMaintenance)}</p>
                            </div>
                            <Wrench className="h-8 w-8 text-primary/20 mb-1" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Fuel Consumption</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalFuel)}</p>
                            </div>
                            <Fuel className="h-8 w-8 text-orange-500/20 mb-1" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="maintenance" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="maintenance" className="gap-2">
                        <Wrench className="h-4 w-4" />
                        Maintenance History
                    </TabsTrigger>
                    <TabsTrigger value="fuel" className="gap-2">
                        <Fuel className="h-4 w-4" />
                        Fuel Logs
                    </TabsTrigger>
                    <TabsTrigger value="info" className="gap-2">
                        <Info className="h-4 w-4" />
                        Insights
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="maintenance">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Mileage</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {maintenanceRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No maintenance records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        maintenanceRecords.map(record => (
                                            <TableRow key={record.id}>
                                                <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">{record.type.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[250px] truncate">{record.description}</TableCell>
                                                <TableCell>{record.mileageAtService.toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(record.cost)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fuel">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Mileage</TableHead>
                                        <TableHead>Station</TableHead>
                                        <TableHead className="text-right">Total Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fuelRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No fuel records found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        fuelRecords.map(record => (
                                            <TableRow key={record.id}>
                                                <TableCell>{format(new Date(record.date), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>{record.quantity} {record.quantityUnit}</TableCell>
                                                <TableCell>{record.mileageAtFill.toLocaleString()}</TableCell>
                                                <TableCell>{record.station || 'N/A'}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(record.totalCost)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>Maintenance Insights</CardTitle>
                            <CardDescription>Predicted maintenance and health score</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">AI-driven maintenance insights coming soon.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
