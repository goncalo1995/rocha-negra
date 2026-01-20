package com.rochanegra.api.finance.recurring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionTemplateRepository extends JpaRepository<TransactionTemplate, UUID> {

    // This query finds the single template for a generator that is currently
    // active.
    // It looks for the one with the most recent effective date that is still in the
    // past.
    // @Query(value = "SELECT * FROM transaction_templates WHERE generator_id =
    // :generatorId AND effective_from_date <= :currentDate ORDER BY
    // effective_from_date DESC LIMIT 1", nativeQuery = true)
    // Optional<TransactionTemplate>
    // findActiveTemplateForGenerator(@Param("generatorId") UUID generatorId,
    // @Param("currentDate") LocalDate currentDate);

    @Query(value = """
                -- First, try to find the currently active template (most recent one in the past)
                (SELECT * FROM transaction_templates
                 WHERE generator_id = :generatorId AND effective_from_date <= :currentDate
                 ORDER BY effective_from_date DESC
                 LIMIT 1)
                UNION ALL
                -- If none found, find the first upcoming template (earliest one in the future)
                (SELECT * FROM transaction_templates
                 WHERE generator_id = :generatorId AND effective_from_date > :currentDate
                 ORDER BY effective_from_date ASC
                 LIMIT 1)
                -- Finally, get the best match from the combined results (at most one will be from the past)
                ORDER BY effective_from_date DESC
                LIMIT 1
            """, nativeQuery = true)
    Optional<TransactionTemplate> findRelevantTemplateForGenerator(@Param("generatorId") UUID generatorId,
            @Param("currentDate") LocalDate currentDate);
}