package com.rochanegra.api.finance.recurring.dto;

import java.time.LocalDate;

import com.rochanegra.api.finance.recurring.RecurringFrequency;

public record GeneratorUpdateDto(
        String description,
        RecurringFrequency frequency,
        Boolean isActive,
        LocalDate startDate,
        LocalDate endDate) {
}
