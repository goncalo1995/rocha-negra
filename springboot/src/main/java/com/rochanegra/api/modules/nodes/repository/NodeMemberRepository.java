package com.rochanegra.api.modules.nodes.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rochanegra.api.modules.nodes.domain.NodeMember;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NodeMemberRepository extends JpaRepository<NodeMember, UUID> {
    // Find a specific member in a node
    Optional<NodeMember> findByNodeIdAndUserId(UUID nodeId, UUID userId);
}
