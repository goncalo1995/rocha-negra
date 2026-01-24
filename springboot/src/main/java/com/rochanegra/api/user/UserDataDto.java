package com.rochanegra.api.user;

import java.util.Map;

public record UserDataDto(
        UserProfileDto profile,
        Map<String, Object> preferences) {
}
