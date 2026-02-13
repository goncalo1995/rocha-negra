package com.rochanegra.api.finance.dashboard;

import com.rochanegra.api.finance.assets.Asset;
import com.rochanegra.api.finance.assets.AssetRepository;
import com.rochanegra.api.finance.liabilities.Liability;
import com.rochanegra.api.finance.liabilities.LiabilityRepository;
import com.rochanegra.api.finance.services.CurrencyConversionService;
import com.rochanegra.api.finance.services.FinanceService;
import com.rochanegra.api.finance.transactions.TransactionRepository;
import com.rochanegra.api.finance.transactions.TransactionService;
import com.rochanegra.api.preferences.UserPreferencesService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private AssetRepository assetRepository;
    @Mock
    private LiabilityRepository liabilityRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private TransactionService transactionService;
    @Mock
    private CurrencyConversionService conversionService;
    @Mock
    private UserPreferencesService userPreferencesService;

    @InjectMocks
    private FinanceService dashboardService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        lenient().when(userPreferencesService.getBaseCurrency(userId)).thenReturn("EUR");
        lenient().when(conversionService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    void calculateNetWorth_shouldSubtractLiabilitiesFromAssets() {
        Asset asset = new Asset();
        asset.setBalance(BigDecimal.valueOf(5000));
        asset.setCurrency("EUR");

        Liability liability = new Liability();
        liability.setCurrentBalance(BigDecimal.valueOf(2000));
        liability.setCurrency("EUR");

        when(assetRepository.findByUserId(userId)).thenReturn(List.of(asset));
        when(liabilityRepository.findByUserId(userId)).thenReturn(List.of(liability));

        BigDecimal netWorth = dashboardService.calculateNetWorth(userId);

        assertEquals(0, BigDecimal.valueOf(3000).compareTo(netWorth));
    }

    @Test
    void calculateNetWorth_noData_shouldReturnZero() {
        when(assetRepository.findByUserId(userId)).thenReturn(List.of());
        when(liabilityRepository.findByUserId(userId)).thenReturn(List.of());

        BigDecimal netWorth = dashboardService.calculateNetWorth(userId);

        assertEquals(BigDecimal.ZERO, netWorth);
    }
}
