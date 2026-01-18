package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceLogDto(
                UUID id,
                UUID vehicleId,
                String type,
                String description,
                Integer mileageAtService,
                BigDecimal cost,
                String currency,
                String serviceProvider,
                String notes,
                LocalDate date) {
}
