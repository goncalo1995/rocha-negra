package com.rochanegra.api.finance.dashboard;

import java.math.BigDecimal;
import java.util.List;

import com.rochanegra.api.finance.transactions.TransactionDto;

public record DashboardDto(
                BigDecimal totalNetWorth,
                BigDecimal monthlyIncome,
                BigDecimal monthlyExpenses,
                BigDecimal monthlySavings,
                List<TransactionDto> recentTransactions) {
}
