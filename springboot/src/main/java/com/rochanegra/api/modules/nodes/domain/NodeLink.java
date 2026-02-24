package com.rochanegra.api.modules.nodes.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import com.rochanegra.api.modules.nodes.types.NodeLinkType;

@Entity
@Table(name = "node_links", uniqueConstraints = @UniqueConstraint(columnNames = { "source_node_id", "target_node_id",
        "type" }))
@Getter
@Setter
@ToString(exclude = { "sourceNode", "targetNode" }) // Explicitly exclude lazy relationships from toString
public class NodeLink {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_node_id", nullable = false)
    private Node sourceNode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_node_id", nullable = false)
    private Node targetNode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private NodeLinkType type;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}