package com.rochanegra.api.dashboard.dtos;

import java.util.List;

import com.rochanegra.api.nodes.dto.NodeSummaryDto;

public record NodesWidgetDto(
        int totalActive,
        List<NodeSummaryDto> items) {
}