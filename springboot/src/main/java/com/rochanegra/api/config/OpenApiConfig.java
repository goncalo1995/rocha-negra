package com.rochanegra.api.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@OpenAPIDefinition(info = @Info(title = "Rocha Negra API", version = "v1", description = "API for the Rocha Negra personal finance application."),
        // This tells Swagger that all endpoints require the 'bearerAuth' security
        // scheme
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(name = "bearerAuth", // A name for this security scheme
        description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.", scheme = "bearer", type = SecuritySchemeType.HTTP, // tokens
        bearerFormat = "JWT", in = SecuritySchemeIn.HEADER, paramName = "Authorization")
public class OpenApiConfig {
    // This class is purely for configuration annotations. No methods are needed.
}