package com.rochanegra.api.modules.blueprint.dto;

import java.util.List;
import java.util.UUID;

public record AiPlanGenerateRequest(
        String goal,
        List<UUID> contextNodeIds) {
}
