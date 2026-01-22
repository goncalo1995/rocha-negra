package com.rochanegra.api.it_assets.domains;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import lombok.Data;

@Data // <-- FIX #1: This Lombok annotation automatically creates all getters,
      // setters, etc.
@Entity // <-- FIX #2: This tells JPA that this class is a database entity.
@Table(name = "domain_price_history") // <-- FIX #3: This links the class to the correct table.
public class DomainPriceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Good practice for primary keys
    private UUID id;

    @Column(name = "domain_id", nullable = false)
    private UUID domainId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String currency;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}