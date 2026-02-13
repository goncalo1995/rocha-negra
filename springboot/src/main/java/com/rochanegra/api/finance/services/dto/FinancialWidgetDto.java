package com.rochanegra.api.finance.services.dto;

import java.math.BigDecimal;
import java.util.List;

import com.rochanegra.api.finance.transactions.TransactionDto;

public record FinancialWidgetDto(
        BigDecimal totalNetWorth,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpenses,
        BigDecimal monthlySavings,
        List<TransactionDto> recentTransactions) {
}
