package com.rochanegra.api.user;

import jakarta.validation.constraints.NotBlank;

public record UserProfileUpdateDto(
                @NotBlank String fullName,
                @NotBlank String currency) {
}
