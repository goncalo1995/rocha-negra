package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

// DTO for creating a new vehicle
public record VehicleCreateDto(
                String name,
                BigDecimal initialValue, // The market value of the car when adding it
                String currency,
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
                BigDecimal insuranceYearlyCost,
                LocalDate insuranceRenewalDate,
                String notes,
                UUID assetId) {
}