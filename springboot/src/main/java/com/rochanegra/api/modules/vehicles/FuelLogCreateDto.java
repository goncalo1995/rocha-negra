package com.rochanegra.api.modules.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FuelLogCreateDto(
        @NotNull BigDecimal quantity,
        @NotBlank String quantityUnit,
        BigDecimal invoiceAmount,
        @NotNull BigDecimal totalCost,
        @NotBlank String currency,
        @NotNull LocalDate date,
        @NotNull Double mileageAtFill,
        Boolean fullTank,
        String station,
        String notes,
        // --- Fields for cross-module logic ---
        @NotNull Boolean syncToFinance,
        UUID assetId // Required if syncToFinance is true
) {
}
