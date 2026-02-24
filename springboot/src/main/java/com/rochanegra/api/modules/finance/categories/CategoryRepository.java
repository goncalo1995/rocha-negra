package com.rochanegra.api.modules.finance.categories;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByUserId(UUID userId);

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);

    Optional<Category> findByUserIdAndSystemKey(UUID userId, String systemKey);

}
