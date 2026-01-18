package com.rochanegra.api.vehicles;

import java.time.Instant;
import java.util.UUID;

// DTO for returning a vehicle
public record VehicleDto(
                UUID id,
                String name,
                String make,
                String model,
                Integer year,
                String vin,
                String licensePlate,
                String fuelType,
                Double currentMileage,
                String mileageUnit,
                String fuelUnit,
                String insuranceProvider,
                String insurancePolicyNumber,
                String insuranceExpirationDate,
                java.math.BigDecimal insuranceYearlyCost,
                java.time.LocalDate insuranceRenewalDate,
                String notes,
                Instant createdAt) {
}