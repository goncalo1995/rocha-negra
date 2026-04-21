package com.rochanegra.api.modules.roadmap.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "roadmap_steps", schema = "public")
@Data
public class RoadmapStep {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "node_id", nullable = false)
    private UUID nodeId;

    @Column(name = "parent_step_id")
    private UUID parentStepId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String status = "TODO"; // TODO, COMPLETED

    @Column(name = "definition_of_done", columnDefinition = "TEXT")
    private String definitionOfDone;

    @Column(name = "prompt_template", columnDefinition = "TEXT")
    private String prompt;

    @Column(nullable = false)
    private BigDecimal position;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ElementCollection
    @CollectionTable(
        name = "roadmap_step_context",
        schema = "public",
        joinColumns = @JoinColumn(name = "step_id")
    )
    @Column(name = "node_id")
    private Set<UUID> contextNodeIds;
}
