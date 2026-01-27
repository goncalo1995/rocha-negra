package com.rochanegra.api.finance.assets;

import java.util.Map;

public record AssetUpdateDto(
        String name,
        String institution,
        String description,
        Map<String, Object> customFields) {
}
