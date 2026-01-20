package com.rochanegra.api.finance.assets;

import com.rochanegra.api.finance.types.AssetType;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "assets")
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "asset_type")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private AssetType type;

    @Column(name = "current_value", nullable = false)
    private BigDecimal currentValue;

    @Column(nullable = false)
    private String currency;

    @Column(columnDefinition = "TEXT")
    private String institution; // e.g., "Chase", "Fidelity"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Type(JsonType.class)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields = new HashMap<>(); // Initialize to avoid NullPointerExceptions

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
