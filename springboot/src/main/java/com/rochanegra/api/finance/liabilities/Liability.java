package com.rochanegra.api.finance.liabilities;

import com.rochanegra.api.finance.types.LiabilityType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.*;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "liabilities")
public class Liability {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "liability_type")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private LiabilityType type;

    @Column(nullable = false)
    private String currency;

    @Column(name = "initial_amount", nullable = false)
    private BigDecimal initialAmount;

    @Column(name = "current_balance", nullable = false)
    private BigDecimal currentBalance;

    @Column(name = "interest_rate")
    private BigDecimal interestRate;

    private String description;

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