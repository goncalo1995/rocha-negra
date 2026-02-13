package com.rochanegra.api.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.finance.transactions.TransactionDto;

public record TransactionsWidgetDto(
        List<TransactionDto> recent) {
}
