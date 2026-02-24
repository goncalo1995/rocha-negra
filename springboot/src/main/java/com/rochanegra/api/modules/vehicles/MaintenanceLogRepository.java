package com.rochanegra.api.modules.vehicles;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, UUID> {
    List<MaintenanceLog> findByVehicleId(UUID vehicleId);

    List<MaintenanceLog> findByUserId(UUID userId);

    void deleteByVehicleId(UUID vehicleId);
}