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
import { useFinance } from '@/hooks/useFinance';

interface VehicleManagerProps {
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  onAddVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  onUpdateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  onDeleteVehicle: (id: string) => void;
  onAddMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'userId' | 'linkedTransactionId'>) => void;
  onUpdateMaintenanceRecord: (id: string, updates: Partial<MaintenanceRecord>) => void;
  onDeleteMaintenanceRecord: (id: string) => void;
  onAddFuelRecord: (record: Omit<FuelRecord, 'id' | 'createdAt' | 'userId' | 'linkedTransactionId' | 'normalizedQuantityLiters' | 'normalizedMileageKm'>) => void;
  onUpdateFuelRecord: (id: string, updates: Partial<FuelRecord>) => void;
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
  onUpdateMaintenanceRecord,
  onDeleteMaintenanceRecord,
  onAddFuelRecord,
  onUpdateFuelRecord,
  onDeleteFuelRecord,
  getFuelEfficiency,
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingMaintenanceLog, setEditingMaintenanceLog] = useState<MaintenanceRecord | null>(null);
  const [editingFuelLog, setEditingFuelLog] = useState<FuelRecord | null>(null);

  const { assets } = useFinance();

  const [vehicleForm, setVehicleForm] = useState({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    licensePlate: '',
    vin: '',
    fuelType: 'gasoline' as FuelType,
    currentMileage: '',
    mileageUnit: 'km' as 'km' | 'mi',
    fuelUnit: 'liters' as 'liters' | 'gallons_us' | 'gallons_uk',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpirationDate: '',
    insuranceYearlyCost: '',
    insuranceRenewalDate: '',
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
    assetId: '',
    syncToFinance: true,
  });

  const [fuelForm, setFuelForm] = useState({
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '',
    quantityUnit: 'liters' as 'liters' | 'gallons_us' | 'gallons_uk',
    pricePerUnit: '',
    totalCost: '',
    mileageAtFill: '',
    fullTank: true,
    station: '',
    currency: 'EUR',
    notes: '',
    assetId: '',
    syncToFinance: true,
  });

  const resetVehicleForm = () => {
    setVehicleForm({
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear().toString(),
      licensePlate: '',
      vin: '',
      fuelType: 'gasoline',
      currentMileage: '',
      mileageUnit: 'km',
      fuelUnit: 'liters',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      insuranceExpirationDate: '',
      insuranceYearlyCost: '',
      insuranceRenewalDate: '',
      notes: '',
    });
    setEditingVehicle(null);
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const vehicleData = {
      name: vehicleForm.name || `${vehicleForm.make} ${vehicleForm.model} ${vehicleForm.year}`,
      make: vehicleForm.make,
      model: vehicleForm.model,
      year: parseInt(vehicleForm.year) || 0,
      licensePlate: vehicleForm.licensePlate || undefined,
      vin: vehicleForm.vin || undefined,
      fuelType: vehicleForm.fuelType,
      currentMileage: parseFloat(vehicleForm.currentMileage) || 0,
      mileageUnit: vehicleForm.mileageUnit,
      fuelUnit: vehicleForm.fuelUnit,
      insuranceProvider: vehicleForm.insuranceProvider || undefined,
      insurancePolicyNumber: vehicleForm.insurancePolicyNumber || undefined,
      insuranceExpirationDate: vehicleForm.insuranceExpirationDate || undefined,
      insuranceYearlyCost: parseFloat(vehicleForm.insuranceYearlyCost) || undefined,
      insuranceRenewalDate: vehicleForm.insuranceRenewalDate || undefined,
      notes: vehicleForm.notes || undefined,
    };

    if (editingVehicle) {
      onUpdateVehicle(editingVehicle.id, vehicleData);
    } else {
      onAddVehicle(vehicleData);
    }

    resetVehicleForm();
    setIsVehicleDialogOpen(false);
    setEditingVehicle(null);
  };

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const maintenanceData = {
      vehicleId: maintenanceForm.vehicleId,
      date: maintenanceForm.date,
      type: maintenanceForm.type,
      description: maintenanceForm.description,
      mileageAtService: parseFloat(maintenanceForm.mileageAtService) || 0,
      cost: parseFloat(maintenanceForm.cost) || 0,
      currency: maintenanceForm.currency,
      serviceProvider: maintenanceForm.serviceProvider || undefined,
      notes: maintenanceForm.notes || undefined,
      assetId: maintenanceForm.assetId || undefined,
      syncToFinance: maintenanceForm.syncToFinance,
    };

    if (editingMaintenanceLog) {
      onUpdateMaintenanceRecord(editingMaintenanceLog.id, maintenanceData);
    } else {
      onAddMaintenanceRecord(maintenanceData);
    }

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
      assetId: '',
      syncToFinance: true,
    });
    setIsMaintenanceDialogOpen(false);
    setEditingMaintenanceLog(null);
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(fuelForm.quantity) || 0;
    const pricePerUnit = parseFloat(fuelForm.pricePerUnit) || 0;
    const totalCost = parseFloat(fuelForm.totalCost) || (quantity * pricePerUnit);

    const fuelData = {
      vehicleId: fuelForm.vehicleId,
      date: fuelForm.date,
      quantity,
      quantityUnit: fuelForm.quantityUnit,
      pricePerUnit,
      totalCost,
      currency: fuelForm.currency,
      mileageAtFill: parseFloat(fuelForm.mileageAtFill) || 0,
      fullTank: fuelForm.fullTank,
      station: fuelForm.station || undefined,
      notes: fuelForm.notes || undefined,
      assetId: fuelForm.assetId || undefined,
      syncToFinance: fuelForm.syncToFinance,
    };

    if (editingFuelLog) {
      onUpdateFuelRecord(editingFuelLog.id, fuelData as any);
    } else {
      onAddFuelRecord(fuelData as any);
    }

    console.log(format(new Date(), 'yyyy-MM-dd'));
    setFuelForm({
      vehicleId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      quantity: '',
      quantityUnit: (vehicles.find(v => v.id === fuelForm.vehicleId)?.fuelUnit) || 'liters',
      pricePerUnit: '',
      totalCost: '',
      mileageAtFill: '',
      fullTank: true,
      station: '',
      currency: 'EUR',
      notes: '',
      assetId: '',
      syncToFinance: true,
    });
    setIsFuelDialogOpen(false);
    setEditingFuelLog(null);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      name: vehicle.name,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year.toString(),
      licensePlate: vehicle.licensePlate || '',
      vin: vehicle.vin || '',
      fuelType: vehicle.fuelType,
      currentMileage: (vehicle).currentMileage?.toString() || '',
      mileageUnit: (vehicle).mileageUnit || 'km',
      fuelUnit: (vehicle).fuelUnit || 'liters',
      insuranceProvider: (vehicle).insuranceProvider || '',
      insurancePolicyNumber: vehicle.insurancePolicyNumber || '',
      insuranceExpirationDate: vehicle.insuranceExpirationDate || '',
      insuranceYearlyCost: vehicle.insuranceYearlyCost?.toString() || '',
      insuranceRenewalDate: vehicle.insuranceRenewalDate || '',
      notes: vehicle.notes || '',
    });
    setIsVehicleDialogOpen(true);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    setEditingMaintenanceLog(record);
    setMaintenanceForm({
      vehicleId: record.vehicleId,
      date: record.date,
      type: record.type,
      description: record.description,
      mileageAtService: record.mileageAtService.toString(),
      cost: record.cost.toString(),
      currency: record.currency,
      serviceProvider: record.serviceProvider || '',
      notes: record.notes || '',
      assetId: record.assetId || '',
      syncToFinance: record.syncToFinance ?? true,
    });
    setIsMaintenanceDialogOpen(true);
  };

  const handleEditFuel = (record: FuelRecord) => {
    setEditingFuelLog(record);
    setFuelForm({
      vehicleId: record.vehicleId,
      date: record.date,
      quantity: record.quantity.toString(),
      quantityUnit: record.quantityUnit,
      pricePerUnit: record.pricePerUnit.toString(),
      totalCost: record.totalCost.toString(),
      mileageAtFill: record.mileageAtFill.toString(),
      fullTank: record.fullTank,
      station: record.station || '',
      currency: record.currency,
      notes: record.notes || '',
      assetId: record.assetId || '',
      syncToFinance: record.syncToFinance ?? true,
    });
    setIsFuelDialogOpen(true);
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
                      min="1900"
                      max="2100"
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
                    <Label htmlFor="vin">VIN</Label>
                    <Input
                      id="vin"
                      placeholder="Vehicle Identification Number"
                      value={vehicleForm.vin}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, vin: e.target.value }))}
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
                        min="0"
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
                  <div>
                    <Label htmlFor="fuelUnit">Fuel Unit</Label>
                    <Select
                      value={vehicleForm.fuelUnit}
                      onValueChange={(value) => setVehicleForm(prev => ({ ...prev, fuelUnit: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="gallons_us">Gallons (US)</SelectItem>
                        <SelectItem value="gallons_uk">Gallons (UK)</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                      <Input
                        id="insurancePolicyNumber"
                        placeholder="Policy #"
                        value={vehicleForm.insurancePolicyNumber}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insurancePolicyNumber: e.target.value }))}
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
                    <div>
                      <Label htmlFor="insuranceYearlyCost">Yearly Cost</Label>
                      <Input
                        id="insuranceYearlyCost"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Cost"
                        value={vehicleForm.insuranceYearlyCost}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceYearlyCost: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="insuranceRenewalDate">Next Renewal</Label>
                      <Input
                        id="insuranceRenewalDate"
                        type="date"
                        value={vehicleForm.insuranceRenewalDate}
                        onChange={(e) => setVehicleForm(prev => ({ ...prev, insuranceRenewalDate: e.target.value }))}
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
                      min="0"
                      step="0.01"
                      placeholder="150.00"
                      value={maintenanceForm.cost}
                      onChange={(e) => setMaintenanceForm(prev => ({ ...prev, cost: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenance-sync">Sync to Finance</Label>
                    <Switch
                      id="maintenance-sync"
                      checked={maintenanceForm.syncToFinance}
                      onCheckedChange={(checked) => setMaintenanceForm(prev => ({ ...prev, syncToFinance: checked }))}
                    />
                  </div>
                  {maintenanceForm.syncToFinance && (
                    <div>
                      <Label htmlFor="maintenance-asset">Account / Asset</Label>
                      <Select
                        value={maintenanceForm.assetId}
                        onValueChange={(value) => setMaintenanceForm(prev => ({ ...prev, assetId: value }))}
                      >
                        <SelectTrigger id="maintenance-asset">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map(asset => (
                            <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                      min="0"
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
                        min="0"
                        step="0.01"
                        placeholder="45.5"
                        value={fuelForm.quantity}
                        onChange={(e) => {
                          const qty = e.target.value;
                          const q = parseFloat(qty) || 0;
                          const p = parseFloat(fuelForm.pricePerUnit) || 0;
                          setFuelForm(prev => ({
                            ...prev,
                            quantity: qty,
                            totalCost: (q * p).toFixed(2)
                          }));
                        }}
                        required
                      />
                      <Select
                        value={fuelForm.quantityUnit}
                        onValueChange={(value) => setFuelForm(prev => ({ ...prev, quantityUnit: value as any }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="gallons_us">Gallons (US)</SelectItem>
                          <SelectItem value="gallons_uk">Gallons (UK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Price per Unit</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="1.65"
                      value={fuelForm.pricePerUnit}
                      onChange={(e) => {
                        const price = e.target.value;
                        const qty = parseFloat(fuelForm.quantity) || 0;
                        const p = parseFloat(price) || 0;
                        setFuelForm(prev => ({
                          ...prev,
                          pricePerUnit: price,
                          totalCost: (qty * p).toFixed(2)
                        }));
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label>Total Cost</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="75.00"
                      value={fuelForm.totalCost}
                      onChange={(e) => setFuelForm(prev => ({ ...prev, totalCost: e.target.value }))}
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

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="fuel-sync">Sync to Finance</Label>
                    <Switch
                      id="fuel-sync"
                      checked={fuelForm.syncToFinance}
                      onCheckedChange={(checked) => setFuelForm(prev => ({ ...prev, syncToFinance: checked }))}
                    />
                  </div>
                  {fuelForm.syncToFinance && (
                    <div>
                      <Label htmlFor="fuel-asset">Account / Asset</Label>
                      <Select
                        value={fuelForm.assetId}
                        onValueChange={(value) => setFuelForm(prev => ({ ...prev, assetId: value }))}
                      >
                        <SelectTrigger id="fuel-asset">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {assets.map(asset => (
                            <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
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
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-destructive mr-2">-{formatCurrency(record.cost)}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditMaintenance(record)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
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
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-destructive mr-2">-{formatCurrency(record.totalCost)}</span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditFuel(record)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
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
