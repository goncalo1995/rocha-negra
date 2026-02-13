package com.rochanegra.api.finance;

import com.rochanegra.api.core.PageDto;
import com.rochanegra.api.dashboard.dtos.DebtsWidgetDto;
import com.rochanegra.api.dashboard.dtos.FinancialWidgetDto;
import com.rochanegra.api.dashboard.dtos.TransactionsWidgetDto;
import com.rochanegra.api.finance.assets.Asset;
import com.rochanegra.api.finance.assets.AssetRepository;
import com.rochanegra.api.finance.dashboard.DashboardDto;
import com.rochanegra.api.finance.liabilities.Liability;
import com.rochanegra.api.finance.liabilities.LiabilityRepository;
import com.rochanegra.api.finance.services.CurrencyConversionService;
import com.rochanegra.api.finance.transactions.TransactionDto;
import com.rochanegra.api.finance.transactions.TransactionRepository;
import com.rochanegra.api.finance.transactions.TransactionService;
import com.rochanegra.api.finance.types.TransactionType;
import com.rochanegra.api.preferences.UserPreferencesService;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final AssetRepository assetRepository;
    private final LiabilityRepository liabilityRepository;

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final CurrencyConversionService conversionService;

    private final UserPreferencesService userPreferencesService;

    public FinancialWidgetDto getFinancialWidget(UUID userId) {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate lastDayOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal totalNetWorth = calculateNetWorth(userId);

        BigDecimal monthlyIncome = transactionRepository.sumAmountBaseByUserIdAndTypeAndDateBetween(userId,
                TransactionType.income,
                firstDayOfMonth, lastDayOfMonth);
        if (monthlyIncome == null)
            monthlyIncome = BigDecimal.ZERO;

        BigDecimal monthlyExpenses = transactionRepository.sumAmountBaseByUserIdAndTypeAndDateBetween(userId,
                TransactionType.expense, firstDayOfMonth, lastDayOfMonth);
        if (monthlyExpenses == null)
            monthlyExpenses = BigDecimal.ZERO;

        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses.abs()); // Expenses are negative?
        // Let's check TransactionService logic.
        // Usually expenses are negative in amount if stored that way, or positive if
        // stored as absolute.
        // Base on previous curl: {"amount":-125.50,"type":"expense"}
        // So income is likely positive, expenses negative.
        // monthlyIncome + monthlyExpenses would be the savings if expenses are
        // negative.
        // Let's make it robust:
        monthlySavings = monthlyIncome.add(monthlyExpenses);

        // PageDto<TransactionDto> recentTransactions =
        // transactionService.getTransactions(
        // userId, null, null, null, null,
        // PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "date", "createdAt")));

        return new FinancialWidgetDto(
                totalNetWorth,
                monthlyIncome,
                monthlyExpenses,
                monthlySavings);
    }

    public TransactionsWidgetDto getTransactionsWidget(UUID userId) {
        // List<TransactionDto> recent =
        // transactionService.getRecentTransactions(userId, 5);
        PageDto<TransactionDto> recentTransactions = transactionService.getTransactions(
                userId, null, null, null, null,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "date", "createdAt")));
        return new TransactionsWidgetDto(recentTransactions.content());
    }

    public DebtsWidgetDto getDebtsWidget(UUID userId) {

        List<Liability> liabilities = liabilityRepository.findByUserId(userId);

        BigDecimal total = liabilities.stream()
                .map(Liability::getCurrentBalance)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DebtsWidgetDto(
                liabilities.size(),
                total);
    }

    public BigDecimal calculateNetWorth(UUID userId) {
        List<Asset> assets = assetRepository.findByUserId(userId);
        List<Liability> liabilities = liabilityRepository.findByUserId(userId);
        String baseCurrency = userPreferencesService.getBaseCurrency(userId);

        if (assets == null || liabilities == null || baseCurrency == null)
            return BigDecimal.ZERO;

        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;

        // 1. Calculate Total Assets
        for (Asset asset : assets) {
            if (asset.getBalance() != null) {
                totalAssets = totalAssets
                        .add(conversionService.convert(asset.getBalance(), asset.getCurrency(), baseCurrency));
            } else if (asset.getQuantity() != null) {
                // BigDecimal marketPrice =
                // assetPriceUpdateService.getLatestPrice(asset.getCurrency(), baseCurrency);
                // totalAssets = totalAssets.add(asset.getQuantity().multiply(marketPrice));
                // System.out.println("Ignoring asset quantity for netWorth calculation: ");
            }
        }

        // 2. Calculate Total Liabilities
        for (Liability liability : liabilities) {
            if (liability.getCurrentBalance() != null) {
                // Liabilities are typically stored as positive numbers representing the debt
                // amount
                totalLiabilities = totalLiabilities.add(conversionService.convert(liability.getCurrentBalance(),
                        liability.getCurrency(), baseCurrency));
            }
        }

        // Net Worth = Assets - Liabilities
        return totalAssets.subtract(totalLiabilities);
    }
}
