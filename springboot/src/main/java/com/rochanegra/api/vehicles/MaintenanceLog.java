package com.rochanegra.api.vehicles;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name = "maintenance_logs")
public class MaintenanceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String description;

    @Column(name = "mileage_at_service")
    private Integer mileageAtService;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    private String currency;

    @Column(name = "service_provider")
    private String serviceProvider;

    private String notes;

    @Column(nullable = false)
    private LocalDate date;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}