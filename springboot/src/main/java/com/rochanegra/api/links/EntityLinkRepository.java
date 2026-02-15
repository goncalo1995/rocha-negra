package com.rochanegra.api.links;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EntityLinkRepository extends JpaRepository<EntityLink, UUID> {

    // Find all links where a given entity is the source
    List<EntityLink> findByUserIdAndSourceEntityIdAndSourceEntityType(UUID userId, UUID sourceId, String sourceType);

    // Find all links where a given entity is the target
    List<EntityLink> findByUserIdAndTargetEntityIdAndTargetEntityType(UUID userId, UUID targetId, String targetType);

    List<EntityLink> findByUserIdAndSourceEntityId(UUID userId, UUID sourceId);
}