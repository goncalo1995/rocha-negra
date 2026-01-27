package com.rochanegra.api.finance.dashboard;

import java.math.BigDecimal;

import com.rochanegra.api.core.PageDto;
import com.rochanegra.api.finance.transactions.TransactionDto;

public record DashboardDto(
                BigDecimal totalNetWorth,
                BigDecimal monthlyIncome,
                BigDecimal monthlyExpenses,
                BigDecimal monthlySavings,
                PageDto<TransactionDto> recentTransactions) {
}
