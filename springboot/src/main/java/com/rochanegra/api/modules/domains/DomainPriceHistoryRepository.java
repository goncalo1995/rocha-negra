package com.rochanegra.api.modules.domains;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DomainPriceHistoryRepository extends JpaRepository<DomainPriceHistory, UUID> {
    List<DomainPriceHistory> findByUserId(UUID userId);

    List<DomainPriceHistory> findByDomainId(UUID domainId);

    List<DomainPriceHistory> findByDomainIdInOrderByEffectiveDateDesc(List<UUID> domainIds);

    Optional<DomainPriceHistory> findTopByDomainIdOrderByEffectiveDateDesc(UUID domainId);

}
