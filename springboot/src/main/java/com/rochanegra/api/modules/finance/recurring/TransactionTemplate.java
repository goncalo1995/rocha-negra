package com.rochanegra.api.modules.finance.recurring;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import com.rochanegra.api.modules.finance.types.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name = "transaction_templates")
public class TransactionTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "destination_asset_id")
    private UUID destinationAssetId;

    @Column(name = "generator_id")
    private UUID generatorId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "type")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private TransactionType type;

    @Column(name = "effective_from_date", nullable = false)
    private LocalDate effectiveFromDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}