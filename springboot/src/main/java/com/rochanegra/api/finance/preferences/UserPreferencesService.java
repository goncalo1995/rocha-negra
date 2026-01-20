package com.rochanegra.api.finance.preferences;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.rochanegra.api.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository userPreferencesRepository;

    public String getBaseCurrency(UUID userId) {
        // Query the repository for the specific preference key
        UserPreference currencyPref = userPreferencesRepository.findByUserIdAndPreferenceKey(userId, "display_currency")
                // If not found, we must return a default value.
                .orElse(null);

        if (currencyPref != null) {
            // The value is stored as JSONB. We need to parse it.
            // Assuming it's stored as a simple string like "\"EUR\""
            String currencyJson = currencyPref.getPreferenceValue().toString();
            // Remove quotes from the JSON string
            return currencyJson.replace("\"", "");
        }

        // Return a system-wide default if the user hasn't set one
        return "EUR";
    }

}
