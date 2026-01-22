package com.rochanegra.api.it_assets.domains;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "domains")
public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private UUID userId;
    private UUID recurringGeneratorId;
    private String name;
    private String registrar;
    private LocalDate registrationDate;
    private LocalDate expirationDate;
    private boolean autoRenew;
    private String notes;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
