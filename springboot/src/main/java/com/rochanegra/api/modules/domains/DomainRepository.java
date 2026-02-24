package com.rochanegra.api.modules.domains;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DomainRepository extends JpaRepository<Domain, UUID> {
    List<Domain> findByUserId(UUID userId);

    @Query("SELECT COUNT(d) FROM Domain d WHERE d.userId = :userId")
    int countByUserId(UUID userId);
}
