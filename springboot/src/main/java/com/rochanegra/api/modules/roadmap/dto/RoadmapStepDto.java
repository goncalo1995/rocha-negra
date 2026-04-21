package com.rochanegra.api.modules.roadmap.dto;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

public record RoadmapStepDto(
    UUID id,
    UUID nodeId,
    String title,
    String status,
    UUID parentStepId,
    String definitionOfDone,
    String prompt,
    BigDecimal position,
    Set<UUID> contextNodeIds
) {}
