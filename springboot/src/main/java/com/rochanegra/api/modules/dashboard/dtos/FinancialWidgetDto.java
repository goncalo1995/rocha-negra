package com.rochanegra.api.modules.dashboard.dtos;

import java.math.BigDecimal;

public record FinancialWidgetDto(
                BigDecimal totalNetWorth,
                BigDecimal monthlyIncome,
                BigDecimal monthlyExpenses,
                BigDecimal monthlySavings) {
}
