package com.rochanegra.api.modules.nodes.dto;

import java.util.List;

public record GraphDto(
                List<GraphNodeDto> nodes,
                List<GraphEdgeDto> edges) {
}
