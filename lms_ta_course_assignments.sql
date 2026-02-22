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
-- Table structure for table `ta_course_assignments`
--

DROP TABLE IF EXISTS `ta_course_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ta_course_assignments` (
  `id` binary(16) NOT NULL,
  `assigned_at` datetime(6) NOT NULL,
  `course_id` binary(16) NOT NULL,
  `ta_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKlgfahwddsw05dbm53tquadmsc` (`ta_id`,`course_id`),
  KEY `FK8ymsd7ua3ep24je4xmnad1h58` (`course_id`),
  CONSTRAINT `FK8ymsd7ua3ep24je4xmnad1h58` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `FKstikyywgqisgsg7w3loshwual` FOREIGN KEY (`ta_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ta_course_assignments`
--

LOCK TABLES `ta_course_assignments` WRITE;
/*!40000 ALTER TABLE `ta_course_assignments` DISABLE KEYS */;
INSERT INTO `ta_course_assignments` VALUES (_binary '^\…H%N\ÁÄÑN\Z`=ß','2026-01-16 11:52:15.837976',_binary 'EVé)3£HæjÄ\∆',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@'),(_binary '}˛¿R\œIw≠Ç\‘X\„©Y˙','2026-01-16 11:51:57.628001',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@'),(_binary 'ÆçπNkDá\€\»\Ï\›]î','2026-01-16 16:44:07.250269',_binary 'k“î≥¢Näçhn`ˇO	§',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@'),(_binary '\‚\ÎD\ŸDÜ±ŸëµΩÖoÙ','2026-01-16 16:45:11.101765',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@');
/*!40000 ALTER TABLE `ta_course_assignments` ENABLE KEYS */;
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

-- Dump completed on 2026-01-24 16:27:09
