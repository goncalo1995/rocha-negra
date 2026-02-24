package com.rochanegra.api.modules.dashboard.dtos;

import java.math.BigDecimal;

public record VehiclesWidgetDto(
                int totalVehicles,
                BigDecimal yearlyCost) {
}
