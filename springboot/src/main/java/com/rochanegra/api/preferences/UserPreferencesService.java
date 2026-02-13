package com.rochanegra.api.preferences;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rochanegra.api.dashboard.dtos.WidgetPreferenceDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository preferencesRepository;
    private final ObjectMapper objectMapper;

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
        return prefs.stream()
                .filter(pref -> !pref.getPreferenceKey().equals("dashboard.widgets"))
                .collect(Collectors.toMap(
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

    public List<WidgetPreferenceDto> getDashboardWidgets(UUID userId) {

        Map<String, Object> pref = getMapPreference(userId, "dashboard.widgets");

        if (pref == null || !pref.containsKey("widgets"))
            return getDefaultWidgets();

        return objectMapper.convertValue(
                pref.get("widgets"),
                new TypeReference<List<WidgetPreferenceDto>>() {
                });
    }

    public void saveDashboardWidgets(
            UUID userId,
            List<WidgetPreferenceDto> widgets) {

        Map<String, Object> value = Map.of("widgets", widgets);

        setPreference(userId, "dashboard.widgets", value);
    }

    private List<WidgetPreferenceDto> getDefaultWidgets() {
        return List.of(
                new WidgetPreferenceDto("financial", "Financial", true, 0),
                new WidgetPreferenceDto("tasks", "Tasks", true, 1),
                new WidgetPreferenceDto("projects", "Projects", true, 2),
                new WidgetPreferenceDto("transactions", "Transactions", true, 3),
                new WidgetPreferenceDto("it", "IT", true, 4),
                new WidgetPreferenceDto("vehicles", "Vehicles", true, 5),
                new WidgetPreferenceDto("network", "Fav. Contacts", true, 6),
                new WidgetPreferenceDto("debts", "Debts", true, 7));
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

    /**
     * Retrieves a preference value that is expected to be a Map.
     */
    public Map<String, Object> getMapPreference(UUID userId, String key) {
        return preferencesRepository.findByUserIdAndPreferenceKey(userId, key)
                .map(pref -> {
                    Object value = pref.getPreferenceValue().get("value");
                    if (value == null)
                        return null;
                    return objectMapper.convertValue(
                            value,
                            new TypeReference<Map<String, Object>>() {
                            });
                })
                .orElse(null);
    }

}
