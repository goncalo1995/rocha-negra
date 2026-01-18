package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.rochanegra.api.finance.types.TransactionType;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecurringRuleScheduler {

    private final RecurringRuleRepository recurringRuleRepository;
    private final TransactionService transactionService;

    // Cron expression for "run at 2 AM every day"
    @Scheduled(cron = "0 0 2 * * ?")
    public void processDueRecurringRules() {
        log.info("Starting scheduled job: Processing due recurring rules...");
        LocalDate today = LocalDate.now();

        // 1. Find all rules that are active and due today or in the past
        List<RecurringRule> dueRules = recurringRuleRepository.findDueAndActiveRules(today);

        if (dueRules.isEmpty()) {
            log.info("No due recurring rules found. Job finished.");
            return;
        }

        log.info("Found {} due recurring rules to process.", dueRules.size());

        // 2. For each due rule, create transactions and update the rule
        for (RecurringRule rule : dueRules) {
            try {
                // Process each rule in its own transaction
                processSingleRule(rule, today);
            } catch (Exception e) {
                log.error("Failed to process recurring rule ID: {} for user: {}. Error: {}",
                        rule.getId(), rule.getUserId(), e.getMessage(), e);
                // Continue with next rule
            }
        }

        log.info("Finished processing all due recurring rules.");
    }

    /**
     * Processes a single rule, possibly creating multiple transactions if the
     * system was down.
     * Each rule is processed in a separate transaction to ensure failures don't
     * cascade.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processSingleRule(RecurringRule rule, LocalDate today) {
        log.info("Processing rule ID: {} for user ID: {}", rule.getId(), rule.getUserId());

        int occurrencesProcessed = 0;
        // Keep creating transactions until the next due date is in the future
        while (rule.getNextDueDate() != null && !rule.getNextDueDate().isAfter(today)) {

            TransactionCreateDto transactionDto = new TransactionCreateDto(
                    rule.getProjectedAmount(),
                    rule.getDescription(),
                    rule.getNextDueDate(),
                    rule.getProjectedAmount().signum() >= 0 ? TransactionType.income : TransactionType.expense,
                    rule.getCategoryId(),
                    rule.getAssetId());

            transactionService.createTransaction(transactionDto, rule.getUserId());

            LocalDate newNextDueDate = calculateNextDueDate(rule.getNextDueDate(), rule.getFrequency());
            rule.setNextDueDate(newNextDueDate);
            occurrencesProcessed++;

            log.debug("Created transaction for rule {} for date {}. New next due date: {}",
                    rule.getId(), transactionDto.date(), newNextDueDate);
        }

        recurringRuleRepository.save(rule);
        log.info("Successfully processed rule ID: {}. Created {} transactions. Final next due date: {}",
                rule.getId(), occurrencesProcessed, rule.getNextDueDate());
    }

    private LocalDate calculateNextDueDate(LocalDate currentDueDate, RecurringFrequency frequency) {
        if (currentDueDate == null)
            return null;
        return switch (frequency) {
            case weekly -> currentDueDate.plusWeeks(1);
            case monthly -> currentDueDate.plusMonths(1);
            case yearly -> currentDueDate.plusYears(1);
        };
    }
}
