package com.rochanegra.api.modules.roadmap.repository;

import com.rochanegra.api.modules.roadmap.domain.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, UUID> {
    List<RoadmapStep> findAllByNodeIdOrderByPositionAsc(UUID nodeId);
}
