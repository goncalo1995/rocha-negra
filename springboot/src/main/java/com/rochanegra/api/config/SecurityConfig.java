package com.rochanegra.api.config;

import com.rochanegra.api.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthFilter jwtAuthFilter;

        // --- DEFINE CORS URLS ---
        private static final String[] CORS_URLS = {
                        "http://localhost:8080", // Local development
                        "http://localhost:8081", // Local development
                        "https://rochanegra-dev.vercel.app", // Development environment
                        "https://rocha-negra-finances.vercel.app", // Development environment
                        "https://dev.rochanegra.com", // Development environment
                        "https://rochanegra.com" // Production environment
        };

        // --- DEFINE THE PUBLIC URLS ---
        private static final String[] PUBLIC_URLS = {
                        "/", // The root path
                        "/error", // Spring's default error page
                        "/favicon.ico", // Spring's default favicon
                        "/actuator/**", // Actuator endpoints
                        // --- SWAGGER UI ---
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-resources/**",
                        "/webjars/**"
        };

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(PUBLIC_URLS).permitAll() // <-- PERMIT all public URLs
                                                .requestMatchers("/api/v1/**").authenticated() // Secure our API
                                                .anyRequest().denyAll() // Deny all other requests
                                )
                                .exceptionHandling(exceptions -> exceptions
                                                .authenticationEntryPoint(unauthorizedEntryPoint()))
                                .formLogin(form -> form.disable())
                                .httpBasic(httpBasic -> httpBasic.disable())
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(CORS_URLS));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList(
                                "Authorization",
                                "Content-Type",
                                "X-Requested-With",
                                "X-Test-User",
                                "Accept",
                                "Origin",
                                "Pragma",
                                "Cache-Control",
                                "Priority",
                                "X-Client-Info"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }

        @Bean
        public AuthenticationEntryPoint unauthorizedEntryPoint() {
                return (request, response, authException) -> {
                        response.setStatus(HttpStatus.UNAUTHORIZED.value());
                        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                        // Generic message for security. Details are logged on the server.
                        response.getWriter().write(
                                        "{\"error\": \"Unauthorized\", \"message\": \"Authentication required\"}");
                };
        }
}