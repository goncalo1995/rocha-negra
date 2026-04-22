package com.rochanegra.api.modules.blueprint.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rochanegra.api.modules.tasks.TaskStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "blueprint_steps", schema = "public")
@Getter
@Setter
@ToString(exclude = { "parent", "children" })
public class BlueprintStep {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "node_id", nullable = false)
    private UUID nodeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private BlueprintStep parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // dont serialize children from entity
    @OrderBy("position ASC")
    private List<BlueprintStep> children = new ArrayList<>();

    @Column(name = "position", nullable = false)
    private Integer position = 0;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "status")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private TaskStatus status = TaskStatus.TODO;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "context_node_ids", columnDefinition = "uuid[]")
    private List<UUID> contextNodeIds = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "details", columnDefinition = "jsonb")
    private String details; // Flexible JSONB field

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
