package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FuelLogDto(
        UUID id,
        UUID vehicleId,
        BigDecimal quantity,
        String quantityUnit,
        BigDecimal pricePerUnit, // <-- This is a calculated field
        BigDecimal totalCost,
        String currency,
        Double mileageAtFill,
        Boolean fullTank,
        String station,
        String notes,
        LocalDate date,
        BigDecimal normalizedQuantityLiters,
        Double normalizedMileageKm) {
}
