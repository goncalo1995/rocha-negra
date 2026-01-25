package com.rochanegra.api.projects;

import com.rochanegra.api.projects.types.ProjectRole;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.*;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "project_members")
public class ProjectMember {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "project_role")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private ProjectRole role = ProjectRole.viewer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}