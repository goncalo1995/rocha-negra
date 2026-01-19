package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FuelLogCreateDto(
        BigDecimal quantity,
        String quantityUnit,
        BigDecimal pricePerUnit,
        BigDecimal totalCost,
        String currency,
        Integer mileageAtFill,
        Boolean fullTank,
        String station,
        String notes,
        LocalDate date,
        BigDecimal normalizedQuantityLiters,
        Double normalizedMileageKm,
        UUID assetId,
        Boolean syncToFinance) {
}