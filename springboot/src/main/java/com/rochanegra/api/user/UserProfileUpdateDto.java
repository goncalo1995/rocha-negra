package com.rochanegra.api.user;

public record UserProfileUpdateDto(
        String fullName,
        String currency) {
}
