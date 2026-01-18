export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg';

export interface Vehicle {
  id: string;
  name: string; // e.g., "Honda Civic 2020"
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  fuelType: FuelType;
  // Tracking
  currentMileage: number;
  mileageUnit: 'km' | 'mi';
  // Finance integration
  linkedAssetId?: string;
  // Insurance
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpirationDate?: string;
  insuranceRecurringRuleId?: string;
  // Metadata
  purchaseDate?: string;
  purchasePrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'inspection' | 'repair' | 'other';
  description: string;
  mileageAtService: number;
  cost: number;
  currency: string;
  // Finance sync
  linkedTransactionId?: string;
  // Metadata
  serviceProvider?: string;
  notes?: string;
  createdAt: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  quantity: number; // liters or gallons
  quantityUnit: 'liters' | 'gallons';
  pricePerUnit: number;
  totalCost: number;
  currency: string;
  mileageAtFill: number;
  fullTank: boolean;
  // Finance sync
  linkedTransactionId?: string;
  // Metadata
  station?: string;
  notes?: string;
  createdAt: string;
}

export interface VehiclesState {
  vehicles: Vehicle[];
  maintenanceRecords: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
}

export interface VehicleMetrics {
  totalVehicles: number;
  totalMaintenanceCostThisYear: number;
  totalFuelCostThisYear: number;
  upcomingInsurance: Vehicle | null;
  averageFuelEfficiency: number | null; // km/L or mpg
}
