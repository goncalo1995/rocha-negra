package com.rochanegra.api.modules.blueprint.dto;

import java.util.List;

public record AiPlanGenerateResponse(
        String title,
        String description,
        List<AiPlanGenerateResponse> children) {
}
