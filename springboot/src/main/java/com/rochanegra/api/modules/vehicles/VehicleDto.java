package com.rochanegra.api.modules.vehicles;

import java.time.Instant;
import java.util.UUID;

// DTO for returning a vehicle
public record VehicleDto(
                UUID id,
                UUID assetId,
                String name,
                String make,
                String model,
                Integer year,
                String vin,
                String licensePlate,
                Double currentMileage,
                String mileageUnit,
                String fuelType,
                String fuelUnit,
                String insuranceProvider,
                String insurancePolicyNumber,
                String notes,
                Instant createdAt,
                Instant updatedAt) {
        public static VehicleDto fromVehicle(Vehicle vehicle) {
                return new VehicleDto(
                                vehicle.getId(),
                                vehicle.getAssetId(),
                                vehicle.getName(),
                                vehicle.getMake(),
                                vehicle.getModel(),
                                vehicle.getYear(),
                                vehicle.getVin(),
                                vehicle.getLicensePlate(),
                                vehicle.getCurrentMileage(),
                                vehicle.getMileageUnit(),
                                vehicle.getFuelType(),
                                vehicle.getFuelUnit(),
                                vehicle.getInsuranceProvider(),
                                vehicle.getInsurancePolicyNumber(),
                                vehicle.getNotes(),
                                vehicle.getCreatedAt(),
                                vehicle.getUpdatedAt());
        }
}