package com.rochanegra.api.vehicles;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FuelLogCreateDto(
        BigDecimal gallons,
        BigDecimal totalCost,
        Integer odometer,
        LocalDate date) {
}