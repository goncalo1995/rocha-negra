package com.rochanegra.api.nodes.dto;

import com.rochanegra.api.nodes.types.NodeRole;

import jakarta.validation.constraints.NotNull;

public record MemberUpdateDto(
        @NotNull NodeRole role) {
}