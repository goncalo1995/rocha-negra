package com.rochanegra.api.projects.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import com.rochanegra.api.projects.types.ProjectRole;

public record MemberAddDto(
        @NotNull UUID userId, // The ID of the user to add
        @NotNull ProjectRole role) {
}