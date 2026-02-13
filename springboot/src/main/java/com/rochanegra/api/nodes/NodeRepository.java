package com.rochanegra.api.nodes;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rochanegra.api.nodes.types.NodeStatus;
import com.rochanegra.api.nodes.types.NodeType;

import java.util.List;
import java.util.UUID;

@Repository
public interface NodeRepository extends JpaRepository<Node, UUID> {

    List<Node> findTop3ByUserIdAndStatusOrderByDueDateAsc(UUID userId, NodeStatus status);

    // Custom query to find all nodes a user is a member of
    @Query("SELECT n FROM Node n JOIN n.members m WHERE m.userId = :userId")
    List<Node> findNodesByMember(@Param("userId") UUID userId);

    @Query("SELECT n FROM Node n JOIN n.members m WHERE m.userId = :userId AND n.type = :type")
    List<Node> findNodesByMemberAndType(@Param("userId") UUID userId, @Param("type") NodeType type);

    @Query("SELECT count(m) FROM NodeMember m WHERE m.node.id = :nodeId AND m.role = 'owner'")
    Long countOwners(@Param("nodeId") UUID nodeId);
}