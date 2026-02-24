package com.rochanegra.api.modules.user;

import jakarta.validation.constraints.NotBlank;

public record UserProfileUpdateDto(
                @NotBlank String fullName) {
}
