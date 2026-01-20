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
@Table(name = "fuel_logs")
public class FuelLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    @Column(name = "quantity_unit")
    private String quantityUnit;

    @Transient
    private BigDecimal pricePerUnit;

    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    private String currency;

    @Column(name = "mileage_at_fill")
    private Double mileageAtFill;

    @Column(name = "full_tank")
    private Boolean fullTank;

    private String station;

    private String notes;

    @Transient
    private BigDecimal normalizedQuantityLiters;

    @Transient
    private Double normalizedMileageKm;

    @Column(nullable = false)
    private LocalDate date;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}