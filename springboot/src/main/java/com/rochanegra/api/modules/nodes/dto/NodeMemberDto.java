package com.rochanegra.api.modules.nodes.dto;

import java.util.UUID;

public record NodeMemberDto(
                UUID userId,
                String role) {
}