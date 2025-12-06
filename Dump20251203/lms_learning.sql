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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4991280d-b224-11f0-9506-d8bbc1f45039:1-654';

--
-- Table structure for table `learning`
--

DROP TABLE IF EXISTS `learning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `learning` (
  `id` binary(16) NOT NULL,
  `course_id` binary(16) DEFAULT NULL,
  `user_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK8wu0kdmwbk07jfi4alstbjp6k` (`course_id`),
  KEY `FKhp9a0w9eacsbhogjsixf1edlo` (`user_id`),
  CONSTRAINT `FK8wu0kdmwbk07jfi4alstbjp6k` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `FKhp9a0w9eacsbhogjsixf1edlo` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `learning`
--

LOCK TABLES `learning` WRITE;
/*!40000 ALTER TABLE `learning` DISABLE KEYS */;
INSERT INTO `learning` VALUES (_binary ':ôª\„N‚ìò±ø†\Í6à',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'e\Ìö\ÊØÛA\ÂåFy\≈M',_binary 'EVé)3£HæjÄ\∆',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'î%x\ÍeYO•±f†≤Å\◊\ÿ',_binary 'k“î≥¢Näçhn`ˇO	§',_binary 'íÚ\œL\€\rF¿´…äà!Pg'),(_binary '§#\Õ¸ûFë†M\√–Ü˛[4',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\„e\ÀXµµD∫Öe\ƒyp\√ku',_binary 'vàH\”ªGàØÚ\r\r\‹_±\√',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\„–ÉdVΩG°üT\Êø“ôt',_binary 'EVé)3£HæjÄ\∆',_binary 'íÚ\œL\€\rF¿´…äà!Pg');
/*!40000 ALTER TABLE `learning` ENABLE KEYS */;
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

-- Dump completed on 2025-12-03 11:39:42
