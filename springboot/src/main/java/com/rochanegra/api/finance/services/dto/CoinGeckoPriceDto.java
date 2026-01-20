package com.rochanegra.api.finance.services.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.Map;

// This tells Jackson to ignore any fields in the JSON that we don't have in our record
@JsonIgnoreProperties(ignoreUnknown = true)
public record CoinGeckoPriceDto(
        // The response is a map where the key is the crypto ID (e.g., "bitcoin")
        // and the value is another map where the key is the currency (e.g., "eur")
        // and the value is the price.
        // Example: { "bitcoin": { "eur": 60000.00 } }
        Map<String, Map<String, BigDecimal>> prices) {
    public BigDecimal getPrice(String cryptoId, String currency) {
        if (prices != null && prices.containsKey(cryptoId)) {
            Map<String, BigDecimal> currencyMap = prices.get(cryptoId);
            if (currencyMap != null && currencyMap.containsKey(currency.toLowerCase())) {
                return currencyMap.get(currency.toLowerCase());
            }
        }
        return null;
    }
}