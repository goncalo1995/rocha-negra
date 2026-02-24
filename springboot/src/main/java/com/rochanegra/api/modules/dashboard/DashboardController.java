package com.rochanegra.api.modules.dashboard;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rochanegra.api.modules.dashboard.dtos.DashboardResponseDto;
import com.rochanegra.api.modules.dashboard.dtos.WidgetPreferenceDto;
import com.rochanegra.api.modules.preferences.UserPreferencesService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserPreferencesService preferencesService;

    @GetMapping
    public DashboardResponseDto getDashboard(
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        return dashboardService.getDashboard(userId);
    }

    @GetMapping("/widgets")
    public List<WidgetPreferenceDto> getWidgets(
            Authentication authentication) {

        UUID userId = UUID.fromString(authentication.getName());

        return preferencesService.getDashboardWidgets(userId);
    }

    @PutMapping("/widgets")
    public void updateWidgets(
            Authentication authentication,
            @RequestBody List<WidgetPreferenceDto> widgets) {

        UUID userId = UUID.fromString(authentication.getName());

        preferencesService.saveDashboardWidgets(userId, widgets);
    }
}
