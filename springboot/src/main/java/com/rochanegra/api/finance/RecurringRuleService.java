package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecurringRuleService {

    private final RecurringRuleRepository recurringRuleRepository;

    public RecurringRuleDto createRecurringRule(RecurringRuleCreateDto createDto, UUID userId) {
        RecurringRule rule = new RecurringRule();
        rule.setUserId(userId);
        rule.setDescription(createDto.description());
        rule.setProjectedAmount(createDto.projectedAmount());
        rule.setFrequency(createDto.frequency());
        rule.setNextDueDate(createDto.nextDueDate());
        rule.setCategoryId(createDto.categoryId());
        rule.setAssetId(createDto.assetId());
        rule.setActive(true);

        RecurringRule savedRule = recurringRuleRepository.save(rule);
        return toDto(savedRule);
    }

    public List<RecurringRuleDto> getRulesForUser(UUID userId) {
        // We need to add findByUserId to the repository
        return recurringRuleRepository.findByUserId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private RecurringRuleDto toDto(RecurringRule rule) {
        return new RecurringRuleDto(
                rule.getId(),
                rule.getDescription(),
                rule.getProjectedAmount(),
                rule.getFrequency(),
                rule.getNextDueDate(),
                rule.isActive(),
                rule.getCategoryId(),
                rule.getAssetId());
    }
}