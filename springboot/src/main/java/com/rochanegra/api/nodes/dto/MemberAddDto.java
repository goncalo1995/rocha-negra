package com.rochanegra.api.nodes.dto;

import java.util.UUID;

import com.rochanegra.api.nodes.types.NodeRole;

import jakarta.validation.constraints.NotNull;

public record MemberAddDto(
        @NotNull UUID userId, // The ID of the user to add
        @NotNull NodeRole role) {
}