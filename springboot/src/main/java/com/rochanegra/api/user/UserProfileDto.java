package com.rochanegra.api.user;

import java.time.Instant;
import java.util.UUID;

public record UserProfileDto(
        UUID id,
        UUID userId,
        String email,
        String fullName,
        String currency,
        Instant createdAt) {
}
