package com.example.webdaylaptrinh.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(1)
public class DatabaseMigrationConfig {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void migrateDatabase() {
        migrateCommentsTable();
        migrateLessonTable();
    }

    private void migrateCommentsTable() {
        try {
            log.info("Starting database migration for comments table...");
            
            // Update lesson_id to allow NULL
            try {
                String checkLessonIdSql = "SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'lesson_id'";
                
                String isNullable = jdbcTemplate.queryForObject(checkLessonIdSql, String.class);
                if ("NO".equals(isNullable)) {
                    log.info("Updating comments table: allowing lesson_id to be NULL");
                    jdbcTemplate.execute("ALTER TABLE comments MODIFY COLUMN lesson_id BINARY(16) NULL");
                    log.info("Successfully updated lesson_id column to allow NULL");
                } else {
                    log.info("lesson_id column already allows NULL");
                }
            } catch (Exception e) {
                log.warn("Could not check/update lesson_id column: " + e.getMessage());
            }

            // Check if course_id column exists and update if needed
            try {
                String checkCourseIdExists = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'course_id'";
                
                Integer count = jdbcTemplate.queryForObject(checkCourseIdExists, Integer.class);
                if (count != null && count > 0) {
                    String checkCourseIdNullable = "SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS " +
                            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'course_id'";
                    String isNullable = jdbcTemplate.queryForObject(checkCourseIdNullable, String.class);
                    if ("NO".equals(isNullable)) {
                        log.info("Updating comments table: allowing course_id to be NULL");
                        jdbcTemplate.execute("ALTER TABLE comments MODIFY COLUMN course_id BINARY(16) NULL");
                        log.info("Successfully updated course_id column to allow NULL");
                    } else {
                        log.info("course_id column already allows NULL");
                    }
                } else {
                    log.info("course_id column does not exist yet, Hibernate will create it with nullable=true");
                }
            } catch (Exception e) {
                log.warn("Could not check/update course_id column: " + e.getMessage());
            }
            
            log.info("Database migration for comments table completed");
        } catch (Exception e) {
            log.error("Error during comments table migration: " + e.getMessage(), e);
        }
    }

    private void migrateLessonTable() {
        try {
            log.info("Starting database migration for lesson table...");
            
            // Check if quiz_data column exists
            try {
                String checkQuizDataExists = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lesson' AND COLUMN_NAME = 'quiz_data'";
                
                Integer count = jdbcTemplate.queryForObject(checkQuizDataExists, Integer.class);
                if (count == null || count == 0) {
                    log.info("Adding quiz_data column to lesson table...");
                    jdbcTemplate.execute("ALTER TABLE lesson ADD COLUMN quiz_data TEXT(10000) NULL");
                    log.info("Successfully added quiz_data column to lesson table");
                } else {
                    log.info("quiz_data column already exists in lesson table");
                }
            } catch (Exception e) {
                log.warn("Could not check/add quiz_data column: " + e.getMessage());
            }

            // Update type column to support QUIZ value
            try {
                String checkTypeColumn = "SELECT DATA_TYPE, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lesson' AND COLUMN_NAME = 'type'";
                
                try {
                    var result = jdbcTemplate.queryForMap(checkTypeColumn);
                    String dataType = (String) result.get("DATA_TYPE");
                    String columnType = (String) result.get("COLUMN_TYPE");
                    
                    log.info("Current type column: DATA_TYPE={}, COLUMN_TYPE={}", dataType, columnType);
                    
                    if ("enum".equalsIgnoreCase(dataType)) {
                        // If it's an ENUM, we need to alter it to include QUIZ
                        if (!columnType.toUpperCase().contains("QUIZ")) {
                            log.info("Updating type column ENUM to include QUIZ...");
                            // MySQL ENUM modification - add QUIZ to the enum
                            jdbcTemplate.execute("ALTER TABLE lesson MODIFY COLUMN type ENUM('VIDEO', 'CODE', 'HOMEWORK', 'MATERIAL', 'QUIZ') NOT NULL");
                            log.info("Successfully updated type column ENUM to include QUIZ");
                        } else {
                            log.info("type column ENUM already includes QUIZ");
                        }
                    } else if ("varchar".equalsIgnoreCase(dataType)) {
                        // If it's VARCHAR, ensure it's large enough
                        int currentLength = extractVarcharLength(columnType);
                        if (currentLength < 10) {
                            log.info("Updating type column VARCHAR size to accommodate QUIZ...");
                            jdbcTemplate.execute("ALTER TABLE lesson MODIFY COLUMN type VARCHAR(20) NOT NULL");
                            log.info("Successfully updated type column VARCHAR size");
                        } else {
                            log.info("type column VARCHAR size is sufficient");
                        }
                    } else {
                        // If it's something else, convert to VARCHAR
                        log.info("Converting type column to VARCHAR to support QUIZ...");
                        jdbcTemplate.execute("ALTER TABLE lesson MODIFY COLUMN type VARCHAR(20) NOT NULL");
                        log.info("Successfully converted type column to VARCHAR");
                    }
                } catch (Exception e) {
                    log.warn("Could not check type column, attempting to modify to VARCHAR: " + e.getMessage());
                    // Fallback: try to modify to VARCHAR
                    try {
                        jdbcTemplate.execute("ALTER TABLE lesson MODIFY COLUMN type VARCHAR(20) NOT NULL");
                        log.info("Successfully modified type column to VARCHAR(20)");
                    } catch (Exception e2) {
                        log.error("Could not modify type column: " + e2.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Could not update type column: " + e.getMessage());
            }
            
            log.info("Database migration for lesson table completed");
        } catch (Exception e) {
            log.error("Error during lesson table migration: " + e.getMessage(), e);
        }
    }

    private int extractVarcharLength(String columnType) {
        try {
            // Extract number from VARCHAR(n) or similar
            int start = columnType.indexOf('(');
            int end = columnType.indexOf(')');
            if (start > 0 && end > start) {
                return Integer.parseInt(columnType.substring(start + 1, end));
            }
        } catch (Exception e) {
            // Ignore
        }
        return 0;
    }
}

