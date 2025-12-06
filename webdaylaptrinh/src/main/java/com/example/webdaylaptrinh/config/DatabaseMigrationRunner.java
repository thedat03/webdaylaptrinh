package com.example.webdaylaptrinh.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;


@Component
@Order(1)
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking database schema for Judge0 fields...");
            
            // Check if code_language_id column exists
            boolean hasCodeLanguageId = columnExists("lesson", "code_language_id");
            if (!hasCodeLanguageId) {
                log.info("Adding code_language_id column to lesson table...");
                jdbcTemplate.execute("ALTER TABLE lesson ADD COLUMN code_language_id INT NULL");
                log.info("✓ Added code_language_id column");
            } else {
                log.info("✓ code_language_id column already exists");
            }

            // Check if code_test_cases column exists
            boolean hasCodeTestCases = columnExists("lesson", "code_test_cases");
            if (!hasCodeTestCases) {
                log.info("Adding code_test_cases column to lesson table...");
                jdbcTemplate.execute("ALTER TABLE lesson ADD COLUMN code_test_cases TEXT NULL");
                log.info("✓ Added code_test_cases column");
            } else {
                log.info("✓ code_test_cases column already exists");
            }

            log.info("Database schema check completed successfully!");
        } catch (Exception e) {
            log.error("Error during database migration: {}", e.getMessage(), e);
            // Don't fail startup, just log the error
        }
    }

    private boolean columnExists(String tableName, String columnName) {
        try {
            String sql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() " +
                    "AND TABLE_NAME = ? AND COLUMN_NAME = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);
            return count != null && count > 0;
        } catch (Exception e) {
            log.warn("Error checking column existence for {}.{}: {}", tableName, columnName, e.getMessage());
            return false;
        }
    }
}

