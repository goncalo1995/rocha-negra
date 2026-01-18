package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceLogDto(
        UUID id,
        UUID vehicleId,
        String description,
        BigDecimal cost,
        LocalDate date,
        Integer odometer) {
}
