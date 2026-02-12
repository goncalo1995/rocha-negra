package com.rochanegra.api.nodes.dto;

import java.util.UUID;

public record NodeMemberDto(
        UUID userId,
        String role) {
}