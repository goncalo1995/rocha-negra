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

    public RecurringRuleDto getRecurringRule(UUID id) {
        RecurringRule rule = recurringRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));
        return toDto(rule);
    }

    public RecurringRuleDto updateRecurringRule(UUID id, RecurringRuleCreateDto updateDto) {
        RecurringRule rule = recurringRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        if (updateDto.description() != null)
            rule.setDescription(updateDto.description());
        if (updateDto.projectedAmount() != null)
            rule.setProjectedAmount(updateDto.projectedAmount());
        if (updateDto.frequency() != null)
            rule.setFrequency(updateDto.frequency());
        if (updateDto.nextDueDate() != null)
            rule.setNextDueDate(updateDto.nextDueDate());
        if (updateDto.categoryId() != null)
            rule.setCategoryId(updateDto.categoryId());
        if (updateDto.assetId() != null)
            rule.setAssetId(updateDto.assetId());
        // Handling 'active' status might require separate endpoint or DTO field,
        // assuming default true or separate logic.
        // If CreateDto has active field? It doesn't seem so. Typically PATCH is for
        // content. DELETE for deactivation or removal.

        RecurringRule savedRule = recurringRuleRepository.save(rule);
        return toDto(savedRule);
    }

    public void deleteRecurringRule(UUID id) {
        recurringRuleRepository.deleteById(id);
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