package com.rochanegra.api.modules.roadmap.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.rochanegra.api.modules.nodes.domain.Node;
import java.time.Instant;

@Data
@Entity
@NoArgsConstructor
@Table(name = "project_details")
public class ProjectDetails {

    @Id
    @Column(name = "node_id")
    private java.util.UUID nodeId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "node_id")
    private Node node;

    @Column(name = "desired_outcome")
    private String desiredOutcome;

    @Column(name = "main_risk")
    private String mainRisk;

    private Integer progress;

    @Column(name = "is_ai_enabled")
    private Boolean isAiEnabled = true;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
    
    public ProjectDetails(Node node) {
        this.node = node;
        this.nodeId = node.getId();
    }
}
