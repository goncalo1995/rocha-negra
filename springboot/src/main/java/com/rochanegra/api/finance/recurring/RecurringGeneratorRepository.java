package com.rochanegra.api.finance.recurring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringGeneratorRepository extends JpaRepository<RecurringGenerator, UUID> {

    @Query("SELECT r FROM RecurringGenerator r WHERE r.isActive = true AND r.nextDueDate <= :currentDate")
    List<RecurringGenerator> findDueAndActive(@Param("currentDate") LocalDate currentDate);

    // This method is needed by getRulesForUser
    List<RecurringGenerator> findByUserId(UUID userId);

}