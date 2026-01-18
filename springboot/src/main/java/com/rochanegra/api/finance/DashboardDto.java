package com.rochanegra.api.finance;

import java.math.BigDecimal;
import java.util.List;

public record DashboardDto(
        BigDecimal totalNetWorth,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpenses,
        BigDecimal monthlySavings,
        List<TransactionDto> recentTransactions) {
}
