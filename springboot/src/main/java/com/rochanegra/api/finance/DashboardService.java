package com.rochanegra.api.finance;

import com.rochanegra.api.finance.types.TransactionType;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final AssetRepository assetRepository;
    private final TransactionService transactionService;

    public DashboardDto getDashboardData(UUID userId) {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate lastDayOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        BigDecimal totalNetWorth = assetRepository.sumCurrentValueByUserId(userId);
        if (totalNetWorth == null)
            totalNetWorth = BigDecimal.ZERO;

        BigDecimal monthlyIncome = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(userId,
                TransactionType.income,
                firstDayOfMonth, lastDayOfMonth);
        if (monthlyIncome == null)
            monthlyIncome = BigDecimal.ZERO;

        BigDecimal monthlyExpenses = transactionRepository.sumAmountByUserIdAndTypeAndDateBetween(userId,
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

        List<TransactionDto> recentTransactions = transactionService.getTransactions(
                userId, null, null, null, null,
                PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "date", "createdAt"))).getContent();

        return new DashboardDto(
                totalNetWorth,
                monthlyIncome,
                monthlyExpenses,
                monthlySavings,
                recentTransactions);
    }
}
