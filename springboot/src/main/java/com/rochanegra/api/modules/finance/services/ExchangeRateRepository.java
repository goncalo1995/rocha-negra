package com.rochanegra.api.modules.finance.services;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {

    @Query(value = "SELECT * FROM exchange_rates WHERE base_currency = :base AND target_currency = :target ORDER BY timestamp DESC LIMIT 1", nativeQuery = true)
    Optional<ExchangeRate> findLatestRate(@Param("base") String base, @Param("target") String target);
}