import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Vehicle, MaintenanceRecord, FuelRecord, VehicleMetrics } from '@/types/vehicles';
import { useMemo, useCallback } from 'react';

export function useVehicles() {
  const queryClient = useQueryClient();

  // Queries
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await api.get<Vehicle[]>('/vehicles');
      return response.data.map(v => ({
        ...v,
        currentMileage: v.currentMileage ?? 0,
        mileageUnit: v.mileageUnit ?? 'km',
      }));
    },
  });

  const { data: maintenanceRecordsRaw = [] } = useQuery({
    queryKey: ['maintenance-logs'],
    queryFn: async () => {
      const response = await api.get<MaintenanceRecord[]>('/vehicles/maintenance');
      return response.data;
    },
  });

  const { data: fuelRecordsRaw = [] } = useQuery({
    queryKey: ['fuel-logs'],
    queryFn: async () => {
      const response = await api.get<FuelRecord[]>('/vehicles/fuel');
      return response.data;
    },
  });

  const maintenanceRecords = useMemo(() => maintenanceRecordsRaw, [maintenanceRecordsRaw]);
  const fuelRecords = useMemo(() => fuelRecordsRaw, [fuelRecordsRaw]);

  // Vehicle Mutations
  const addVehicleMutation = useMutation({
    mutationFn: (vehicle: any) => api.post('/vehicles', vehicle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const updateVehicleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Vehicle> }) => api.patch(`/vehicles/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  // Maintenance Mutations
  const addMaintenanceRecordMutation = useMutation({
    mutationFn: ({ vehicleId, record }: { vehicleId: string; record: any }) =>
      api.post(`/vehicles/${vehicleId}/maintenance`, record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const updateMaintenanceRecordMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      api.patch(`/vehicles/maintenance/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteMaintenanceRecordMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/maintenance/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Fuel Mutations
  const addFuelRecordMutation = useMutation({
    mutationFn: ({ vehicleId, record }: { vehicleId: string; record: any }) =>
      api.post(`/vehicles/${vehicleId}/fuel`, record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const updateFuelRecordMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      api.patch(`/vehicles/fuel/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const deleteFuelRecordMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/vehicles/fuel/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Metrics
  const metrics = useMemo((): VehicleMetrics => {
    return {
      totalVehicles: vehicles.length,
      totalMaintenanceCostThisYear: maintenanceRecords.reduce((acc, r) => acc + (r.cost || 0), 0),
      totalFuelCostThisYear: fuelRecords.reduce((acc, r) => acc + (r.totalCost || 0), 0),
      upcomingInsurance: null,
      averageFuelEfficiency: null,
    };
  }, [vehicles, maintenanceRecords, fuelRecords]);

  // Callbacks
  const addVehicle = useCallback(async (v: any) => addVehicleMutation.mutateAsync(v), [addVehicleMutation]);
  const updateVehicle = useCallback(async (id: string, updates: any) => updateVehicleMutation.mutateAsync({ id, updates }), [updateVehicleMutation]);
  const deleteVehicle = useCallback(async (id: string) => deleteVehicleMutation.mutateAsync(id), [deleteVehicleMutation]);

  const addMaintenanceRecord = useCallback(async (record: any) => {
    const { vehicleId, ...rest } = record;
    return addMaintenanceRecordMutation.mutateAsync({ vehicleId, record: rest });
  }, [addMaintenanceRecordMutation]);

  const updateMaintenanceRecord = useCallback(async (id: string, updates: any) => {
    return updateMaintenanceRecordMutation.mutateAsync({ id, updates });
  }, [updateMaintenanceRecordMutation]);

  const deleteMaintenanceRecord = useCallback(async (id: string) => {
    return deleteMaintenanceRecordMutation.mutateAsync(id);
  }, [deleteMaintenanceRecordMutation]);

  const addFuelRecord = useCallback(async (record: any) => {
    const { vehicleId, ...rest } = record;
    return addFuelRecordMutation.mutateAsync({ vehicleId, record: rest });
  }, [addFuelRecordMutation]);

  const updateFuelRecord = useCallback(async (id: string, updates: any) => {
    return updateFuelRecordMutation.mutateAsync({ id, updates });
  }, [updateFuelRecordMutation]);

  const deleteFuelRecord = useCallback(async (id: string) => {
    return deleteFuelRecordMutation.mutateAsync(id);
  }, [deleteFuelRecordMutation]);

  const getVehicleRecords = useCallback((id: string) => ({
    maintenance: maintenanceRecords.filter(r => r.vehicleId === id),
    fuel: fuelRecords.filter(r => r.vehicleId === id),
  }), [maintenanceRecords, fuelRecords]);

  const getFuelEfficiency = useCallback((id: string) => null, []);

  const exportData = useCallback(() => {
    return {
      vehicles,
      maintenanceRecords,
      fuelRecords,
    };
  }, [vehicles, maintenanceRecords, fuelRecords]);

  const importData = useCallback(async (data: any) => {
    if (data.vehicles) {
      for (const v of data.vehicles) {
        if (!vehicles.find(existing => existing.vin === v.vin || existing.licensePlate === v.licensePlate)) {
          await addVehicle(v);
        }
      }
    }
    // Note: Maintenance and fuel records import would need vehicle IDs to match.
    // This is more complex since IDs change on the backend.
    // For now, we mainly focus on restoring the vehicles.
  }, [vehicles, addVehicle]);

  return {
    vehicles,
    maintenanceRecords,
    fuelRecords,
    metrics,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    getVehicleRecords,
    getFuelEfficiency,
    exportData,
    importData,
  };
}

export function useVehicleDetails(vehicleId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: maintenanceRecords = [], isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ['maintenance-logs', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const response = await api.get<MaintenanceRecord[]>(`/vehicles/${vehicleId}/maintenance`);
      return response.data;
    },
    enabled: !!vehicleId,
  });

  const { data: fuelRecords = [], isLoading: isLoadingFuel } = useQuery({
    queryKey: ['fuel-logs', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const response = await api.get<FuelRecord[]>(`/vehicles/${vehicleId}/fuel`);
      return response.data;
    },
    enabled: !!vehicleId,
  });

  const { data: vehicle } = useQuery({
    queryKey: ['vehicles', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return null;
      const response = await api.get<Vehicle>(`/vehicles/${vehicleId}`);
      return response.data;
    },
    enabled: !!vehicleId,
  });

  return {
    vehicle,
    maintenanceRecords,
    fuelRecords,
    isLoading: isLoadingMaintenance || isLoadingFuel,
  };
}
