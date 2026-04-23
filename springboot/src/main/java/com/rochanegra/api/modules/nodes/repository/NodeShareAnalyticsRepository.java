package com.rochanegra.api.modules.nodes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rochanegra.api.modules.nodes.domain.NodeShareAnalytics;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NodeShareAnalyticsRepository extends JpaRepository<NodeShareAnalytics, UUID> {
    @Query("SELECT COUNT(a) FROM NodeShareAnalytics a WHERE a.nodeId = :nodeId")
    int countByNodeId(@Param("nodeId") UUID nodeId);

    @Query("SELECT MAX(a.visitedAt) FROM NodeShareAnalytics a WHERE a.nodeId = :nodeId")
    Optional<Instant> findLastViewedAtByNodeId(@Param("nodeId") UUID nodeId);
}