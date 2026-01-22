package com.rochanegra.api.it_assets.domains;

// ... (all necessary imports from other modules)
import com.rochanegra.api.finance.recurring.RecurringRuleService;
import com.rochanegra.api.finance.recurring.RecurringRuleCreateDto;
import com.rochanegra.api.finance.recurring.RecurringRuleDto;
import com.rochanegra.api.core.SanitizationService;
import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.recurring.RecurringFrequency;
import com.rochanegra.api.finance.recurring.RecurringGeneratorRepository;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.it_assets.domains.dto.DomainCreateDto;
import com.rochanegra.api.it_assets.domains.dto.DomainUpdateDto;
import com.rochanegra.api.it_assets.domains.dto.PriceHistoryDto;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.HashMap;
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
    private final RecurringGeneratorRepository recurringGeneratorRepository;
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
        // --- Step 1: Create the Domain entity
        Domain domain = new Domain();
        domain.setUserId(userId);
        domain.setName(sanitizationService.sanitize(createDto.name()));
        domain.setRegistrar(sanitizationService.sanitize(createDto.registrar()));
        domain.setRegistrationDate(createDto.registrationDate());
        domain.setExpirationDate(createDto.expirationDate());
        domain.setAutoRenew(createDto.autoRenew());
        domain.setNotes(sanitizationService.sanitize(createDto.notes()));
        Domain savedDomain = domainRepository.save(domain);

        // --- Step 2: Create the Recurring Rule, linking it to the new Domain ID ---
        if (createDto.autoRenew() && createDto.currentPrice() != null && createDto.currency() != null) {
            // Create the custom fields map for linking
            Map<String, Object> linkData = new HashMap<>();
            linkData.put("linked_entity_type", "domain");
            linkData.put("linked_entity_id", savedDomain.getId().toString()); // Use the ID we just generated

            RecurringRuleCreateDto ruleDto = new RecurringRuleCreateDto(
                    "Domain Renewal: " + createDto.name(),
                    RecurringFrequency.yearly,
                    createDto.expirationDate(),
                    null, // endDate
                    createDto.currentPrice().negate(),
                    createDto.currency(),
                    TransactionType.expense,
                    createDto.categoryId(),
                    null, // destinationAssetId
                    createDto.assetId(),
                    linkData // Pass the map with the link
            );
            recurringRuleService.createRule(ruleDto, userId);
        }

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

    public void deleteDomain(UUID domainId, UUID userId) {
        // 1. Verify ownership
        Domain domain = domainRepository.findById(domainId)
                .filter(d -> d.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found"));

        // 2. Find the associated recurring rule
        // We create a new repository method for this.
        recurringGeneratorRepository.findByCustomField("linked_entity_id", domainId.toString())
                .ifPresent(generator -> {
                    // 3. If a rule is found, delete it. This will cascade to its templates.
                    recurringRuleService.deleteRule(generator.getId(), userId);
                });

        // 4. Delete the domain itself. This will cascade to its price history.
        domainRepository.delete(domain);
    }

    public DomainDto updateDomain(UUID id, DomainUpdateDto updateDto) {
        Domain domain = domainRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Domain not found"));
        domain.setName(updateDto.name());
        domain.setRegistrar(updateDto.registrar());
        domain.setRegistrationDate(updateDto.registrationDate());
        domain.setExpirationDate(updateDto.expirationDate());
        domain.setStatus(updateDto.status());
        domain.setAutoRenew(updateDto.autoRenew());
        domain.setNotes(updateDto.notes());
        Domain savedDomain = domainRepository.save(domain);
        return toDto(savedDomain, List.of());
    }

    @Transactional
    public List<DomainDto> createDomainsInBulk(List<DomainCreateDto> createDtos, UUID userId) {
        // Use a stream to call the single createDomain method for each item in the list
        return createDtos.stream()
                .map(dto -> createDomain(dto, userId))
                .collect(Collectors.toList());
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
                domain.getName(),
                domain.getRegistrar(),
                domain.getRegistrationDate(),
                domain.getExpirationDate(),
                domain.getStatus(),
                domain.isAutoRenew(),
                domain.getNotes(),
                currentPrice,
                currency,
                historyDtos);
    }
}
