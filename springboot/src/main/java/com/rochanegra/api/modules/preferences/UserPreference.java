package com.rochanegra.api.modules.preferences;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "user_preferences")
@NoArgsConstructor
@AllArgsConstructor
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "preference_key", nullable = false)
    private String preferenceKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preference_value", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> preferenceValue;

    // This is the specific constructor the service method needs.
    public UserPreference(UUID userId, String preferenceKey) {
        this.userId = userId;
        this.preferenceKey = preferenceKey;
    }
}
