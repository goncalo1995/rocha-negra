package com.rochanegra.api.links;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "entity_links")
public class EntityLink {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "source_entity_id", nullable = false)
    private UUID sourceEntityId;

    @Column(name = "source_entity_type", nullable = false)
    private String sourceEntityType;

    @Column(name = "target_entity_id", nullable = false)
    private UUID targetEntityId;

    @Column(name = "target_entity_type", nullable = false)
    private String targetEntityType;

    @Column(name = "relation_type", nullable = false)
    private String relationType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}