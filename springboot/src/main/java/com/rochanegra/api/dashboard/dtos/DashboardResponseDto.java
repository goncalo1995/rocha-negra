package com.rochanegra.api.dashboard.dtos;

import com.rochanegra.api.finance.services.dto.FinancialWidgetDto;

public record DashboardResponseDto(
        FinancialWidgetDto financial,
        TasksWidgetDto tasks,
        NodesWidgetDto nodes,
        TransactionsWidgetDto transactions,
        ItWidgetDto it,
        VehiclesWidgetDto vehicles,
        NetworkWidgetDto network,
        DebtsWidgetDto debts) {
}