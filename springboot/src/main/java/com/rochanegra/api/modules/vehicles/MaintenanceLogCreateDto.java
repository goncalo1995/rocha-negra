package com.rochanegra.api.modules.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MaintenanceLogCreateDto(
                @NotBlank String type,
                String description,
                @NotNull BigDecimal cost,
                @NotNull String currency,
                @NotNull LocalDate date,
                Double mileageAtService,
                String serviceProvider,
                String notes,
                String attachmentUrl,
                // --- Fields for cross-module logic ---
                @NotNull Boolean syncToFinance,
                UUID assetId // Required if syncToFinance is true
) {
}