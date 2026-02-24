package com.rochanegra.api.modules.nodes.dto;

import com.rochanegra.api.modules.nodes.types.NodeRole;

import jakarta.validation.constraints.NotNull;

public record MemberUpdateDto(
                @NotNull NodeRole role) {
}