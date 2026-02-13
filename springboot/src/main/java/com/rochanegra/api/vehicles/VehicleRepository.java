package com.rochanegra.api.vehicles;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByUserId(UUID userId);

    int countByUserId(UUID userId);

    @Query("SELECT COALESCE(SUM(m.cost), 0) + COALESCE(SUM(f.totalCost), 0) " +
            "FROM Vehicle v " +
            "LEFT JOIN MaintenanceLog m ON v.id = m.vehicleId AND m.date >= :startDate " +
            "LEFT JOIN FuelLog f ON v.id = f.vehicleId AND f.date >= :startDate " +
            "WHERE v.userId = :userId")
    BigDecimal sumMaintenanceAndFuelByUserId(UUID userId, @Param("startDate") LocalDate startDate);
}