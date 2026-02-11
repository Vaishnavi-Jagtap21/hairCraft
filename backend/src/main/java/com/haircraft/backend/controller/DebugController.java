package com.haircraft.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/db-check")
    public Map<String, Object> checkDb() {
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList("DESCRIBE appointment");
            return Map.of(
                "status", "success",
                "table", "appointment",
                "columns", columns
            );
        } catch (Exception e) {
            return Map.of(
                "status", "error",
                "message", e.getMessage()
            );
        }
    }
    @GetMapping("/tables")
    public Map<String, Object> listTables() {
        try {
            List<String> tables = jdbcTemplate.queryForList("SHOW TABLES", String.class);
            return Map.of(
                "status", "success",
                "tables", tables
            );
        } catch (Exception e) {
            return Map.of(
                "status", "error",
                "message", e.getMessage()
            );
        }
    }

    @GetMapping("/describe")
    public Map<String, Object> describeTable(@RequestParam String tableName) {
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList("DESCRIBE " + tableName);
            return Map.of(
                "status", "success",
                "table", tableName,
                "columns", columns
            );
        } catch (Exception e) {
            return Map.of(
                "status", "error",
                "message", e.getMessage()
            );
        }
    }

    @GetMapping("/fix-fk")
    public Map<String, Object> fixForeignKey() {
        StringBuilder log = new StringBuilder();
        try {
            // Check which constraints exist
            List<Map<String, Object>> constraints = jdbcTemplate.queryForList(
                "SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME " +
                "FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                "WHERE TABLE_SCHEMA = DATABASE() " +
                "AND TABLE_NAME = 'appointment' " +
                "AND COLUMN_NAME = 'service_id' " +
                "AND REFERENCED_TABLE_NAME IS NOT NULL"
            );
            
            log.append("Found constraints: ").append(constraints).append("\n");
            
            // Drop all existing constraints on service_id
            for (Map<String, Object> constraint : constraints) {
                String constraintName = (String) constraint.get("CONSTRAINT_NAME");
                log.append("Dropping constraint: ").append(constraintName).append("\n");
                try {
                    jdbcTemplate.execute("ALTER TABLE appointment DROP FOREIGN KEY " + constraintName);
                    log.append("Successfully dropped ").append(constraintName).append("\n");
                } catch (Exception e) {
                    log.append("Failed to drop ").append(constraintName).append(": ").append(e.getMessage()).append("\n");
                }
            }
            
            // Add correct foreign key
            log.append("Adding new constraint FK_appointment_hair_services\n");
            jdbcTemplate.execute("ALTER TABLE appointment ADD CONSTRAINT FK_appointment_hair_services FOREIGN KEY (service_id) REFERENCES hair_services(id)");
            log.append("Successfully added new constraint\n");
            
            return Map.of(
                "status", "success",
                "message", "Foreign key constraint fixed successfully",
                "log", log.toString()
            );
        } catch (Exception e) {
            return Map.of(
                "status", "error",
                "message", e.getMessage(),
                "log", log.toString()
            );
        }
    }
    
    @GetMapping("/service-counts")
    public Map<String, Object> getServiceCounts() {
        try {
            Long hairServicesCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hair_services", Long.class);
            Long servicesCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM services", Long.class);
            
            List<Map<String, Object>> hairServicesSample = jdbcTemplate.queryForList("SELECT * FROM hair_services LIMIT 3");
            List<Map<String, Object>> servicesSample = jdbcTemplate.queryForList("SELECT * FROM services LIMIT 3");
            
            return Map.of(
                "status", "success",
                "hair_services_count", hairServicesCount,
                "services_count", servicesCount,
                "hair_services_sample", hairServicesSample,
                "services_sample", servicesSample
            );
        } catch (Exception e) {
            return Map.of(
                "status", "error",
                "message", e.getMessage()
            );
        }
    }
    
    @GetMapping("/sync-services")
    public Map<String, Object> syncServices() {
        try {
            // First, clear the services table
            jdbcTemplate.execute("TRUNCATE services");
            
            // Copy data from hair_services to services
            jdbcTemplate.execute(
                "INSERT INTO services (service_id, id, name, category, price, image, badge, duration_minutes, duration, resource_units, type) " +
                "SELECT id, id, name, category, price, image, badge, duration_minutes, duration_minutes, 1, 'FIXED' FROM hair_services"
            );
            
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM services", Long.class);
            
            return Map.of(
                "status", "success",
                "message", "Services synced from hair_services",
                "count", count
            );
        } catch (Exception e) {
            return Map.of(
                "status", "error",
                "message", e.getMessage()
            );
        }
    }
}
