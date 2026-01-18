package com.rochanegra.api.exception;

import java.time.Instant;

public record ErrorResponse(
        int status,
        String message,
        String path,
        Instant timestamp) {
}
