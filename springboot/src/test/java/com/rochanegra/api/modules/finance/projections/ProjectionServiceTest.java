package com.rochanegra.api.modules.finance.projections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rochanegra.api.modules.finance.FinanceService;
import com.rochanegra.api.modules.finance.recurring.RecurringFrequency;
import com.rochanegra.api.modules.finance.recurring.RecurringGenerator;
import com.rochanegra.api.modules.finance.recurring.RecurringGeneratorRepository;
import com.rochanegra.api.modules.finance.recurring.TransactionTemplate;
import com.rochanegra.api.modules.finance.recurring.TransactionTemplateRepository;
import com.rochanegra.api.modules.finance.types.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectionServiceTest {

    @Mock
    private RecurringGeneratorRepository generatorRepository;
    @Mock
    private TransactionTemplateRepository templateRepository;
    @Mock
    private FinanceService financeService;

    @InjectMocks
    private ProjectionService projectionService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void generateProjections_oneMonthOneIncome_shouldCalculateCorrectly() {
        // Starting net worth: 1000
        when(financeService.calculateNetWorth(userId)).thenReturn(BigDecimal.valueOf(1000));

        // One active monthly rule: Salary 2000
        RecurringGenerator rule = new RecurringGenerator();
        rule.setId(UUID.randomUUID());
        rule.setFrequency(RecurringFrequency.monthly);
        rule.setNextDueDate(LocalDate.now().withDayOfMonth(15));
        rule.setActive(true);
        when(generatorRepository.findByUserIdAndIsActiveTrue(userId)).thenReturn(List.of(rule));

        TransactionTemplate template = new TransactionTemplate();
        template.setGeneratorId(rule.getId());
        template.setAmount(BigDecimal.valueOf(2000));
        template.setType(TransactionType.income);
        template.setEffectiveFromDate(LocalDate.now().minusDays(30)); // Effective in the past

        when(templateRepository.findAllByGeneratorIdIn(anyList())).thenReturn(List.of(template));

        List<ProjectionMonthDto> results = projectionService.generateProjections(userId, 1);

        assertEquals(1, results.size());
        ProjectionMonthDto month = results.get(0);
        assertEquals(0, BigDecimal.valueOf(2000).compareTo(month.projectedIncome()));
        assertEquals(0, BigDecimal.ZERO.compareTo(month.projectedExpenses()));
        assertEquals(0, BigDecimal.valueOf(2000).compareTo(month.projectedBalance()));
        assertEquals(0, BigDecimal.valueOf(3000).compareTo(month.cumulativeBalance()));
    }

    @Test
    void generateProjections_noRules_shouldStayFlat() {
        when(financeService.calculateNetWorth(userId)).thenReturn(BigDecimal.valueOf(500));
        when(generatorRepository.findByUserIdAndIsActiveTrue(userId)).thenReturn(Collections.emptyList());

        List<ProjectionMonthDto> results = projectionService.generateProjections(userId, 3);

        assertEquals(3, results.size());
        for (ProjectionMonthDto month : results) {
            assertEquals(BigDecimal.ZERO, month.projectedIncome());
            assertEquals(BigDecimal.valueOf(500), month.cumulativeBalance());
        }
    }
}
