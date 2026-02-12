package com.rochanegra.api.nodes;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.*;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import com.rochanegra.api.nodes.types.NodeRole;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "node_members")
public class NodeMember {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id", nullable = false)
    private Node node;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private NodeRole role = NodeRole.VIEWER;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}