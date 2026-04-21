package com.rochanegra.api.modules.roadmap.dto;

import java.util.Set;
import java.util.UUID;

public record RoadmapStepCreateDto(
    String title,
    UUID parentStepId,
    String definitionOfDone,
    String prompt,
    Set<UUID> contextNodeIds
) {}
