package com.rochanegra.api.dashboard;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.rochanegra.api.dashboard.dtos.DashboardResponseDto;
import com.rochanegra.api.dashboard.dtos.WidgetPreferenceDto;
import com.rochanegra.api.finance.FinanceService;
import com.rochanegra.api.it_assets.domains.DomainService;
import com.rochanegra.api.network.ContactService;
import com.rochanegra.api.nodes.NodeService;
import com.rochanegra.api.preferences.UserPreferencesService;
import com.rochanegra.api.tasks.TaskService;
import com.rochanegra.api.vehicles.VehicleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService {

    private final UserPreferencesService preferencesService;
    private final FinanceService financeService;
    private final TaskService taskService;
    private final NodeService nodeService;
    private final DomainService domainService;
    private final VehicleService vehicleService;
    private final ContactService contactService;

    public DashboardResponseDto getDashboard(UUID userId) {

        List<WidgetPreferenceDto> widgets = preferencesService.getDashboardWidgets(userId);

        log.info("Fetching dashboard data for user: {}", userId);

        // Check if userId is null
        if (userId == null) {
            log.error("UserId is null!");
            return DashboardResponseDto.empty();
        }

        boolean financial = isEnabled(widgets, "financial");
        boolean tasks = isEnabled(widgets, "tasks");
        boolean nodes = isEnabled(widgets, "projects");
        boolean transactions = isEnabled(widgets, "transactions");
        boolean it = isEnabled(widgets, "it");
        boolean vehicles = isEnabled(widgets, "vehicles");
        boolean network = isEnabled(widgets, "network");
        boolean debts = isEnabled(widgets, "debts");

        return new DashboardResponseDto(
                financial ? financeService.getFinancialWidget(userId) : null,
                tasks ? taskService.getTasksWidget(userId) : null,
                nodes ? nodeService.getNodesWidget(userId) : null,
                transactions ? financeService.getTransactionsWidget(userId) : null,
                it ? domainService.getItWidget(userId) : null,
                vehicles ? vehicleService.getVehiclesWidget(userId) : null,
                network ? contactService.getNetworkWidget(userId) : null,
                debts ? financeService.getDebtsWidget(userId) : null);
    }

    private boolean isEnabled(List<WidgetPreferenceDto> widgets, String key) {
        return widgets.stream()
                .anyMatch(w -> w.key().equals(key) && w.enabled());
    }
}
