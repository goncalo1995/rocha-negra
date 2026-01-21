// package com.rochanegra.api.it_assets;

// import java.util.UUID;

// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.rochanegra.api.core.SanitizationService;
// import com.rochanegra.api.finance.recurring.RecurringRuleService;
// import com.rochanegra.api.finance.types.TransactionType;
// import com.rochanegra.api.finance.recurring.RecurringRuleCreateDto;
// import com.rochanegra.api.finance.recurring.RecurringRuleDto;
// import com.rochanegra.api.finance.recurring.RecurringFrequency;

// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class DomainService {

// private final DomainRepository domainRepository;
// private final DomainPriceHistoryRepository priceHistoryRepository;
// private final RecurringRuleService recurringRuleService; // From Finance
// module
// private final SanitizationService sanitizationService;

// @Transactional
// public DomainDto createDomain(DomainCreateDto createDto, UUID userId) {
// // 1. Create the Recurring Rule in the Finance module first
// RecurringRuleCreateDto ruleDto = new RecurringRuleCreateDto(
// "Domain Renewal: " + createDto.name(),
// RecurringFrequency.yearly,
// createDto.expirationDate(), // The first payment is on the expiration date
// null, // endDate
// createDto.currentPrice().negate(), // Expense
// createDto.currency(),
// TransactionType.expense,
// null, // categoryId - TODO: Find 'CAT_IT_SERVICES' system category
// null // assetId - User will link this later
// );
// RecurringRuleDto newRule = recurringRuleService.createRule(ruleDto, userId);

// // 2. Create the Domain entity, linking it to the new recurring rule
// Domain domain = new Domain();
// domain.setUserId(userId);
// domain.setRecurringGeneratorId(newRule.id());
// domain.setName(sanitizationService.sanitize(createDto.name()));
// domain.setRegistrar(sanitizationService.sanitize(createDto.registrar()));
// domain.setRegistrationDate(createDto.registrationDate());
// domain.setExpirationDate(createDto.expirationDate());
// domain.setAutoRenew(createDto.autoRenew());
// // ...
// Domain savedDomain = domainRepository.save(domain);

// // 3. Create the initial price history record
// DomainPriceHistory priceRecord = new DomainPriceHistory();
// priceRecord.setDomainId(savedDomain.getId());
// priceRecord.setUserId(userId);
// priceRecord.setPrice(createDto.currentPrice());
// priceRecord.setCurrency(createDto.currency());
// priceRecord.setEffectiveDate(createDto.registrationDate());
// priceHistoryRepository.save(priceRecord);

// // 4. Return the complete DTO
// // The toDto method needs to combine Domain + its price history
// return toDto(savedDomain, List.of(priceRecord));
// }

// // ... other methods for GET, UPDATE, DELETE ...
// }