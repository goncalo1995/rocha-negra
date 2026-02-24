package com.rochanegra.api.modules.network;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    List<Contact> findAllByUserIdOrderByFirstNameAsc(UUID userId);

    List<Contact> findTop3ByUserId(UUID userId);

    int countByUserId(UUID userId);

}
