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

import java.net.URL;
import java.security.interfaces.ECPublicKey;

@Component
public class JwtUtil {

    private final JwkProvider jwkProvider;

    public JwtUtil(@Value("${supabase.url}") String supabaseUrl) throws Exception {
        this.jwkProvider = new UrlJwkProvider(new URL(supabaseUrl + "/auth/v1/.well-known/jwks.json"));
    }

    public DecodedJWT validateToken(String token) throws Exception {
        DecodedJWT jwt = JWT.decode(token);
        Jwk jwk = jwkProvider.get(jwt.getKeyId());

        Algorithm algorithm = Algorithm.ECDSA256((ECPublicKey) jwk.getPublicKey(), null);
        JWTVerifier verifier = JWT.require(algorithm)
                .withAudience("authenticated")
                .build();

        return verifier.verify(token);
    }
}