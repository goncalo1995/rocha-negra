package com.rochanegra.api.finance.projections;

import com.rochanegra.api.finance.FinanceService;
import com.rochanegra.api.finance.recurring.RecurringFrequency;
import com.rochanegra.api.finance.recurring.RecurringGenerator;
import com.rochanegra.api.finance.recurring.RecurringGeneratorRepository;
import com.rochanegra.api.finance.recurring.TransactionTemplate;
import com.rochanegra.api.finance.recurring.TransactionTemplateRepository;
import com.rochanegra.api.finance.types.TransactionType;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectionService {

    private final RecurringGeneratorRepository generatorRepository;
    private final TransactionTemplateRepository templateRepository;
    private final FinanceService financeService;

    public List<ProjectionMonthDto> generateProjections(UUID userId, int monthsIntoFuture) {
        BigDecimal cumulativeBalance = financeService.calculateNetWorth(userId);
        List<RecurringGenerator> activeRules = generatorRepository.findByUserIdAndIsActiveTrue(userId);

        // --- OPTIMIZATION: BATCH FETCH TEMPLATES ---
        List<UUID> ruleIds = activeRules.stream().map(RecurringGenerator::getId).collect(Collectors.toList());
        List<TransactionTemplate> allTemplates = templateRepository.findAllByGeneratorIdIn(ruleIds);
        Map<UUID, List<TransactionTemplate>> templatesByRule = allTemplates.stream()
                .collect(Collectors.groupingBy(TransactionTemplate::getGeneratorId));
        // -------------------------------------------

        LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        List<ProjectionMonthDto> projections = new ArrayList<>();

        for (int i = 0; i < monthsIntoFuture; i++) {
            LocalDate currentMonthStart = startDate.plusMonths(i);
            LocalDate currentMonthEnd = currentMonthStart.withDayOfMonth(currentMonthStart.lengthOfMonth());

            BigDecimal monthlyIncome = BigDecimal.ZERO;
            BigDecimal monthlyExpenses = BigDecimal.ZERO;

            for (RecurringGenerator rule : activeRules) {
                LocalDate nextOccurrence = rule.getNextDueDate();
                List<TransactionTemplate> templates = templatesByRule.getOrDefault(rule.getId(),
                        Collections.emptyList());

                while (nextOccurrence.isBefore(currentMonthStart)) {
                    nextOccurrence = calculateNextDueDate(nextOccurrence, rule.getFrequency());
                }

                while (!nextOccurrence.isAfter(currentMonthEnd)) {
                    if (rule.getEndDate() != null && nextOccurrence.isAfter(rule.getEndDate())) {
                        break;
                    }

                    // --- OPTIMIZATION: IN-MEMORY SELECTION ---
                    TransactionTemplate template = findRelevantTemplateInMemory(templates, nextOccurrence);
                    // -----------------------------------------

                    if (template != null) {
                        if (template.getType() == TransactionType.income) {
                            monthlyIncome = monthlyIncome.add(template.getAmount());
                        } else {
                            monthlyExpenses = monthlyExpenses.add(template.getAmount());
                        }
                    }

                    nextOccurrence = calculateNextDueDate(nextOccurrence, rule.getFrequency());
                }
            }

            BigDecimal projectedBalance = monthlyIncome.add(monthlyExpenses);
            cumulativeBalance = cumulativeBalance.add(projectedBalance);

            projections.add(new ProjectionMonthDto(
                    currentMonthStart.toString(),
                    monthlyIncome,
                    monthlyExpenses,
                    projectedBalance,
                    cumulativeBalance));
        }

        return projections;
    }

    /**
     * Replicates the complex SQL logic in-memory for performance.
     * Picks the latest effective template that is <= targetDate,
     * or the earliest future one if none exist in the past.
     */
    private TransactionTemplate findRelevantTemplateInMemory(List<TransactionTemplate> templates,
            LocalDate targetDate) {
        // 1. Find best template from the past (latest effective_from_date <=
        // targetDate)
        Optional<TransactionTemplate> pastMatch = templates.stream()
                .filter(t -> !t.getEffectiveFromDate().isAfter(targetDate))
                .max(Comparator.comparing(TransactionTemplate::getEffectiveFromDate));

        if (pastMatch.isPresent()) {
            return pastMatch.get();
        }

        // 2. If no past match, find the first upcoming template (earliest
        // effective_from_date > targetDate)
        return templates.stream()
                .filter(t -> t.getEffectiveFromDate().isAfter(targetDate))
                .min(Comparator.comparing(TransactionTemplate::getEffectiveFromDate))
                .orElse(null);
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