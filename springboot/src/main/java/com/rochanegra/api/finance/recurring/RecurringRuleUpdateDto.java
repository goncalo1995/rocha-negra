package com.rochanegra.api.finance.recurring;

import java.math.BigDecimal;

public record RecurringRuleUpdateDto(
        Boolean isActive,
        String description,
        BigDecimal amount,
        RecurringFrequency frequency
// LocalDate startDate,
// LocalDate endDate,
// UUID categoryId,
// UUID destinationAssetId,
// UUID assetId
) {
}
