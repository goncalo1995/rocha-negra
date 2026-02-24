package com.rochanegra.api.modules.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.modules.nodes.dto.NodeSummaryDto;

public record ProjectsWidgetDto(
        int totalActive,
        List<NodeSummaryDto> items) {
}
