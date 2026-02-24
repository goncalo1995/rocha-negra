package com.rochanegra.api.modules.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.modules.finance.transactions.TransactionDto;

public record TransactionsWidgetDto(
        List<TransactionDto> recent) {
}
