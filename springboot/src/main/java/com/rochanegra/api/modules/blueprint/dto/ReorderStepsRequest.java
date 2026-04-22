package com.rochanegra.api.modules.blueprint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.UUID;

public record ReorderStepsRequest(
        @JsonProperty("parentId") UUID parentId,
        @JsonProperty("orderedStepIds") List<UUID> orderedStepIds) {
}