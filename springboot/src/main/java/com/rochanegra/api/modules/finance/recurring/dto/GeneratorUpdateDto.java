package com.rochanegra.api.modules.finance.recurring.dto;

import java.time.LocalDate;

import com.rochanegra.api.modules.finance.recurring.RecurringFrequency;

public record GeneratorUpdateDto(
                String description,
                RecurringFrequency frequency,
                Boolean isActive,
                LocalDate startDate,
                LocalDate endDate) {
}
