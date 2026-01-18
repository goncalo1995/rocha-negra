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
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // --- DEBUG LOG 1: Check if the filter is running for the correct path ---
        System.out.println(">>> JwtAuthFilter running for URI: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // --- DEBUG LOG 2: Log if the header is missing or incorrect ---
            System.out.println(">>> No valid Authorization header found. Passing to next filter.");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String token = authHeader.substring(7);
            // --- DEBUG LOG 3: Print the token we are about to validate ---
            System.out.println(">>> Attempting to validate token: " + token.substring(0, 15) + "...");

            DecodedJWT decodedJWT = jwtUtil.validateToken(token);
            String userId = decodedJWT.getSubject(); // "sub" claim is the user ID

            // --- DEBUG LOG 4: Log on successful validation ---
            System.out.println(">>> SUCCESS! Token validated for user ID: " + userId);


            if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                // We don't have roles, so we use an empty list of authorities
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userId, null, Collections.emptyList());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);

                // --- DEBUG LOG 5: Log when user is set in Security Context ---
                System.out.println(">>> User set in SecurityContextHolder.");
            }
        } catch (Exception e) {
            // --- DEBUG LOG 6: CRITICAL! Log the exact validation error ---
            System.err.println(">>> JWT token validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}