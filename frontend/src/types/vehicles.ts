import { Database } from './database.types';
import { FromDb } from './utils';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type MaintenanceRow = Database['public']['Tables']['maintenance_logs']['Row'];
type FuelRow = Database['public']['Tables']['fuel_logs']['Row'];

export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'lpg';

export interface Vehicle extends FromDb<Omit<VehicleRow, 'fuel_type' | 'mileage_unit' | 'fuel_unit'>> {
  fuelType: FuelType;
  mileageUnit: 'km' | 'mi';
  fuelUnit: 'liters' | 'gallons_us' | 'gallons_uk';
  // UI-only or transient fields
  insuranceRecurringRuleId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface MaintenanceRecord extends FromDb<Omit<MaintenanceRow, 'type'>> {
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'inspection' | 'repair' | 'other';
}

export interface FuelRecord extends FromDb<Omit<FuelRow, 'quantity_unit'>> {
  quantityUnit: 'liters' | 'gallons_us' | 'gallons_uk';
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
