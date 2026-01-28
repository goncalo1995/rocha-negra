package com.rochanegra.api.preferences;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserPreferencesServiceTest {

    @Mock
    private UserPreferencesRepository preferencesRepository;

    @InjectMocks
    private UserPreferencesService preferencesService;

    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
    }

    @Test
    void getBaseCurrency_found_shouldReturnStoredValue() {
        UserPreference pref = new UserPreference(userId, "display_currency");
        Map<String, Object> valueMap = new HashMap<>();
        valueMap.put("value", "USD");
        pref.setPreferenceValue(valueMap);

        when(preferencesRepository.findByUserIdAndPreferenceKey(userId, "display_currency"))
                .thenReturn(Optional.of(pref));

        String result = preferencesService.getBaseCurrency(userId);

        assertEquals("USD", result);
    }

    @Test
    void getBaseCurrency_notFound_shouldReturnDefaultValue() {
        when(preferencesRepository.findByUserIdAndPreferenceKey(userId, "display_currency"))
                .thenReturn(Optional.empty());

        String result = preferencesService.getBaseCurrency(userId);

        assertEquals("EUR", result);
    }

    @Test
    void getAllPreferences_shouldReturnMappedValues() {
        UserPreference p1 = new UserPreference(userId, "k1");
        p1.setPreferenceValue(Map.of("value", "v1"));
        UserPreference p2 = new UserPreference(userId, "k2");
        p2.setPreferenceValue(Map.of("value", true));

        when(preferencesRepository.findByUserId(userId)).thenReturn(List.of(p1, p2));

        Map<String, Object> all = preferencesService.getAllPreferences(userId);

        assertEquals(2, all.size());
        assertEquals("v1", all.get("k1"));
        assertEquals(true, all.get("k2"));
    }

    @Test
    void setPreference_shouldCreateNew_whenNotExists() {
        when(preferencesRepository.findByUserIdAndPreferenceKey(userId, "new_key"))
                .thenReturn(Optional.empty());
        when(preferencesRepository.save(any(UserPreference.class))).thenAnswer(i -> i.getArgument(0));

        UserPreference result = preferencesService.setPreference(userId, "new_key", "new_val");

        assertNotNull(result);
        assertEquals("new_key", result.getPreferenceKey());
        assertEquals("new_val", result.getPreferenceValue().get("value"));
        verify(preferencesRepository).save(any(UserPreference.class));
    }

    @Test
    void setPreference_shouldUpdateExisting_whenExists() {
        UserPreference existing = new UserPreference(userId, "existing_key");
        existing.setPreferenceValue(Map.of("value", "old"));

        when(preferencesRepository.findByUserIdAndPreferenceKey(userId, "existing_key"))
                .thenReturn(Optional.of(existing));
        when(preferencesRepository.save(any(UserPreference.class))).thenAnswer(i -> i.getArgument(0));

        UserPreference result = preferencesService.setPreference(userId, "existing_key", "new");

        assertEquals("new", result.getPreferenceValue().get("value"));
        verify(preferencesRepository).save(existing);
    }
}
