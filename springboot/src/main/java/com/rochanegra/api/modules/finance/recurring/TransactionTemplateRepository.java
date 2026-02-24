package com.rochanegra.api.modules.finance.recurring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionTemplateRepository extends JpaRepository<TransactionTemplate, UUID> {

    List<TransactionTemplate> findAllByGeneratorIdIn(List<UUID> generatorIds);

    List<TransactionTemplate> findByAssetId(UUID assetId);

    List<TransactionTemplate> findByDestinationAssetId(UUID assetId);

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