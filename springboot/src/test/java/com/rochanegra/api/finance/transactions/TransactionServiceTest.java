package com.rochanegra.api.finance.transactions;

import com.rochanegra.api.finance.assets.Asset;
import com.rochanegra.api.finance.assets.AssetRepository;
import com.rochanegra.api.finance.services.CurrencyConversionService;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.links.LinkService;
import com.rochanegra.api.preferences.UserPreferencesService;
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
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private CurrencyConversionService conversionService;
    @Mock
    private UserPreferencesService preferencesService;
    @Mock
    private LinkService linkService;

    @InjectMocks
    private TransactionService transactionService;

    private UUID userId;
    private UUID assetId;
    private Asset asset;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        assetId = UUID.randomUUID();
        asset = new Asset();
        asset.setId(assetId);
        asset.setUserId(userId);
        asset.setBalance(BigDecimal.valueOf(1000));
        asset.setCurrency("EUR");

        lenient().when(preferencesService.getBaseCurrency(userId)).thenReturn("EUR");
        lenient().when(conversionService.convert(any(), any(), any())).thenAnswer(i -> i.getArgument(0));
        lenient().when(conversionService.getRate(any(), any())).thenReturn(BigDecimal.ONE);
    }

    @Test
    void createTransaction_expense_shouldDecreaseAssetBalance() {
        TransactionCreateDto dto = new TransactionCreateDto(
                BigDecimal.valueOf(100), "EUR", "Dinner", LocalDate.now(),
                TransactionType.expense, UUID.randomUUID(), assetId, null, null, null, null);

        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        TransactionDto result = transactionService.createTransaction(dto, userId);

        assertNotNull(result);
        assertEquals(BigDecimal.valueOf(-100), result.amountOriginal());
        assertEquals(BigDecimal.valueOf(900), asset.getBalance());
        verify(assetRepository).save(asset);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void createTransaction_income_shouldIncreaseAssetBalance() {
        TransactionCreateDto dto = new TransactionCreateDto(
                BigDecimal.valueOf(200), "EUR", "Salary", LocalDate.now(),
                TransactionType.income, UUID.randomUUID(), assetId, null, null, null, null);

        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        transactionService.createTransaction(dto, userId);

        assertEquals(BigDecimal.valueOf(1200), asset.getBalance());
    }

    @Test
    void createTransaction_transfer_shouldUpdateBothAssets() {
        UUID destAssetId = UUID.randomUUID();
        Asset destAsset = new Asset();
        destAsset.setId(destAssetId);
        destAsset.setBalance(BigDecimal.valueOf(500));
        destAsset.setCurrency("EUR");

        TransactionCreateDto dto = new TransactionCreateDto(
                BigDecimal.valueOf(50), "EUR", "Transfer", LocalDate.now(),
                TransactionType.transfer, UUID.randomUUID(), assetId, destAssetId, null, null, null);

        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));
        when(assetRepository.findById(destAssetId)).thenReturn(Optional.of(destAsset));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> {
            Transaction t = i.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });

        transactionService.createTransaction(dto, userId);

        assertEquals(BigDecimal.valueOf(950), asset.getBalance());
        assertEquals(BigDecimal.valueOf(550), destAsset.getBalance());
    }

    @Test
    void deleteTransaction_shouldRevertBalance() {
        UUID txId = UUID.randomUUID();
        Transaction tx = new Transaction();
        tx.setId(txId);
        tx.setUserId(userId);
        tx.setAssetId(assetId);
        tx.setAmountOriginal(BigDecimal.valueOf(-100)); // Expense
        tx.setCurrencyOriginal("EUR");

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(assetRepository.findById(assetId)).thenReturn(Optional.of(asset));

        transactionService.deleteTransaction(txId, userId);

        assertEquals(BigDecimal.valueOf(1100), asset.getBalance());
        verify(transactionRepository).delete(tx);
    }
}
