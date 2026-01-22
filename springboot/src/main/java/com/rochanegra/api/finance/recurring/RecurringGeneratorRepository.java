package com.rochanegra.api.finance.recurring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringGeneratorRepository extends JpaRepository<RecurringGenerator, UUID> {

        @Query("SELECT r FROM RecurringGenerator r WHERE r.isActive = true AND r.nextDueDate <= :currentDate")
        List<RecurringGenerator> findDueAndActive(@Param("currentDate") LocalDate currentDate);

        List<RecurringGenerator> findByUserId(UUID userId);

        Optional<RecurringGenerator> findByIdAndUserId(UUID generatorId, UUID userId);

        @Query(value = """
                        SELECT * FROM recurring_generators rg
                        WHERE rg.custom_fields ->> :key = :value
                        LIMIT 1
                        """, nativeQuery = true)
        Optional<RecurringGenerator> findByCustomField(
                        @Param("key") String key,
                        @Param("value") String value);

        // If you sometimes want multiple matches:
        @Query(value = """
                        SELECT * FROM recurring_generators rg
                        WHERE rg.custom_fields ->> :key = :value
                        """, nativeQuery = true)
        List<RecurringGenerator> findAllByCustomField(
                        @Param("key") String key,
                        @Param("value") String value);
}