package com.rochanegra.api.user;

import java.time.Instant;
import java.util.UUID;

public record UserProfileDto(
        UUID id,
        String email,
        String fullName,
        String avatarUrl,
        Instant createdAt) {
}
