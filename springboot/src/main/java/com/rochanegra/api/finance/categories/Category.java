package com.rochanegra.api.finance.categories;

import com.rochanegra.api.finance.types.CategoryNature;
import com.rochanegra.api.finance.types.TransactionType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    // @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private String type; // Optional: restrict category to income or expense

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "category_nature")
    @JdbcType(PostgreSQLEnumJdbcType.class)
    private CategoryNature nature;

    @Column(name = "icon_slug")
    private String iconSlug;

    private String color;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
