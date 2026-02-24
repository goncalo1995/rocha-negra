package com.rochanegra.api.modules.dashboard.dtos;

public record DashboardResponseDto(
                FinancialWidgetDto financial,
                TasksWidgetDto tasks,
                ProjectsWidgetDto projects,
                TransactionsWidgetDto transactions,
                ItWidgetDto it,
                VehiclesWidgetDto vehicles,
                NetworkWidgetDto network,
                DebtsWidgetDto debts) {

        public static DashboardResponseDto empty() {
                return new DashboardResponseDto(
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null,
                                null);
        }
}