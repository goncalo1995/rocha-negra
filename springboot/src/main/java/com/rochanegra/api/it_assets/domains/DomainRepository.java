package com.rochanegra.api.it_assets.domains;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DomainRepository extends JpaRepository<Domain, UUID> {
    List<Domain> findByUserId(UUID userId);

    @Query("SELECT COUNT(d) FROM Domain d WHERE d.userId = :userId")
    int countByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(d.annualCost), 0) FROM Domain d WHERE d.userId = :userId")
    BigDecimal sumAnnualCostByUserId(UUID userId);
}
