package com.rochanegra.api.projects.dto;

import jakarta.validation.constraints.NotNull;
import com.rochanegra.api.projects.types.ProjectRole;

public record MemberUpdateDto(
        @NotNull ProjectRole role) {
}