package com.rochanegra.api.modules.finance.services;

import java.math.BigDecimal;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrencyConversionService {
    // private final ExchangeRateRepository exchangeRateRepository;
    // In the future, you'll inject a RestClient to call an external API

    /**
     * Gets the exchange rate to convert FROM the 'fromCurrency' TO the
     * 'toCurrency'.
     * Example: getRate("USD", "EUR") might return 0.92, meaning 1 USD = 0.92 EUR.
     */
    public BigDecimal getRate(String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return BigDecimal.ONE;
        }

        // V1 Placeholder Logic:
        // In a real app, you would query the repository or an external API.
        // For now, we'll hardcode a few common rates to allow testing.
        if ("USD".equalsIgnoreCase(fromCurrency) && "EUR".equalsIgnoreCase(toCurrency)) {
            return new BigDecimal("0.92");
        }
        if ("EUR".equalsIgnoreCase(fromCurrency) && "USD".equalsIgnoreCase(toCurrency)) {
            return new BigDecimal("1.08");
        }

        // If the rate is not found, throw an exception.
        throw new UnsupportedOperationException(
                "Currency conversion rate from " + fromCurrency + " to " + toCurrency + " is not available.");
    }

    /**
     * A more complete method that uses the getRate helper.
     */
    public BigDecimal convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        BigDecimal rate = getRate(fromCurrency, toCurrency);
        return amount.multiply(rate);
    }
}
