import { useLocalStorage } from './useLocalStorage';
import { Vehicle, MaintenanceRecord, FuelRecord, VehiclesState, VehicleMetrics } from '@/types/vehicles';
import { useMemo, useCallback } from 'react';
import { useFinance } from './useFinance';

const STORAGE_KEY = 'rocha-negra-vehicles';

const initialState: VehiclesState = {
  vehicles: [],
  maintenanceRecords: [],
  fuelRecords: [],
};

export function useVehicles() {
  const [state, setState] = useLocalStorage<VehiclesState>(STORAGE_KEY, initialState);
  const { 
    addTransaction, 
    addRecurringRule, 
    deleteRecurringRule, 
    updateRecurringRule,
    categories, 
    assets 
  } = useFinance();

  // Get categories for auto-linking
  const getMaintenanceCategory = useCallback(() => {
    return categories.find(c => c.name === 'Car Maintenance') || categories.find(c => c.type === 'expense');
  }, [categories]);

  const getFuelCategory = useCallback(() => {
    return categories.find(c => c.name === 'Fuel') || categories.find(c => c.type === 'expense');
  }, [categories]);

  const getInsuranceCategory = useCallback(() => {
    return categories.find(c => c.name === 'Insurance') || categories.find(c => c.type === 'expense');
  }, [categories]);

  const getDefaultAsset = useCallback(() => {
    return assets.find(a => a.type === 'liquid_cash') || assets[0];
  }, [assets]);

  // Vehicle operations
  const addVehicle = useCallback((vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Auto-create insurance recurring rule if provided
    if (vehicle.insuranceExpirationDate && vehicle.insuranceProvider) {
      const category = getInsuranceCategory();
      const asset = getDefaultAsset();
      
      if (category && asset) {
        const rule = addRecurringRule({
          name: `Insurance: ${vehicle.name}`,
          categoryId: category.id,
          assetId: asset.id,
          type: 'expense',
          frequency: 'yearly',
          dayOfMonth: new Date(vehicle.insuranceExpirationDate).getDate(),
          nextDueDate: vehicle.insuranceExpirationDate,
          projectedAmount: 0, // User can update later
          description: `Annual insurance renewal for ${vehicle.name}`,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        newVehicle.insuranceRecurringRuleId = rule.id;
      }
    }

    setState(prev => ({ ...prev, vehicles: [...prev.vehicles, newVehicle] }));
    return newVehicle;
  }, [setState, addRecurringRule, getInsuranceCategory, getDefaultAsset]);

  const updateVehicle = useCallback((id: string, updates: Partial<Vehicle>) => {
    setState(prev => {
      const vehicle = prev.vehicles.find(v => v.id === id);
      if (!vehicle) return prev;

      // Update insurance recurring rule if expiration changed
      if (vehicle.insuranceRecurringRuleId && updates.insuranceExpirationDate) {
        updateRecurringRule(vehicle.insuranceRecurringRuleId, {
          nextDueDate: updates.insuranceExpirationDate,
        });
      }

      return {
        ...prev,
        vehicles: prev.vehicles.map(v =>
          v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v
        ),
      };
    });
  }, [setState, updateRecurringRule]);

  const deleteVehicle = useCallback((id: string) => {
    const vehicle = state.vehicles.find(v => v.id === id);
    if (vehicle?.insuranceRecurringRuleId) {
      deleteRecurringRule(vehicle.insuranceRecurringRuleId);
    }
    setState(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.id !== id),
      maintenanceRecords: prev.maintenanceRecords.filter(m => m.vehicleId !== id),
      fuelRecords: prev.fuelRecords.filter(f => f.vehicleId !== id),
    }));
  }, [setState, state.vehicles, deleteRecurringRule]);

  // Maintenance operations
  const addMaintenanceRecord = useCallback((record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'linkedTransactionId'>) => {
    const category = getMaintenanceCategory();
    const asset = getDefaultAsset();

    let linkedTransactionId: string | undefined;

    // Auto-create finance transaction
    if (category && asset && record.cost > 0) {
      const transaction = addTransaction({
        amount: record.cost,
        description: `${record.type.replace('_', ' ')}: ${record.description}`,
        date: record.date,
        type: 'expense',
        categoryId: category.id,
        assetId: asset.id,
        isRecurring: false,
      });
      linkedTransactionId = transaction.id;
    }

    const newRecord: MaintenanceRecord = {
      ...record,
      id: crypto.randomUUID(),
      linkedTransactionId,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle mileage
    setState(prev => ({
      ...prev,
      maintenanceRecords: [...prev.maintenanceRecords, newRecord],
      vehicles: prev.vehicles.map(v =>
        v.id === record.vehicleId && record.mileageAtService > v.currentMileage
          ? { ...v, currentMileage: record.mileageAtService, updatedAt: new Date().toISOString() }
          : v
      ),
    }));

    return newRecord;
  }, [setState, addTransaction, getMaintenanceCategory, getDefaultAsset]);

  const deleteMaintenanceRecord = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      maintenanceRecords: prev.maintenanceRecords.filter(m => m.id !== id),
    }));
  }, [setState]);

  // Fuel operations
  const addFuelRecord = useCallback((record: Omit<FuelRecord, 'id' | 'createdAt' | 'linkedTransactionId'>) => {
    const category = getFuelCategory();
    const asset = getDefaultAsset();

    let linkedTransactionId: string | undefined;

    // Auto-create finance transaction
    if (category && asset && record.totalCost > 0) {
      const transaction = addTransaction({
        amount: record.totalCost,
        description: `Fuel: ${record.quantity} ${record.quantityUnit}${record.station ? ` at ${record.station}` : ''}`,
        date: record.date,
        type: 'expense',
        categoryId: category.id,
        assetId: asset.id,
        isRecurring: false,
      });
      linkedTransactionId = transaction.id;
    }

    const newRecord: FuelRecord = {
      ...record,
      id: crypto.randomUUID(),
      linkedTransactionId,
      createdAt: new Date().toISOString(),
    };

    // Update vehicle mileage
    setState(prev => ({
      ...prev,
      fuelRecords: [...prev.fuelRecords, newRecord],
      vehicles: prev.vehicles.map(v =>
        v.id === record.vehicleId && record.mileageAtFill > v.currentMileage
          ? { ...v, currentMileage: record.mileageAtFill, updatedAt: new Date().toISOString() }
          : v
      ),
    }));

    return newRecord;
  }, [setState, addTransaction, getFuelCategory, getDefaultAsset]);

  const deleteFuelRecord = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      fuelRecords: prev.fuelRecords.filter(f => f.id !== id),
    }));
  }, [setState]);

  // Get records for a specific vehicle
  const getVehicleRecords = useCallback((vehicleId: string) => {
    return {
      maintenance: state.maintenanceRecords.filter(m => m.vehicleId === vehicleId),
      fuel: state.fuelRecords.filter(f => f.vehicleId === vehicleId),
    };
  }, [state.maintenanceRecords, state.fuelRecords]);

  // Calculate fuel efficiency for a vehicle
  const getFuelEfficiency = useCallback((vehicleId: string) => {
    const fuelRecords = state.fuelRecords
      .filter(f => f.vehicleId === vehicleId && f.fullTank)
      .sort((a, b) => a.mileageAtFill - b.mileageAtFill);

    if (fuelRecords.length < 2) return null;

    let totalDistance = 0;
    let totalFuel = 0;

    for (let i = 1; i < fuelRecords.length; i++) {
      totalDistance += fuelRecords[i].mileageAtFill - fuelRecords[i - 1].mileageAtFill;
      totalFuel += fuelRecords[i].quantity;
    }

    return totalFuel > 0 ? totalDistance / totalFuel : null;
  }, [state.fuelRecords]);

  // Metrics
  const metrics = useMemo((): VehicleMetrics => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const totalMaintenanceCostThisYear = state.maintenanceRecords
      .filter(m => new Date(m.date) >= startOfYear)
      .reduce((sum, m) => sum + m.cost, 0);

    const totalFuelCostThisYear = state.fuelRecords
      .filter(f => new Date(f.date) >= startOfYear)
      .reduce((sum, f) => sum + f.totalCost, 0);

    const vehiclesWithInsurance = state.vehicles
      .filter(v => v.insuranceExpirationDate && new Date(v.insuranceExpirationDate) >= now)
      .sort((a, b) => 
        new Date(a.insuranceExpirationDate!).getTime() - new Date(b.insuranceExpirationDate!).getTime()
      );

    // Average fuel efficiency across all vehicles
    let totalEfficiency = 0;
    let vehicleCount = 0;
    state.vehicles.forEach(v => {
      const eff = getFuelEfficiency(v.id);
      if (eff !== null) {
        totalEfficiency += eff;
        vehicleCount++;
      }
    });

    return {
      totalVehicles: state.vehicles.length,
      totalMaintenanceCostThisYear,
      totalFuelCostThisYear,
      upcomingInsurance: vehiclesWithInsurance[0] || null,
      averageFuelEfficiency: vehicleCount > 0 ? totalEfficiency / vehicleCount : null,
    };
  }, [state.vehicles, state.maintenanceRecords, state.fuelRecords, getFuelEfficiency]);

  // Export/Import
  const exportData = useCallback((): VehiclesState => state, [state]);
  const importData = useCallback((data: Partial<VehiclesState>) => {
    setState(prev => ({
      vehicles: data.vehicles ?? prev.vehicles,
      maintenanceRecords: data.maintenanceRecords ?? prev.maintenanceRecords,
      fuelRecords: data.fuelRecords ?? prev.fuelRecords,
    }));
  }, [setState]);

  return {
    vehicles: state.vehicles,
    maintenanceRecords: state.maintenanceRecords,
    fuelRecords: state.fuelRecords,
    metrics,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenanceRecord,
    deleteMaintenanceRecord,
    addFuelRecord,
    deleteFuelRecord,
    getVehicleRecords,
    getFuelEfficiency,
    exportData,
    importData,
  };
}
