package com.rochanegra.api.projects;

import com.rochanegra.api.projects.types.TaskStatus;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.*;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(nullable = false)
    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "task_status")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private TaskStatus status = TaskStatus.todo;

    private Integer priority;

    @Column(name = "position")
    private Integer position;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Type(JsonType.class)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}