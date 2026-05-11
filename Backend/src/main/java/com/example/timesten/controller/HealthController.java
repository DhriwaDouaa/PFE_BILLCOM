package com.example.timesten.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller de santé pour vérifier la connexion TimesTen.
 * GET http://localhost:8080/api/health
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        try {
            // Requête simple pour valider la connexion TimesTen
            String result = jdbcTemplate.queryForObject(
                    "SELECT 'TimesTen OK' FROM dual", String.class);

            return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "database", "Oracle TimesTen",
                    "message", result
            ));
        } catch (Exception e) {
            log.error("Health check failed: {}", e.getMessage());
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DOWN",
                    "database", "Oracle TimesTen",
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/tables")
    public ResponseEntity<Object> listTables() {
        try {
            var tables = jdbcTemplate.queryForList(
                    "SELECT tbl_name FROM sys.tables WHERE owner = 'TIMESTEN'");
            return ResponseEntity.ok(Map.of("tables", tables));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
