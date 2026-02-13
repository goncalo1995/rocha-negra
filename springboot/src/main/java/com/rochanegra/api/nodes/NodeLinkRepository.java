package com.rochanegra.api.nodes;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rochanegra.api.nodes.types.NodeLinkType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NodeLinkRepository extends JpaRepository<NodeLink, UUID> {
    Optional<NodeLink> findBySourceNodeIdAndTargetNodeId(UUID sourceNodeId, UUID targetNodeId);

    Optional<NodeLink> findBySourceNodeIdAndTargetNodeIdAndType(
            UUID sourceId,
            UUID targetId,
            NodeLinkType type);

    List<NodeLink> findBySourceNodeIdOrTargetNodeId(UUID sourceNodeId, UUID targetNodeId);

    List<NodeLink> findBySourceNodeId(UUID sourceNodeId);

    List<NodeLink> findByTargetNodeId(UUID targetNodeId);

    void deleteBySourceNodeIdOrTargetNodeId(UUID sourceId, UUID targetId);
}