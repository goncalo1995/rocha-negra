package com.rochanegra.api.finance.recurring;

import com.rochanegra.api.exception.ResourceNotFoundException;
import com.rochanegra.api.finance.types.TransactionType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecurringRuleServiceTest {

    @Mock
    private RecurringGeneratorRepository generatorRepository;
    @Mock
    private TransactionTemplateRepository templateRepository;

    @InjectMocks
    private RecurringRuleService recurringRuleService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void createRule_validRequest_shouldCreateGeneratorAndTemplate() {
        // description, frequency, startDate, endDate, amount, currency, type,
        // categoryId, destinationAssetId, assetId, customFields
        RecurringRuleCreateDto createDto = new RecurringRuleCreateDto(
                "Rent", RecurringFrequency.monthly, LocalDate.now(), null,
                BigDecimal.valueOf(1000), "EUR", TransactionType.expense,
                UUID.randomUUID(), null, UUID.randomUUID(), null);
        when(generatorRepository.save(any(RecurringGenerator.class))).thenAnswer(i -> {
            RecurringGenerator g = i.getArgument(0);
            g.setId(UUID.randomUUID());
            return g;
        });
        when(templateRepository.save(any(TransactionTemplate.class))).thenAnswer(i -> i.getArgument(0));

        RecurringRuleDto result = recurringRuleService.createRule(createDto, userId);

        assertNotNull(result);
        assertEquals("Rent", result.description());
        assertEquals(BigDecimal.valueOf(1000), result.amount());
        verify(generatorRepository).save(any(RecurringGenerator.class));
        verify(templateRepository).save(any(TransactionTemplate.class));
    }

    @Test
    void getRuleById_found_shouldReturnDtoWithTemplate() {
        UUID ruleId = UUID.randomUUID();
        RecurringGenerator generator = new RecurringGenerator();
        generator.setId(ruleId);
        generator.setUserId(userId);
        generator.setDescription("Music Subscription");

        TransactionTemplate template = new TransactionTemplate();
        template.setAmount(BigDecimal.valueOf(9.99));
        template.setCurrency("EUR");

        when(generatorRepository.findById(ruleId)).thenReturn(Optional.of(generator));
        when(templateRepository.findRelevantTemplateForGenerator(eq(ruleId), any(LocalDate.class)))
                .thenReturn(Optional.of(template));

        RecurringRuleDto result = recurringRuleService.getRuleById(ruleId, userId);

        assertNotNull(result);
        assertEquals("Music Subscription", result.description());
        assertEquals(BigDecimal.valueOf(9.99), result.amount());
    }

    @Test
    void getRuleById_notFound_shouldThrowResourceNotFoundException() {
        UUID ruleId = UUID.randomUUID();
        when(generatorRepository.findById(ruleId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> recurringRuleService.getRuleById(ruleId, userId));
    }
}
