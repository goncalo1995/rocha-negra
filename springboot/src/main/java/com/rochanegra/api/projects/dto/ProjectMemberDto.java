package com.rochanegra.api.projects.dto;

import java.util.UUID;

public record ProjectMemberDto(
        UUID userId,
        String role) {
}