package com.rochanegra.api.modules.blueprint.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rochanegra.api.modules.blueprint.domain.BlueprintStep;

import java.util.List;
import java.util.UUID;

@Repository
public interface BlueprintStepRepository extends JpaRepository<BlueprintStep, UUID> {

    /**
     * Fetches all steps for a given node, ordered by position.
     */
    List<BlueprintStep> findByNodeIdOrderByPositionAsc(UUID nodeId);

    /**
     * Fetches root-level steps for a given node, ordered by position.
     */
    List<BlueprintStep> findByNodeIdAndParentIsNullOrderByPositionAsc(UUID nodeId);

    /**
     * Fetches children for a specific parent step, ordered by position.
     */
    List<BlueprintStep> findByParentIdOrderByPositionAsc(UUID parentId);
}
