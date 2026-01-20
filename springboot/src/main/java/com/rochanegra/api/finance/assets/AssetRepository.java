package com.rochanegra.api.finance.assets;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rochanegra.api.finance.types.AssetType;

import java.util.List;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findByUserId(UUID userId);

    // @org.springframework.data.jpa.repository.Query("SELECT SUM(a.currentValue)
    // FROM Asset a WHERE a.userId = :userId")
    // java.math.BigDecimal sumCurrentValueByUserId(UUID userId);

    // Finds all assets of a given type where the quantity is not null
    List<Asset> findByTypeInAndQuantityIsNotNull(List<AssetType> types);
}
