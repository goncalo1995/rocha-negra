package com.rochanegra.api.finance;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
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
    @Transactional
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

        // 2. For each due rule, create a transaction and update the rule
        for (RecurringRule rule : dueRules) {
            log.info("Processing rule ID: {} for user ID: {}", rule.getId(), rule.getUserId());

            // a. Create a new Transaction from the rule's data
            TransactionCreateDto transactionDto = new TransactionCreateDto(
                    rule.getProjectedAmount(),
                    rule.getDescription(),
                    rule.getNextDueDate(), // Use the due date as the transaction date
                    rule.getProjectedAmount().signum() > 0 ? TransactionType.income : TransactionType.expense, // Determine
                                                                                                               // type
                                                                                                               // from
                                                                                                               // amount
                    rule.getCategoryId(),
                    rule.getAssetId());
            transactionService.createTransaction(transactionDto, rule.getUserId());

            // b. Update the rule's next_due_date for the next cycle
            LocalDate newNextDueDate = calculateNextDueDate(rule.getNextDueDate(), rule.getFrequency());
            rule.setNextDueDate(newNextDueDate);
            recurringRuleRepository.save(rule);
            log.info("Successfully processed rule ID: {}. Next due date set to: {}", rule.getId(), newNextDueDate);
        }

        log.info("Finished processing all due recurring rules.");
    }

    private LocalDate calculateNextDueDate(LocalDate currentDueDate, RecurringFrequency frequency) {
        return switch (frequency) {
            case weekly -> currentDueDate.plusWeeks(1);
            case monthly -> currentDueDate.plusMonths(1);
            case yearly -> currentDueDate.plusYears(1);
        };
    }
}