package com.rochanegra.api.preferences;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;

    public String getBaseCurrency(UUID userId) {
        return getStringPreference(userId, "display_currency", "EUR");
    }

    public String getMeasurementSystem(UUID userId) {
        return getStringPreference(userId, "measurement_system", "metric");
    }

    /**
     * Returns all preferences for a user as a map of key to raw value object.
     */
    public Map<String, Object> getAllPreferences(UUID userId) {
        List<UserPreference> prefs = preferencesRepository.findByUserId(userId);

        // This creates a map where the value is the raw object (String, Boolean, etc.)
        return prefs.stream().collect(Collectors.toMap(
                UserPreference::getPreferenceKey,
                pref -> pref.getPreferenceValue().get("value") // Get the raw value from the inner map
        ));
    }

    @Transactional
    public UserPreference setPreference(UUID userId, String key, Object value) {
        UserPreference preference = preferencesRepository.findByUserIdAndPreferenceKey(userId, key)
                .orElse(new UserPreference(userId, key));

        // Create or update the map
        Map<String, Object> valueMap = new HashMap<>();
        valueMap.put("value", value); // Store the value inside a map
        preference.setPreferenceValue(valueMap);

        return preferencesRepository.save(preference);
    }

    // --- PRIVATE HELPERS ---

    /**
     * Retrieves a preference value that is expected to be a String.
     */
    public String getStringPreference(UUID userId, String key, String defaultValue) {
        return preferencesRepository.findByUserIdAndPreferenceKey(userId, key)
                .map(pref -> {
                    Object value = pref.getPreferenceValue().get("value");
                    // Check if the value is actually a String before casting
                    return value instanceof String ? (String) value : defaultValue;
                })
                .orElse(defaultValue);
    }

    /**
     * Retrieves a preference value that is expected to be a Boolean.
     */
    public Boolean getBooleanPreference(UUID userId, String key, Boolean defaultValue) {
        return preferencesRepository.findByUserIdAndPreferenceKey(userId, key)
                .map(pref -> {
                    Object value = pref.getPreferenceValue().get("value");
                    return value instanceof Boolean ? (Boolean) value : defaultValue;
                })
                .orElse(defaultValue);
    }
}
