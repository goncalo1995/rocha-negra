package com.rochanegra.api.core;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KeepAliveService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Runs once every 24 hours. The cron expression means:
     * "At second 0, minute 0, hour 3, every day of the month, every month, any day
     * of the week."
     * (i.e., at 3:00 AM server time every day).
     */
    @Scheduled(cron = "0 0 3 * * ?")
    public void keepSupabaseAlive() {
        log.info("Running scheduled keep-alive job for Supabase database...");
        try {
            // Execute a very simple, fast, and low-cost query.
            // "SELECT 1" is the standard for this. It does nothing but confirm a
            // connection.
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                log.info("Supabase keep-alive ping successful.");
            } else {
                log.warn("Supabase keep-alive ping did not return expected result.");
            }
        } catch (Exception e) {
            log.error("Error during Supabase keep-alive ping: {}", e.getMessage(), e);
        }
    }
}