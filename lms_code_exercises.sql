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
-- Table structure for table `code_exercises`
--

DROP TABLE IF EXISTS `code_exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `code_exercises` (
  `exercise_id` binary(16) NOT NULL,
  `course_id` binary(16) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `documentation` text COLLATE utf8mb4_unicode_ci,
  `code_snippet` varchar(10000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_language_id` int DEFAULT NULL,
  `code_test_cases` text COLLATE utf8mb4_unicode_ci,
  `position_index` int DEFAULT '0',
  `estimated_minutes` int DEFAULT NULL,
  PRIMARY KEY (`exercise_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_position` (`position_index`),
  CONSTRAINT `code_exercises_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `code_exercises`
--

LOCK TABLES `code_exercises` WRITE;
/*!40000 ALTER TABLE `code_exercises` DISABLE KEYS */;
INSERT INTO `code_exercises` VALUES (_binary '.$\·C#\\Fbñ\ÓÒwÆj∫',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4','H√£y vi·∫øt d√£y s·ªë','','','',54,'[{\"name\":\"Test 1\",\"stdin\":\"1 2 3 4 5\",\"expectedOutput\":\"1 2 3 4 5\",\"hidden\":false}]',1,30),(_binary '±{sª¿dB°≤¢\Ã3€íñ',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4','Tinh tong 2 s·ªë','Nh·∫≠p v√†o 2 bi·∫øn v√† cho ra k·∫øt qu·∫£ t·ªïng c·ªßa 2 bi·∫øn ƒë√≥','![M√¥ t·∫£ ·∫£nh](/api/files/1768278564819-943721582.jpg)\n\n\n\n123456789uihgfhxdfghj viukjbhgcgfxchvbjk s·∫ªtdyugjkbhvjgcfdrestdyfughjk fcyvhbjkhvgfhvbjtchgvjkbhvgjcfgdxgfhcvjbklndfghjkbnhgfxƒëgxhcjklnbjhvgfx','#include',54,'[{\"name\":\"Test 1\",\"stdin\":\"3 4\",\"expectedOutput\":\"7\",\"hidden\":false},{\"name\":\"Test 2\",\"stdin\":\"5 6\",\"expectedOutput\":\"11\",\"hidden\":false}]',1,10),(_binary '¯vB•\rB\"Ü¨\‚U\”\«®',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4','code 2 s·ªë','','','',54,'[{\"name\":\"Test 1\",\"stdin\":\"2 4\",\"expectedOutput\":\"6\",\"hidden\":false}]',1,30);
/*!40000 ALTER TABLE `code_exercises` ENABLE KEYS */;
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

-- Dump completed on 2026-01-24 16:27:06
