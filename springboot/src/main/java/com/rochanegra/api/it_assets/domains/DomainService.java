package com.rochanegra.api.it_assets.domains;

// ... (all necessary imports from other modules)
import com.rochanegra.api.finance.recurring.RecurringRuleService;
import com.rochanegra.api.finance.recurring.RecurringRuleCreateDto;
import com.rochanegra.api.finance.recurring.RecurringRuleDto;
import com.rochanegra.api.core.SanitizationService;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.recurring.RecurringFrequency;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.it_assets.domains.dto.DomainCreateDto;
import com.rochanegra.api.it_assets.domains.dto.PriceHistoryDto;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DomainService {

    private final DomainRepository domainRepository;
    private final DomainPriceHistoryRepository priceHistoryRepository;
    private final RecurringRuleService recurringRuleService; // <-- The key integration
    private final SanitizationService sanitizationService;

    @Transactional(readOnly = true) // Use readOnly for GET methods for a performance boost
    public List<DomainDto> getAllDomains(UUID userId) {
        // 1. Fetch all domains for the user in one query.
        List<Domain> domains = domainRepository.findByUserId(userId);
        if (domains.isEmpty()) {
            return List.of();
        }

        // 2. Get a list of all domain IDs.
        List<UUID> domainIds = domains.stream().map(Domain::getId).collect(Collectors.toList());

        // 3. Fetch all price histories for ALL those domains in a single second query.
        List<DomainPriceHistory> allHistories = priceHistoryRepository
                .findByDomainIdInOrderByEffectiveDateDesc(domainIds);

        // 4. Group the histories by domain ID for efficient lookup.
        Map<UUID, List<DomainPriceHistory>> historiesByDomainId = allHistories.stream()
                .collect(Collectors.groupingBy(DomainPriceHistory::getDomainId));

        // 5. Build the DTOs in memory (no more database calls).
        return domains.stream().map(domain -> {
            // Get the pre-fetched history for this specific domain.
            List<DomainPriceHistory> history = historiesByDomainId.getOrDefault(domain.getId(), List.of());
            return toDto(domain, history);
        }).collect(Collectors.toList());
    }

    @Transactional
    public DomainDto getDomainById(UUID id, UUID userId) {
        Domain domain = domainRepository.findById(id)
                .filter(d -> d.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found"));
        List<DomainPriceHistory> priceHistories = priceHistoryRepository
                .findByDomainIdInOrderByEffectiveDateDesc(List.of(id));
        return toDto(domain, priceHistories);
    }

    @Transactional
    public DomainDto createDomain(DomainCreateDto createDto, UUID userId) {
        // --- Step 1: Create the Recurring Rule in the Finance module ---
        RecurringRuleCreateDto ruleDto = new RecurringRuleCreateDto(
                "Domain Renewal: " + createDto.name(),
                RecurringFrequency.yearly,
                createDto.expirationDate(), // The first payment is on the expiration date
                null, // endDate
                createDto.currentPrice().negate(), // Expense is negative
                createDto.currency(),
                TransactionType.expense,
                createDto.categoryId(),
                null, // destinationAssetId
                createDto.assetId());
        // This is the call to your existing, robust service!
        RecurringRuleDto newRule = recurringRuleService.createRule(ruleDto, userId);

        // --- Step 2: Create the Domain entity, linking it to the new recurring rule
        // ---
        Domain domain = new Domain();
        domain.setUserId(userId);
        domain.setRecurringGeneratorId(newRule.id());
        domain.setName(sanitizationService.sanitize(createDto.name()));
        domain.setRegistrar(sanitizationService.sanitize(createDto.registrar()));
        domain.setRegistrationDate(createDto.registrationDate());
        domain.setExpirationDate(createDto.expirationDate());
        domain.setAutoRenew(createDto.autoRenew());
        domain.setNotes(sanitizationService.sanitize(createDto.notes()));
        Domain savedDomain = domainRepository.save(domain);

        // --- Step 3: Create the initial price history record ---
        DomainPriceHistory priceRecord = new DomainPriceHistory();
        priceRecord.setDomainId(savedDomain.getId());
        priceRecord.setUserId(userId);
        priceRecord.setPrice(createDto.currentPrice());
        priceRecord.setCurrency(createDto.currency());
        priceRecord.setEffectiveDate(createDto.registrationDate()); // Price is effective from purchase
        priceHistoryRepository.save(priceRecord);

        // --- Step 4: Construct and return the complete DTO ---
        return toDto(savedDomain, List.of(priceRecord));
    }

    public void deleteDomain(UUID id, UUID userId) {
        // 1. Fetches and validates ownership. Perfect.
        Domain domain = domainRepository.findById(id)
                .filter(d -> d.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found"));

        // 2. Explicitly deletes the associated recurring rule. This is good!
        if (domain.getRecurringGeneratorId() != null) {
            recurringRuleService.deleteRule(domain.getRecurringGeneratorId(), userId);
        }

        // 3. Deletes the domain itself. This also cascades to delete price history.
        // Correct.
        domainRepository.delete(domain);
    }

    private DomainDto toDto(Domain domain, List<DomainPriceHistory> history) {
        // Gracefully handle the case where there is no price history yet.
        BigDecimal currentPrice = history.isEmpty() ? BigDecimal.ZERO : history.get(0).getPrice();
        String currency = history.isEmpty() ? "EUR" : history.get(0).getCurrency(); // Provide a default currency

        // Map the list of entities to a list of DTOs
        List<PriceHistoryDto> historyDtos = history.stream()
                .map(h -> new PriceHistoryDto(h.getPrice(), h.getCurrency(), h.getEffectiveDate()))
                .collect(Collectors.toList());

        return new DomainDto(
                domain.getId(),
                domain.getRecurringGeneratorId(),
                domain.getName(),
                domain.getRegistrar(),
                domain.getRegistrationDate(),
                domain.getExpirationDate(),
                domain.isAutoRenew(),
                domain.getNotes(),
                currentPrice,
                currency,
                historyDtos);
    }
}