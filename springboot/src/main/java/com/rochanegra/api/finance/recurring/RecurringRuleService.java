package com.rochanegra.api.finance.recurring;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.recurring.dto.GeneratorUpdateDto;
import com.rochanegra.api.finance.recurring.dto.TemplateCreateDto;

@Service
@RequiredArgsConstructor
public class RecurringRuleService {

    private final RecurringGeneratorRepository generatorRepository;
    private final TransactionTemplateRepository templateRepository;

    public RecurringRuleDto createRule(RecurringRuleCreateDto createDto, UUID userId) {
        // Step 1: Create and save the Generator
        RecurringGenerator generator = new RecurringGenerator();
        generator.setUserId(userId);
        generator.setDescription(createDto.description());
        generator.setFrequency(createDto.frequency());
        generator.setStartDate(createDto.startDate());
        generator.setEndDate(createDto.endDate());
        generator.setNextDueDate(createDto.startDate()); // Initial due date is the start date
        generator.setActive(true);
        RecurringGenerator savedGenerator = generatorRepository.save(generator);

        // Step 2: Create and save the initial Template, linking it to the new Generator
        TransactionTemplate template = new TransactionTemplate();
        template.setGeneratorId(savedGenerator.getId());
        template.setUserId(userId);
        template.setAmount(createDto.amount());
        template.setCurrency(createDto.currency());
        template.setType(createDto.type());
        template.setCategoryId(createDto.categoryId());
        template.setAssetId(createDto.assetId());
        template.setEffectiveFromDate(createDto.startDate()); // Template is effective immediately
        TransactionTemplate savedTemplate = templateRepository.save(template);

        // Step 3: Return a DTO representing the newly created rule
        // (You would build a method to convert the generator + its active template into
        // a view DTO)
        return toDto(savedGenerator, savedTemplate);
    }

    /**
     * Gets all rules for a user. For each rule, it finds the currently active
     * financial template to display the correct amount.
     */
    public List<RecurringRuleDto> getRulesForUser(UUID userId) {
        List<RecurringGenerator> generators = generatorRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();

        return generators.stream().map(generator -> {
            // For each generator, we must find its currently active template
            TransactionTemplate relevantTemplate = templateRepository
                    .findRelevantTemplateForGenerator(generator.getId(), today)
                    .orElse(null);
            return toDto(generator, relevantTemplate);
        }).collect(Collectors.toList());
    }

    /**
     * Gets a single rule by its ID, including its active template.
     */
    public RecurringRuleDto getRuleById(UUID ruleId, UUID userId) {
        RecurringGenerator generator = generatorRepository.findById(ruleId)
                .filter(g -> g.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Recurring rule not found"));

        TransactionTemplate relevantTemplate = templateRepository
                .findRelevantTemplateForGenerator(generator.getId(), LocalDate.now())
                .orElse(null);

        return toDto(generator, relevantTemplate);
    }

    /**
     * Deletes a generator and all its associated templates (due to CASCADE DELETE).
     */
    @Transactional
    public void deleteRule(UUID ruleId, UUID userId) {
        RecurringGenerator generator = generatorRepository.findById(ruleId)
                .filter(g -> g.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Recurring rule not found"));

        generatorRepository.delete(generator);
    }

    @Transactional
    public RecurringRuleDto updateGeneratorDetails(UUID generatorId, GeneratorUpdateDto updateDto, UUID userId) {
        RecurringGenerator generator = generatorRepository.findByIdAndUserId(generatorId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Generator not found"));

        // Update only the generator's own fields
        if (updateDto.description() != null)
            generator.setDescription(updateDto.description());
        if (updateDto.frequency() != null)
            generator.setFrequency(updateDto.frequency());
        if (updateDto.isActive() != null)
            generator.setActive(updateDto.isActive());
        if (updateDto.startDate() != null)
            generator.setStartDate(updateDto.startDate());
        if (updateDto.endDate() != null)
            generator.setEndDate(updateDto.endDate());

        RecurringGenerator savedGenerator = generatorRepository.save(generator);
        return toDto(savedGenerator,
                templateRepository.findRelevantTemplateForGenerator(generatorId, LocalDate.now()).orElse(null));
    }

    @Transactional
    public RecurringRuleDto addNewTemplate(UUID generatorId, TemplateCreateDto templateDto, UUID userId) {
        RecurringGenerator generator = generatorRepository.findByIdAndUserId(generatorId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Generator not found"));

        // Create a NEW template, linked to the existing generator
        TransactionTemplate newTemplate = new TransactionTemplate();
        newTemplate.setGeneratorId(generator.getId());
        newTemplate.setUserId(userId);
        newTemplate.setAmount(templateDto.amount());
        newTemplate.setCurrency(templateDto.currency());
        newTemplate.setEffectiveFromDate(templateDto.effectiveFromDate());
        newTemplate.setCategoryId(templateDto.categoryId());
        newTemplate.setAssetId(templateDto.assetId());
        newTemplate.setType(templateDto.type());

        TransactionTemplate savedTemplate = templateRepository.save(newTemplate);
        return toDto(generator, savedTemplate);
    }
    // --- HELPER METHODS ---

    /**
     * Converts a Generator and its corresponding Template into a single DTO for the
     * frontend.
     * This is the primary mapping logic for this module.
     */
    private RecurringRuleDto toDto(RecurringGenerator generator, TransactionTemplate template) {
        // If the template is null (e.g., a rule with no active template yet), provide
        // default values.
        if (template == null) {
            return new RecurringRuleDto(
                    generator.getId(),
                    generator.getDescription(),
                    null, // No amount
                    null, // No currency
                    null, // No type
                    generator.getFrequency(),
                    generator.getNextDueDate(),
                    generator.isActive(),
                    null, // No categoryId
                    null // No assetId
            );
        }

        return new RecurringRuleDto(
                generator.getId(),
                generator.getDescription(),
                template.getAmount(),
                template.getCurrency(),
                template.getType(),
                generator.getFrequency(),
                generator.getNextDueDate(),
                generator.isActive(),
                template.getCategoryId(),
                template.getAssetId());
    }
}