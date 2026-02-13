package com.rochanegra.api.dashboard.dtos;

import java.math.BigDecimal;

public record VehiclesWidgetDto(
        int totalVehicles,
        BigDecimal yearlyCost) {
}
