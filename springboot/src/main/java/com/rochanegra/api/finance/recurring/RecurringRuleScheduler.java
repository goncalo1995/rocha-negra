package com.rochanegra.api.finance.recurring;

import com.rochanegra.api.finance.transactions.TransactionCreateDto;
import com.rochanegra.api.finance.transactions.TransactionService;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringRuleScheduler {

    private final RecurringGeneratorRepository generatorRepository;
    private final TransactionTemplateRepository templateRepository;
    private final TransactionService transactionService;

    // Cron expression for "run at 2 AM every day"
    @Scheduled(cron = "0 0 2 * * ?")
    public void processDueRecurringRules() {
        log.info("Starting scheduled job: Processing due recurring generators...");
        LocalDate today = LocalDate.now();

        // 1. Find all rules that are active and have a due date in the past or today
        List<RecurringGenerator> dueGenerators = generatorRepository.findDueAndActive(today);

        if (dueGenerators.isEmpty()) {
            log.info("No due recurring generators found. Job finished.");
            return;
        }

        log.info("Found {} due recurring generators to process.", dueGenerators.size());

        // 2. Process each generator individually to isolate failures
        for (RecurringGenerator generator : dueGenerators) {
            try {
                processSingleGenerator(generator, today);
            } catch (Exception e) {
                log.error("Failed to process recurring generator ID: {}. Error: {}",
                        generator.getId(), e.getMessage(), e);
            }
        }

        log.info("Finished processing all due recurring generators.");
    }

    /**
     * Processes a single generator in its own transaction.
     * This method handles "catch-up" logic if the server was down by creating
     * transactions for all missed due dates.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processSingleGenerator(RecurringGenerator generator, LocalDate today) {
        log.info("Processing generator ID: {}", generator.getId());

        int occurrencesProcessed = 0;
        LocalDate nextDateToProcess = generator.getNextDueDate();

        // Loop as long as the next due date is in the past or is today
        while (!nextDateToProcess.isAfter(today)) {

            // Check if the generator's lifecycle has ended
            if (generator.getEndDate() != null && nextDateToProcess.isAfter(generator.getEndDate())) {
                generator.setActive(false);
                log.info("Generator {} has passed its end date. Deactivating.", generator.getId());
                break; // Exit the loop
            }

            // Find the correct financial template for this specific occurrence date
            TransactionTemplate activeTemplate = templateRepository
                    .findRelevantTemplateForGenerator(generator.getId(), nextDateToProcess)
                    .orElse(null);

            if (activeTemplate == null) {
                log.warn("Generator {} is due for {} but has no active template. Skipping this occurrence.",
                        generator.getId(), nextDateToProcess);
                // Still advance the date to avoid an infinite loop
                nextDateToProcess = calculateNextDueDate(nextDateToProcess, generator.getFrequency());
                continue;
            }

            // Create a real transaction from the template
            TransactionCreateDto transactionDto = buildTransactionDtoFromTemplate(generator, activeTemplate,
                    nextDateToProcess);
            transactionService.createTransactionFromGenerator(transactionDto, generator.getId(), generator.getUserId());

            occurrencesProcessed++;
            // Calculate the next date in the sequence
            nextDateToProcess = calculateNextDueDate(nextDateToProcess, generator.getFrequency());
        }

        // Update the generator with the new next_due_date for the future
        generator.setNextDueDate(nextDateToProcess);
        generatorRepository.save(generator);
        log.info("Successfully processed generator ID: {}. Created {} transactions. New next due date: {}",
                generator.getId(), occurrencesProcessed, generator.getNextDueDate());
    }

    private TransactionCreateDto buildTransactionDtoFromTemplate(RecurringGenerator generator,
            TransactionTemplate template, LocalDate transactionDate) {
        // Here we could extract linking info from the generator's custom fields if
        // needed
        // List<EntityLinkDto> links =
        // parseLinksFromCustomFields(generator.getCustomFields());

        return new TransactionCreateDto(
                template.getAmount(),
                template.getCurrency(),
                generator.getDescription(),
                transactionDate, // Use the specific date for this occurrence
                template.getType(),
                template.getCategoryId(),
                template.getAssetId(),
                template.getDestinationAssetId(),
                null, // attachmentUrl
                null, // customFields
                null // links (or parsed from generator's custom fields)
        );
    }

    private LocalDate calculateNextDueDate(LocalDate currentDueDate, RecurringFrequency frequency) {
        return switch (frequency) {
            case daily -> currentDueDate.plusDays(1);
            case weekly -> currentDueDate.plusWeeks(1);
            case monthly -> currentDueDate.plusMonths(1);
            case quarterly -> currentDueDate.plus(3, ChronoUnit.MONTHS);
            case yearly -> currentDueDate.plusYears(1);
        };
    }
}