package com.rochanegra.api.vehicles;

// DTO for creating a new vehicle
public record VehicleCreateDto(
    String name,
    String make,
    String model,
    Integer year,
    String vin,
    String licensePlate
) {}