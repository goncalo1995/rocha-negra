package com.rochanegra.api.finance.projections;

import java.math.BigDecimal;

public record ProjectionMonthDto(
        String month, // e.g., "2026-01-01"
        BigDecimal projectedIncome,
        BigDecimal projectedExpenses,
        BigDecimal projectedBalance,
        BigDecimal cumulativeBalance) {
}
