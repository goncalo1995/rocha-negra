package com.rochanegra.api.modules.user;

import java.time.Instant;
import java.util.UUID;

public record UserProfileDto(
                UUID id,
                String email,
                String fullName,
                String avatarUrl,
                Instant createdAt) {
}
