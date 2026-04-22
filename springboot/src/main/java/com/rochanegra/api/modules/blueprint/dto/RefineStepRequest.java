package com.rochanegra.api.modules.blueprint.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RefineStepRequest(
                @JsonProperty("refinementGoal") String refinementGoal,
                @JsonProperty("granularity") String granularity) {
}