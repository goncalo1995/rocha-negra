package com.rochanegra.api.finance.preferences;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import lombok.Data;

@Data
@Entity
@Table(name = "user_preferences")
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "preference_key", nullable = false)
    private String preferenceKey;

    @JdbcTypeCode(SqlTypes.JSON) // The modern way to map JSONB
    @Column(name = "preference_value", nullable = false, columnDefinition = "jsonb")
    private String preferenceValue; // Storing as a raw JSON string is simplest
}
