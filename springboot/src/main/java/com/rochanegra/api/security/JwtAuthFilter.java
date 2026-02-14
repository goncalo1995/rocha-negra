package com.rochanegra.api.security; // <-- Make sure this matches your package

import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // --- DEBUG LOG 1: Check if the filter is running for the correct path ---
        log.info(">>> JwtAuthFilter running for URI: {} from Origin: {}", request.getRequestURI(),
                request.getHeader("Origin"));

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            // --- DEBUG LOG 2: Log if the header is missing or incorrect ---
            log.info(">>> No valid Authorization header found for URI: {}. Passing to next filter.",
                    request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);

            DecodedJWT decodedJWT = jwtUtil.validateToken(token);
            String userId = decodedJWT.getSubject(); // "sub" claim is the user ID

            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.info(">>> JWT validation successful for user: {}", userId);
                // We don't have roles, so we use an empty list of authorities
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.emptyList());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        } catch (Exception e) {
            log.error(">>> JWT token validation failed for URI {}: {}", request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}