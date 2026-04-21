package com.rochanegra.api.modules.roadmap.dto;

import java.util.UUID;

public record ProjectDetailsDto(
    UUID nodeId,
    String desiredOutcome,
    String mainRisk,
    Integer progress,
    Boolean isAiEnabled
) {}
