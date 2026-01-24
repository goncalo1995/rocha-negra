package com.rochanegra.api.preferences;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserPreferences(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(preferencesService.getAllPreferences(userId));
    }

    // The request body will be a simple JSON object like {"key":
    // "display_currency", "value": "USD"}
    @PutMapping
    public ResponseEntity<Void> setPreference(@RequestBody Map<String, Object> payload, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        String key = (String) payload.get("key");
        Object value = payload.get("value");

        if (key == null || value == null) {
            return ResponseEntity.badRequest().build();
        }

        // preferencesService.setPreference(userId, key, value);
        return ResponseEntity.ok().build();
    }
}