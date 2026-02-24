package com.rochanegra.api.modules.domains.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DomainUpdateDto(
        @NotBlank String name,
        String registrar,
        @NotNull LocalDate registrationDate,
        @NotNull LocalDate expirationDate,
        String status,
        boolean autoRenew,
        String notes,
        // Financial details for the recurring rule
        @NotNull BigDecimal currentPrice,
        @NotNull String currency,
        UUID categoryId, // Optional: for the recurring rule
        UUID assetId // Optional: for the payment asset
) {

}
