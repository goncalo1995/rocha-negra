package com.rochanegra.api.modules.nodes.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.rochanegra.api.modules.nodes.types.NodeStatus;

public record NodeUpdateDto(
        String name,
        String description,
        String content,
        String url,
        String storagePath,
        NodeStatus status,
        LocalDate dueDate,
        UUID parentId,
        String desiredOutcome,
        String mainRisk,
        Boolean isAiEnabled) {
}