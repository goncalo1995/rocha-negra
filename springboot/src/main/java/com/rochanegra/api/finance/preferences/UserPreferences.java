package com.rochanegra.api.finance.preferences;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    @Id
    private UUID userId;

    @Column(name = "currency", nullable = false)
    private String currency; // e.g., EUR, USD

    @Column(name = "mileage_unit", nullable = false)
    private String mileageUnit; // km or mi

    @Column(name = "fuel_unit", nullable = false)
    private String fuelUnit; // liters, gallons_us, gallons_uk

    public UserPreferences() {
    }

    public UserPreferences(UUID userId, String currency, String mileageUnit, String fuelUnit) {
        this.userId = userId;
        this.currency = currency;
        this.mileageUnit = mileageUnit;
        this.fuelUnit = fuelUnit;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getMileageUnit() {
        return mileageUnit;
    }

    public void setMileageUnit(String mileageUnit) {
        this.mileageUnit = mileageUnit;
    }

    public String getFuelUnit() {
        return fuelUnit;
    }

    public void setFuelUnit(String fuelUnit) {
        this.fuelUnit = fuelUnit;
    }
}
