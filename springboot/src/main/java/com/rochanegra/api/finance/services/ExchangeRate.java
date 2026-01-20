package com.rochanegra.api.finance.services;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "exchange_rates")
public class ExchangeRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "base_currency", nullable = false)
    private String baseCurrency;

    @Column(name = "target_currency", nullable = false)
    private String targetCurrency;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal rate;
}