package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MaintenanceLogCreateDto(
        String description,
        BigDecimal cost,
        LocalDate date,
        Integer odometer) {
}