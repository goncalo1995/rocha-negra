package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FuelLogDto(
        UUID id,
        UUID vehicleId,
        BigDecimal gallons,
        BigDecimal totalCost,
        Integer odometer,
        LocalDate date) {
}
