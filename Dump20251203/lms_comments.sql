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
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` binary(16) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_approved` bit(1) NOT NULL,
  `rating` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `lesson_id` binary(16) DEFAULT NULL,
  `parent_comment_id` binary(16) DEFAULT NULL,
  `user_id` binary(16) NOT NULL,
  `course_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `FKexgdiuwp50c7oc5diw2wuo6ol` (`lesson_id`),
  KEY `FK7h839m3lkvhbyv3bcdv7sm4fj` (`parent_comment_id`),
  KEY `FK8omq0tc18jd43bu5tjh6jvraq` (`user_id`),
  KEY `FKm9f2lbkcbb3pwygw1onlc7xv9` (`course_id`),
  CONSTRAINT `FK7h839m3lkvhbyv3bcdv7sm4fj` FOREIGN KEY (`parent_comment_id`) REFERENCES `comments` (`comment_id`),
  CONSTRAINT `FK8omq0tc18jd43bu5tjh6jvraq` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKexgdiuwp50c7oc5diw2wuo6ol` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`lesson_id`),
  CONSTRAINT `FKm9f2lbkcbb3pwygw1onlc7xv9` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (_binary '3]\ÀT\ \ﬁEö®jv\Õ.+Ò','nice','2025-11-18 18:34:38.412704',_binary '',NULL,'2025-11-18 18:34:38.412704',_binary '˛≈Ø√ì\⁄Af†SÚs\Ï\œ\r',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL),(_binary '4\Áa3YM\„ò¥êy˝d','c·∫£m ∆°n b·∫°n','2025-11-18 22:56:59.414963',_binary '',NULL,'2025-11-18 22:56:59.414963',NULL,_binary '\–=øc\ÊA9Æ¶t\Â\”\≈e',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '7\"\Ã4¸\ÎOöáú˜[∂®î','nice','2025-11-19 11:07:29.066449',_binary '',NULL,'2025-11-19 11:07:29.066449',_binary '\¬°ªvÇC%Ω\ŸıßipM',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL),(_binary 'ù7z4dÆH)â(\„∏_|àú','nice','2025-11-18 11:47:14.685884',_binary '',5,'2025-11-18 11:47:14.685884',NULL,NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '\¬j\…x3\ÕK⁄îè\ÀÚ\0\0\≈\ÿ','java','2025-12-01 13:30:53.853967',_binary '',5,'2025-12-01 13:30:53.853967',NULL,NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4'),(_binary '\–=øc\ÊA9Æ¶t\Â\”\≈e','nice','2025-11-18 19:05:46.297051',_binary '',3,'2025-11-18 19:05:46.297051',NULL,NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '–É\„8¸æM\nß|°\≈Wí++','b√†i h·ªçc hay','2025-11-19 09:57:52.956145',_binary '',NULL,'2025-11-19 09:57:52.956145',_binary '\ÃO÷ÜµN€âs$I]~ê',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL),(_binary '\‚∑\‰\ﬂ\ÈIõµ=≤&{(K&','hay qu√°','2025-11-18 18:57:48.066406',_binary '',4,'2025-11-18 18:57:48.066406',NULL,NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
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

-- Dump completed on 2025-12-03 11:39:41
