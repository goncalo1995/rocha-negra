import React, { useState } from 'react';
import { Plus, Car, Wrench, Fuel, Trash2, Edit2, Calendar, Gauge, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Vehicle, MaintenanceRecord, FuelRecord, FuelType } from '@/types/vehicles';
import { formatCurrency } from '@/lib/formatters';
import { format, differenceInDays } from 'date-fns';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
  onAddMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'linkedTransactionId'>) => void;
  onDeleteMaintenanceRecord: (id: string) => void;
  onAddFuelRecord: (record: Omit<FuelRecord, 'id' | 'createdAt' | 'linkedTransactionId'>) => void;
  onDeleteFuelRecord: (id: string) => void;
  getFuelEfficiency: (vehicleId: string) => number | null;
}

const fuelTypes: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'lpg', label: 'LPG' },
];

const maintenanceTypes = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tire_rotation', label: 'Tire Rotation' },
  { value: 'brake_service', label: 'Brake Service' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'repair', label: 'Repair' },
  { value: 'other', label: 'Other' },
];

const VehicleManager: React.FC<VehicleManagerProps> = ({
  vehicles,
  maintenanceRecords,
  fuelRecords,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAddMaintenanceRecord,
  onDeleteMaintenanceRecord,
  onAddFuelRecord,
  onDeleteFuelRecord,
  getFuelEfficiency,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    licensePlate: '',
    fuelType: 'gasoline' as FuelType,
    currentMileage: '',
    mileageUnit: 'km' as 'km' | 'mi',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpirationDate: '',
    notes: '',
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'oil_change' as MaintenanceRecord['type'],
    description: '',
    mileageAtService: '',
    cost: '',
    currency: 'EUR',
    serviceProvider: '',
    notes: '',
  });

  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '',
    quantityUnit: 'liters' as 'liters' | 'gallons',
    pricePerUnit: '',
    mileageAtFill: '',
    fullTank: true,
    station: '',
    currency: 'EUR',
    notes: '',
  });

  const resetVehicleForm = () => {
    setVehicleForm({
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      licensePlate: '',
      fuelType: 'gasoline',
      currentMileage: '',
      mileageUnit: 'km',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceExpirationDate: '',
      notes: '',
    });
    setEditingVehicle(null);
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehicle) {
      onUpdateVehicle(editingVehicle.id, {
        name: vehicleForm.name || `${vehicleForm.make} ${vehicleForm.model} ${vehicleForm.year}`,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: parseInt(vehicleForm.year),
        licensePlate: vehicleForm.licensePlate || undefined,
        fuelType: vehicleForm.fuelType,
        currentMileage: parseFloat(vehicleForm.currentMileage) || 0,
        mileageUnit: vehicleForm.mileageUnit,
        insuranceProvider: vehicleForm.insuranceProvider || undefined,
        insurancePolicyNumber: vehicleForm.insurancePolicyNumber || undefined,
        insuranceExpirationDate: vehicleForm.insuranceExpirationDate || undefined,
        notes: vehicleForm.notes || undefined,
      });
    } else {
      onAddVehicle({
        name: vehicleForm.name || `${vehicleForm.make} ${vehicleForm.model} ${vehicleForm.year}`,
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: parseInt(vehicleForm.year),
        licensePlate: vehicleForm.licensePlate || undefined,
        fuelType: vehicleForm.fuelType,
        currentMileage: parseFloat(vehicleForm.currentMileage) || 0,
        mileageUnit: vehicleForm.mileageUnit,
        insuranceProvider: vehicleForm.insuranceProvider || undefined,
        insurancePolicyNumber: vehicleForm.insurancePolicyNumber || undefined,
        insuranceExpirationDate: vehicleForm.insuranceExpirationDate || undefined,
        notes: vehicleForm.notes || undefined,
      });
    }
    
    resetVehicleForm();
    setIsVehicleDialogOpen(false);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddMaintenanceRecord({
      vehicleId: maintenanceForm.vehicleId,
      date: maintenanceForm.date,
      type: maintenanceForm.type,
      description: maintenanceForm.description,
      mileageAtService: parseFloat(maintenanceForm.mileageAtService) || 0,
      cost: parseFloat(maintenanceForm.cost) || 0,
      currency: maintenanceForm.currency,
      serviceProvider: maintenanceForm.serviceProvider || undefined,
      notes: maintenanceForm.notes || undefined,
    });
    
    setMaintenanceForm({
      vehicleId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'oil_change',
      description: '',
      mileageAtService: '',
      cost: '',
      currency: 'EUR',
      serviceProvider: '',
      notes: '',
    });
    setIsMaintenanceDialogOpen(false);
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseFloat(fuelForm.quantity) || 0;
    const pricePerUnit = parseFloat(fuelForm.pricePerUnit) || 0;
    
    onAddFuelRecord({
      vehicleId: fuelForm.vehicleId,
      date: fuelForm.date,
      quantity,
      quantityUnit: fuelForm.quantityUnit,
      pricePerUnit,
      totalCost: quantity * pricePerUnit,
      currency: fuelForm.currency,
      mileageAtFill: parseFloat(fuelForm.mileageAtFill) || 0,
      fullTank: fuelForm.fullTank,
      station: fuelForm.station || undefined,
      notes: fuelForm.notes || undefined,
    });
    
    setFuelForm({
      vehicleId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      quantity: '',
      quantityUnit: 'liters',
      pricePerUnit: '',
      mileageAtFill: '',
      fullTank: true,
      station: '',
      currency: 'EUR',
      notes: '',
    });
    setIsFuelDialogOpen(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      licensePlate: vehicle.licensePlate || '',
      fuelType: vehicle.fuelType,
      currentMileage: vehicle.currentMileage.toString(),
      mileageUnit: vehicle.mileageUnit,
      insuranceProvider: vehicle.insuranceProvider || '',
      insurancePolicyNumber: vehicle.insurancePolicyNumber || '',
      insuranceExpirationDate: vehicle.insuranceExpirationDate || '',
      notes: vehicle.notes || '',
    });
    setIsVehicleDialogOpen(true);
  };

  const getInsuranceStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    const days = differenceInDays(new Date(expirationDate), new Date());
    if (days < 0) return { label: 'Expired', variant: 'destructive' as const };
    if (days <= 30) return { label: `${days}d left`, variant: 'destructive' as const };
    if (days <= 90) return { label: `${days}d left`, variant: 'outline' as const };
    
    return { label: format(new Date(expirationDate), 'MMM yyyy'), variant: 'secondary' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Vehicles</h2>
          <p className="text-sm text-muted-foreground">Track maintenance, fuel, and costs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Add Vehicle Dialog */}
          <Dialog open={isVehicleDialogOpen} onOpenChange={(open) => {
            setIsVehicleDialogOpen(open);
            if (!open) resetVehicleForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? 'Update vehicle details' : 'Add a new vehicle to track'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g., Honda"
                      value={vehicleForm.make}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g., Civic"
                      value={vehicleForm.model}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2020"
                      value={vehicleForm.year}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, year: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      placeholder="Optional"
                      value={vehicleForm.licensePlate}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, licensePlate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select
                      value={vehicleForm.fuelType}
                      onValueChange={(value) => setVehicleForm(prev => ({ ...prev, fuelType: value as FuelType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelTypes.map(ft => (
                          <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentMileage">Current Mileage</Label>
                    <div className="flex gap-2">
                      <Input
                        id="currentMileage"
                        type="number"
                        placeholder="50000"
                        value={vehicleForm.currentMileage}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, currentMileage: e.target.value }))}
                      />
                      <Select
                        value={vehicleForm.mileageUnit}
                        onValueChange={(value) => setVehicleForm(prev => ({ ...prev, mileageUnit: value as 'km' | 'mi' }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">km</SelectItem>
                          <SelectItem value="mi">mi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="mb-3 text-sm font-medium">Insurance (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insuranceProvider">Provider</Label>
                      <Input
                        id="insuranceProvider"
                        placeholder="e.g., Allianz"
                        value={vehicleForm.insuranceProvider}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceProvider: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insuranceExpirationDate">Expiration</Label>
                      <Input
                        id="insuranceExpirationDate"
                        type="date"
                        value={vehicleForm.insuranceExpirationDate}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceExpirationDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    resetVehicleForm();
                    setIsVehicleDialogOpen(false);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingVehicle ? 'Update' : 'Add'} Vehicle</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Maintenance Dialog */}
          <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={vehicles.length === 0}>
                <Wrench className="mr-2 h-4 w-4" />
                Log Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Maintenance</DialogTitle>
                <DialogDescription>Record a maintenance service (auto-syncs to Finance)</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
                <div>
                  <Label>Vehicle</Label>
                  <Select
                    value={maintenanceForm.vehicleId}
                    onValueChange={(value) => setMaintenanceForm(prev => ({ ...prev, vehicleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={maintenanceForm.date}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={maintenanceForm.type}
                      onValueChange={(value) => setMaintenanceForm(prev => ({ ...prev, type: value as MaintenanceRecord['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenanceTypes.map(mt => (
                          <SelectItem key={mt.value} value={mt.value}>{mt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="What was done?"
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Mileage at Service</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={maintenanceForm.mileageAtService}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, mileageAtService: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Cost</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="150.00"
                      value={maintenanceForm.cost}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, cost: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!maintenanceForm.vehicleId}>Log Maintenance</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Add Fuel Dialog */}
          <Dialog open={isFuelDialogOpen} onOpenChange={setIsFuelDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={vehicles.length === 0}>
                <Fuel className="mr-2 h-4 w-4" />
                Log Fuel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Fuel</DialogTitle>
                <DialogDescription>Record a fuel fill-up (auto-syncs to Finance)</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFuelSubmit} className="space-y-4">
                <div>
                  <Label>Vehicle</Label>
                  <Select
                    value={fuelForm.vehicleId}
                    onValueChange={(value) => setFuelForm(prev => ({ ...prev, vehicleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={fuelForm.date}
                      onChange={(e) => setFuelForm(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Mileage at Fill</Label>
                    <Input
                      type="number"
                      placeholder="50000"
                      value={fuelForm.mileageAtFill}
                      onChange={(e) => setFuelForm(prev => ({ ...prev, mileageAtFill: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="45.5"
                        value={fuelForm.quantity}
                        onChange={(e) => setFuelForm(prev => ({ ...prev, quantity: e.target.value }))}
                        required
                      />
                      <Select
                        value={fuelForm.quantityUnit}
                        onValueChange={(value) => setFuelForm(prev => ({ ...prev, quantityUnit: value as 'liters' | 'gallons' }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="liters">L</SelectItem>
                          <SelectItem value="gallons">gal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Price per Unit</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="1.65"
                      value={fuelForm.pricePerUnit}
                      onChange={(e) => setFuelForm(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <Label>Full Tank</Label>
                    <Switch
                      checked={fuelForm.fullTank}
                      onCheckedChange={(checked) => setFuelForm(prev => ({ ...prev, fullTank: checked }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Station (Optional)</Label>
                    <Input
                      placeholder="e.g., Shell, BP"
                      value={fuelForm.station}
                      onChange={(e) => setFuelForm(prev => ({ ...prev, station: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsFuelDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!fuelForm.vehicleId}>Log Fuel</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vehicle List */}
      {vehicles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No vehicles yet</h3>
            <p className="text-sm text-muted-foreground">Add your first vehicle to start tracking</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {vehicles.map((vehicle) => {
            const vehicleMaintenanceRecords = maintenanceRecords.filter(m => m.vehicleId === vehicle.id);
            const vehicleFuelRecords = fuelRecords.filter(f => f.vehicleId === vehicle.id);
            const efficiency = getFuelEfficiency(vehicle.id);
            const insuranceStatus = getInsuranceStatus(vehicle.insuranceExpirationDate);

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
                      {insuranceStatus && (
                        <Badge variant={insuranceStatus.variant} className="gap-1">
                          <Shield className="h-3 w-3" />
                          {insuranceStatus.label}
                        </Badge>
                      )}
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
                        <span>Fuel Efficiency</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {efficiency !== null 
                          ? `${efficiency.toFixed(1)} ${vehicle.mileageUnit}/${vehicle.fuelType === 'electric' ? 'kWh' : 'L'}`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wrench className="h-4 w-4" />
                        <span>Maintenance (This Year)</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {formatCurrency(
                          vehicleMaintenanceRecords
                            .filter(m => new Date(m.date).getFullYear() === new Date().getFullYear())
                            .reduce((sum, m) => sum + m.cost, 0)
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gauge className="h-4 w-4" />
                        <span>Fuel (This Year)</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold">
                        {formatCurrency(
                          vehicleFuelRecords
                            .filter(f => new Date(f.date).getFullYear() === new Date().getFullYear())
                            .reduce((sum, f) => sum + f.totalCost, 0)
                        )}
                      </p>
                    </div>
                  </div>

                  <Tabs defaultValue="maintenance" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="maintenance">
                        Maintenance ({vehicleMaintenanceRecords.length})
                      </TabsTrigger>
                      <TabsTrigger value="fuel">
                        Fuel ({vehicleFuelRecords.length})
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="maintenance" className="mt-4">
                      {vehicleMaintenanceRecords.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No maintenance records yet</p>
                      ) : (
                        <div className="space-y-2">
                          {vehicleMaintenanceRecords
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((record) => (
                              <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                  <p className="font-medium">{record.description}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(record.date), 'MMM d, yyyy')} • {record.mileageAtService.toLocaleString()} {vehicle.mileageUnit}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-destructive">-{formatCurrency(record.cost)}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onDeleteMaintenanceRecord(record.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="fuel" className="mt-4">
                      {vehicleFuelRecords.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">No fuel records yet</p>
                      ) : (
                        <div className="space-y-2">
                          {vehicleFuelRecords
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .slice(0, 5)
                            .map((record) => (
                              <div key={record.id} className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                  <p className="font-medium">
                                    {record.quantity} {record.quantityUnit === 'liters' ? 'L' : 'gal'}
                                    {record.station && ` at ${record.station}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(record.date), 'MMM d, yyyy')} • {record.mileageAtFill.toLocaleString()} {vehicle.mileageUnit}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-destructive">-{formatCurrency(record.totalCost)}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onDeleteFuelRecord(record.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehicleManager;
