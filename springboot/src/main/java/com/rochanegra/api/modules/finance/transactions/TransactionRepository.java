package com.rochanegra.api.modules.finance.transactions;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rochanegra.api.modules.finance.types.TransactionType;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {
    List<Transaction> findByUserIdOrderByDateDesc(UUID userId);

    List<Transaction> findTopNByUserIdOrderByDateDesc(UUID userId, int limit);

    @Query("SELECT COALESCE(SUM(t.amountBase), 0) FROM Transaction t WHERE t.userId = :userId AND t.type = :type AND t.date BETWEEN :startDate AND :endDate")
    BigDecimal sumAmountBaseByUserIdAndTypeAndDateBetween(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}