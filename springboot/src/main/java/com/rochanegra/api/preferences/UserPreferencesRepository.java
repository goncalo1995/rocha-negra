package com.rochanegra.api.preferences;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreference, UUID> {

    List<UserPreference> findByUserId(UUID userId);

    // Finds a specific preference for a user by its key
    Optional<UserPreference> findByUserIdAndPreferenceKey(UUID userId, String preferenceKey);

}
