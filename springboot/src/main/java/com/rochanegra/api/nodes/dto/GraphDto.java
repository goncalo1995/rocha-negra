package com.rochanegra.api.nodes.dto;

import java.util.List;

public record GraphDto(
        List<GraphNodeDto> nodes,
        List<GraphEdgeDto> edges) {
}
