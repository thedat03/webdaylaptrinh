-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: lms
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4991280d-b224-11f0-9506-d8bbc1f45039:1-3479';

--
-- Table structure for table `payment_courses`
--

DROP TABLE IF EXISTS `payment_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_courses` (
  `id` binary(16) NOT NULL,
  `course_id` binary(16) NOT NULL,
  `payment_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjttylenrnkgsdgadod38eu2g` (`course_id`),
  KEY `FKcl7xg5k89pnrg0vi1ceg47ky8` (`payment_id`),
  CONSTRAINT `FKcl7xg5k89pnrg0vi1ceg47ky8` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`),
  CONSTRAINT `FKjttylenrnkgsdgadod38eu2g` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_courses`
--

LOCK TABLES `payment_courses` WRITE;
/*!40000 ALTER TABLE `payment_courses` DISABLE KEYS */;
INSERT INTO `payment_courses` VALUES (_binary '3’£û|êD∑©A\0§ﬂ¨\'\\',_binary '≈∂K8j%N√ΩUùM\ÿ\ ',_binary ';£}˜-ûLªÄ\Ô1a\‘\0'),(_binary 'D\÷L˝¯D˚ë ªhQéa',_binary 'ê3\Z¢∂Jùçˇ=\ﬁ°aæ',_binary '0a§#LmÑÉ,ˆ®'),(_binary '|\‰\»/ÛÙHÚøi†\÷h4®w',_binary 'ê3\Z¢∂Jùçˇ=\ﬁ°aæ',_binary 'fµbiõHNÆ¸“èV'),(_binary '\ﬁ\Ínäx|F√´=~\¬X\Ë\Ì',_binary '≈∂K8j%N√ΩUùM\ÿ\ ',_binary 'fµbiõHNÆ¸“èV'),(_binary 'Ú¡5^rE∫û0¡˚¯ØH',_binary '≈∂K8j%N√ΩUùM\ÿ\ ',_binary '0a§#LmÑÉ,ˆ®');
/*!40000 ALTER TABLE `payment_courses` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-24 16:27:10
