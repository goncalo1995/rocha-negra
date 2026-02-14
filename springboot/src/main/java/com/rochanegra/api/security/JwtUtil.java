package com.rochanegra.api.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.security.interfaces.ECPublicKey;

@Component
@lombok.extern.slf4j.Slf4j
public class JwtUtil {

    private final JwkProvider jwkProvider;

    public JwtUtil(@Value("${supabase.url}") String supabaseUrl) throws Exception {
        String base = supabaseUrl.endsWith("/")
                ? supabaseUrl.substring(0, supabaseUrl.length() - 1)
                : supabaseUrl;

        URI jwksUri = URI.create(base + "/auth/v1/.well-known/jwks.json");
        this.jwkProvider = new UrlJwkProvider(jwksUri.toURL());
    }

    public DecodedJWT validateToken(String token) throws Exception {
        DecodedJWT jwt = JWT.decode(token);
        String kid = jwt.getKeyId();

        if (kid == null) {
            log.error(">>> JWT token does not contain a 'kid' (Key ID). Token header: {}", jwt.getHeader());
            throw new Exception("JWT missing Key ID");
        }

        Jwk jwk = jwkProvider.get(kid);

        // Supabase tokens are usually ECDSA256 or HS256.
        // This code assumes ECDSA256 via JWKS.
        Algorithm algorithm = Algorithm.ECDSA256((ECPublicKey) jwk.getPublicKey(), null);

        // Use a more flexible verifier if audience mismatch is a problem
        JWTVerifier verifier = JWT.require(algorithm)
                .withAudience("authenticated") // Standard Supabase audience
                .acceptLeeway(30) // 30 seconds leeway for clock skew
                .build();

        try {
            return verifier.verify(token);
        } catch (Exception e) {
            log.error(">>> Token verification failed. Algorithm: {}, Audience: {}, Claims: {}",
                    jwt.getAlgorithm(), jwt.getAudience(), jwt.getClaims());
            throw e;
        }
    }
}