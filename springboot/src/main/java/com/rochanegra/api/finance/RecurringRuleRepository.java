package com.rochanegra.api.finance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RecurringRuleRepository extends JpaRepository<RecurringRule, UUID> {

    @Query("SELECT r FROM RecurringRule r WHERE r.isActive = true AND r.nextDueDate <= :currentDate")
    List<RecurringRule> findDueAndActiveRules(@Param("currentDate") LocalDate currentDate);

    List<RecurringRule> findByUserId(UUID userId);
}