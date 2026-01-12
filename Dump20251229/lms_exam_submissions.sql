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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4991280d-b224-11f0-9506-d8bbc1f45039:1-976';

--
-- Table structure for table `exam_submissions`
--

DROP TABLE IF EXISTS `exam_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_submissions` (
  `id` binary(16) NOT NULL,
  `max_score` double DEFAULT NULL,
  `passed` bit(1) NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `total_score` double DEFAULT NULL,
  `exam_id` binary(16) DEFAULT NULL,
  `user_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3vnq59u82d1f5advlfpw14q2b` (`exam_id`),
  KEY `FK8uff6g6nes0c0ndr1s8lpop5f` (`user_id`),
  CONSTRAINT `FK3vnq59u82d1f5advlfpw14q2b` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`),
  CONSTRAINT `FK8uff6g6nes0c0ndr1s8lpop5f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_submissions`
--

LOCK TABLES `exam_submissions` WRITE;
/*!40000 ALTER TABLE `exam_submissions` DISABLE KEYS */;
INSERT INTO `exam_submissions` VALUES (_binary '\'˙{AwM%Æ¯É4$\‰',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '™\Ì≠ÒB™µ•∫ö=0Ω',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '+≠]ˆI\n¨7)î0QCA',2,_binary '\0',NULL,0,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '%[ò\ÔüXBFéç*.\ÀÛcl',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '.`]>\€ÒLÜú@f~éóµ˙',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '3\‡˝élK\ÔΩﬁåQ\¬$\n*',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary ':>!5üyGíÄL[™	…Éô',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'Ñ\‚\”`ÄAŸ∞õ\≈@˙\ﬁˇ\ ',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'Üª\Z\ËàmM»™S˛∫\€Ve',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'á\‘pÑ\«Hº¥Ò-t$>†',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '≠sÜA^LHé•5\0a\‚',2,_binary '\0',NULL,0,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'µc%≈•F\r¢!2Rk€£',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\Œ\Œ ≠˛1F8ùõÇÅ`\·ÇF',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\Œ\÷9!;Míà´*‰çµ#\‰',2,_binary '\0',NULL,1,_binary 'Äü´52IG∑Ä∂gπè{∑',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ');
/*!40000 ALTER TABLE `exam_submissions` ENABLE KEYS */;
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

-- Dump completed on 2025-12-29  9:56:40
