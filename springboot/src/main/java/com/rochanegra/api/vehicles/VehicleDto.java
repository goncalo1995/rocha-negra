package com.rochanegra.api.vehicles;

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
}