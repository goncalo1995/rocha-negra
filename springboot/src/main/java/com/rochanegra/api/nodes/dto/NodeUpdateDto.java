package com.rochanegra.api.nodes.dto;

import java.time.LocalDate;

import com.rochanegra.api.nodes.types.NodeStatus;

public record NodeUpdateDto(
        String name,
        String description,
        String content,
        String url,
        String storagePath,
        NodeStatus status,
        LocalDate dueDate) {
}