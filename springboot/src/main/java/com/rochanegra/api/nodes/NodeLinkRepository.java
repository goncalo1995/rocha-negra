package com.rochanegra.api.nodes;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NodeLinkRepository extends JpaRepository<NodeLink, UUID> {
    Optional<NodeLink> findBySourceNodeIdAndTargetNodeId(UUID sourceNodeId, UUID targetNodeId);

    List<NodeLink> findBySourceNodeId(UUID sourceNodeId);

    List<NodeLink> findByTargetNodeId(UUID targetNodeId);
}