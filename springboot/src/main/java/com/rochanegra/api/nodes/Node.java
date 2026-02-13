package com.rochanegra.api.nodes;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import jakarta.persistence.CascadeType;
import lombok.Data;

import org.hibernate.annotations.*;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rochanegra.api.nodes.types.NodeStatus;
import com.rochanegra.api.nodes.types.NodeType;
import com.rochanegra.api.tasks.Task;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "nodes")
public class Node {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private NodeType type;

    // --- PARENT RELATIONSHIP (Child-to-Parent) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference // Prevents infinite loops during JSON serialization
    private Node parent;

    // --- CHILD RELATIONSHIP (Parent-to-Children) ---
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Prevents infinite loops during JSON serialization
    @OrderBy("name ASC")
    private List<Node> children = new ArrayList<>();

    @Column(nullable = false)
    private String name;
    private String description;
    private String icon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "node_status")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private NodeStatus status = NodeStatus.ACTIVE;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private Instant completedAt;

    // Fields primarily for 'RESOURCE' type nodes
    private String content;
    private String url;
    private String storagePath;

    @Type(JsonType.class)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields;

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NodeMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "sourceNode", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NodeLink> linksTo = new HashSet<>();

    @OneToMany(mappedBy = "targetNode", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<NodeLink> linkedFrom = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}