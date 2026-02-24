package com.rochanegra.api.modules.vehicles;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, UUID> {
    List<FuelLog> findByVehicleId(UUID vehicleId);

    List<FuelLog> findByUserId(UUID userId);

    void deleteByVehicleId(UUID vehicleId);
}