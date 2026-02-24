package com.rochanegra.api.modules.finance.dashboard;

import java.math.BigDecimal;

import com.rochanegra.api.common.core.PageDto;
import com.rochanegra.api.modules.finance.transactions.TransactionDto;

public record DashboardDto(
                BigDecimal totalNetWorth,
                BigDecimal monthlyIncome,
                BigDecimal monthlyExpenses,
                BigDecimal monthlySavings,
                PageDto<TransactionDto> recentTransactions) {
}
