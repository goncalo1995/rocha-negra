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

    @Query("SELECT n FROM Node n JOIN n.members m WHERE m.userId = :userId AND (" +
            "LOWER(n.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.url) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Node> searchNodes(@Param("userId") UUID userId, @Param("query") String query);

    @Query("SELECT n FROM Node n JOIN n.members m WHERE m.userId = :userId AND n.type = :type AND (" +
            "LOWER(n.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(n.url) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Node> searchNodesByType(@Param("userId") UUID userId, @Param("type") NodeType type,
            @Param("query") String query);

    @Query("SELECT count(m) FROM NodeMember m WHERE m.node.id = :nodeId AND m.role = 'owner'")
    Long countOwners(@Param("nodeId") UUID nodeId);

    @Query(value = """
            WITH RECURSIVE ancestors AS (
                SELECT id, parent_id, 1 as level
                FROM nodes
                WHERE id = :nodeId
                UNION ALL
                SELECT n.id, n.parent_id, a.level + 1
                FROM nodes n
                INNER JOIN ancestors a ON n.id = a.parent_id
            )
            SELECT n.*
            FROM ancestors a
            JOIN nodes n ON a.id = n.id
            WHERE n.id != :nodeId
            ORDER BY a.level DESC
            """, nativeQuery = true)
    List<Node> findAncestors(@Param("nodeId") UUID nodeId);

    @Query(value = """
            WITH RECURSIVE descendants AS (
                SELECT id, parent_id
                FROM nodes
                WHERE parent_id = :nodeId
                UNION ALL
                SELECT n.id, n.parent_id
                FROM nodes n
                INNER JOIN descendants d ON n.parent_id = d.id
            )
            SELECT count(*) > 0
            FROM descendants
            WHERE id = :potentialDescendantId
            """, nativeQuery = true)
    boolean isDescendant(@Param("nodeId") UUID nodeId, @Param("potentialDescendantId") UUID potentialDescendantId);

    // Fetch all active nodes for a user to build the tree in memory
    List<Node> findAllByUserIdAndStatusNot(UUID userId, NodeStatus status);
}