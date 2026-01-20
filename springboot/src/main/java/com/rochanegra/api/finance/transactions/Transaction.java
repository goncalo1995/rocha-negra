package com.rochanegra.api.finance.transactions; // Or your package name

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp; // You'll need an updated_at column for this
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.Type;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import com.rochanegra.api.finance.types.TransactionType;

import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "generator_id")
    private UUID generatorId;

    @Column(nullable = false)
    private BigDecimal amountOriginal;

    @Column(nullable = false)
    private String currencyOriginal;

    @Column(nullable = false)
    private BigDecimal amountBase;

    @Column(nullable = false)
    private BigDecimal exchangeRate;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "transaction_type")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private TransactionType type;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "destination_asset_id")
    private UUID destinationAssetId;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Type(JsonType.class)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields = new HashMap<>(); // Initialize to avoid NullPointerExceptions

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}