package com.rochanegra.api.it_assets;

public record DomainCreateDto(
        String name,
        String registrar,
        String registrationDate,
        String expirationDate,
        String autoRenew,
        String currentPrice,
        String currency) {

}
