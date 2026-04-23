package com.rochanegra.api.modules.nodes.dto;

import java.time.Instant;
import java.util.UUID;

public record NodeShareDto(
        UUID token,
        Boolean enabled,
        String url) {
}
