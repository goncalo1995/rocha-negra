package com.rochanegra.api.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rochanegra.api.dashboard.dtos.DashboardResponseDto;
import com.rochanegra.api.dashboard.dtos.WidgetPreferenceDto;
import com.rochanegra.api.preferences.UserPreferencesService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    // private final DashboardService dashboardService;
    private final UserPreferencesService preferencesService;

    // @GetMapping
    // public DashboardResponseDto getDashboard(
    // @AuthenticationPrincipal UUID userId) {

    // return dashboardService.getDashboard(userId);
    // }

    // @GetMapping("/widgets")
    // public List<WidgetPreferenceDto> getWidgets(
    // @AuthenticationPrincipal UUID userId) {

    // return preferencesService.getDashboardWidgets(userId);
    // }

    @PutMapping("/widgets")
    public void updateWidgets(
            @AuthenticationPrincipal UUID userId,
            @RequestBody List<WidgetPreferenceDto> widgets) {

        preferencesService.saveDashboardWidgets(userId, widgets);
    }
}
