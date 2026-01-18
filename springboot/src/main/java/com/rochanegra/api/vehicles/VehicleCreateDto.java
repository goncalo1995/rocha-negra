package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;

// DTO for creating a new vehicle
public record VehicleCreateDto(
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
                BigDecimal insuranceYearlyCost,
                LocalDate insuranceRenewalDate,
                String notes) {
}