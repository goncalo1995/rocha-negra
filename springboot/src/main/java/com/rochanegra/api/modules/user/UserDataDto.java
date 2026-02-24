package com.rochanegra.api.modules.user;

import java.util.Map;

public record UserDataDto(
                UserProfileDto profile,
                Map<String, Object> preferences) {
}
