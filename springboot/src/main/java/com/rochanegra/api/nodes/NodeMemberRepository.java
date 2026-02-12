package com.rochanegra.api.nodes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NodeMemberRepository extends JpaRepository<NodeMember, UUID> {
    // Find a specific member in a node
    Optional<NodeMember> findByNodeIdAndUserId(UUID nodeId, UUID userId);
}
