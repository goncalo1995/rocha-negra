package com.rochanegra.api.finance.projections;

import com.rochanegra.api.finance.dashboard.DashboardService;
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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectionService {

    private final RecurringGeneratorRepository generatorRepository;
    private final TransactionTemplateRepository templateRepository;
    private final DashboardService dashboardService; // To get the starting net worth

    public List<ProjectionMonthDto> generateProjections(UUID userId, int monthsIntoFuture) {
        // 1. Get starting point
        BigDecimal cumulativeBalance = dashboardService.calculateNetWorth(userId);
        List<RecurringGenerator> activeRules = generatorRepository.findByUserIdAndIsActiveTrue(userId);
        LocalDate startDate = LocalDate.now().withDayOfMonth(1);

        List<ProjectionMonthDto> projections = new ArrayList<>();

        for (int i = 0; i < monthsIntoFuture; i++) {
            LocalDate currentMonthStart = startDate.plusMonths(i);
            LocalDate currentMonthEnd = currentMonthStart.withDayOfMonth(currentMonthStart.lengthOfMonth());

            BigDecimal monthlyIncome = BigDecimal.ZERO;
            BigDecimal monthlyExpenses = BigDecimal.ZERO;

            // 2. For each rule, calculate its actual occurrences in THIS month
            for (RecurringGenerator rule : activeRules) {
                LocalDate nextOccurrence = rule.getNextDueDate();

                // Fast-forward to the current projection month
                while (nextOccurrence.isBefore(currentMonthStart)) {
                    nextOccurrence = calculateNextDueDate(nextOccurrence, rule.getFrequency());
                }

                // Now, count occurrences within the month
                while (!nextOccurrence.isAfter(currentMonthEnd)) {
                    // Check against the rule's end date
                    if (rule.getEndDate() != null && nextOccurrence.isAfter(rule.getEndDate())) {
                        break; // This rule has expired
                    }

                    // Find the correct template for this specific occurrence date
                    TransactionTemplate template = templateRepository
                            .findRelevantTemplateForGenerator(rule.getId(), nextOccurrence)
                            .orElse(null);

                    if (template != null) {
                        if (template.getType() == TransactionType.income) {
                            monthlyIncome = monthlyIncome.add(template.getAmount());
                        } else {
                            monthlyExpenses = monthlyExpenses.add(template.getAmount());
                        }
                    }

                    // Move to the next occurrence for this rule
                    nextOccurrence = calculateNextDueDate(nextOccurrence, rule.getFrequency());
                }
            }

            BigDecimal projectedBalance = monthlyIncome.add(monthlyExpenses); // Expenses are negative
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