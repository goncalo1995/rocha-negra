package com.rochanegra.api.modules.nodes.dto;

import java.time.Instant;

public record NodeShareStatsDto(
        int viewCount,
        Instant lastViewedAt) {
}