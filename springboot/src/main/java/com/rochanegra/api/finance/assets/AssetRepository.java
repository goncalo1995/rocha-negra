package com.rochanegra.api.finance.assets;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findByUserId(UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(a.currentValue) FROM Asset a WHERE a.userId = :userId")
    java.math.BigDecimal sumCurrentValueByUserId(UUID userId);
}
