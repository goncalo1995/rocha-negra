package com.rochanegra.api.common.exception;

import java.time.Instant;

public record ErrorResponse(
                int status,
                String message,
                String path,
                Instant timestamp) {
}
