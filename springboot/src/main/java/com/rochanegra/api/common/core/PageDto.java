package com.rochanegra.api.common.core;

import java.util.List;

public record PageDto<T>(
                List<T> content,
                int pageNumber,
                int pageSize,
                long totalElements,
                int totalPages,
                boolean isLast) {
}