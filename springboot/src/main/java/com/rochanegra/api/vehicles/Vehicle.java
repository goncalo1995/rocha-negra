package com.rochanegra.api.vehicles;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Data
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;
    private String make;
    private String model;
    private Integer year;
    private String vin;

    @Column(name = "license_plate")
    private String licensePlate;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "current_mileage")
    private Double currentMileage;

    @Column(name = "mileage_unit")
    private String mileageUnit;

    @Column(name = "fuel_unit")
    private String fuelUnit;

    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_policy_number")
    private String insurancePolicyNumber;

    @Column(name = "insurance_expiration_date")
    private String insuranceExpirationDate;

    @Column(name = "insurance_yearly_cost")
    private java.math.BigDecimal insuranceYearlyCost;

    @Column(name = "insurance_renewal_date")
    private java.time.LocalDate insuranceRenewalDate;

    private String notes;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}