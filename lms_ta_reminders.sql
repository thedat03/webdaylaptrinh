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
-- Table structure for table `ta_reminders`
--

DROP TABLE IF EXISTS `ta_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ta_reminders` (
  `id` binary(16) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `message` varchar(1000) NOT NULL,
  `sent_at` datetime(6) DEFAULT NULL,
  `status` enum('ACTED','READ','SENT') NOT NULL,
  `type` enum('EXAM_NOT_DONE','GENERAL','INACTIVE','LESSON_NOT_COMPLETED','QUIZ_NOT_DONE') NOT NULL,
  `course_id` binary(16) DEFAULT NULL,
  `lesson_id` binary(16) DEFAULT NULL,
  `student_id` binary(16) NOT NULL,
  `ta_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKe1wx3l7l9n4k0u21lj84chdex` (`course_id`),
  KEY `FKdmy4653sgpe8e1ch0rabsnj0p` (`lesson_id`),
  KEY `FK1a6sfbal6u4yra5nqekn9j1ln` (`student_id`),
  KEY `FKp76a5bousxd5iw97w1y6d6mjb` (`ta_id`),
  CONSTRAINT `FK1a6sfbal6u4yra5nqekn9j1ln` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKdmy4653sgpe8e1ch0rabsnj0p` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`lesson_id`),
  CONSTRAINT `FKe1wx3l7l9n4k0u21lj84chdex` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `FKp76a5bousxd5iw97w1y6d6mjb` FOREIGN KEY (`ta_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ta_reminders`
--

LOCK TABLES `ta_reminders` WRITE;
/*!40000 ALTER TABLE `ta_reminders` DISABLE KEYS */;
INSERT INTO `ta_reminders` VALUES (_binary 'D˙ÇµN)Ä8©_Yej\ﬂ','2026-01-17 10:32:37.138986','T√¥i th·∫•y b·∫°n hi·ªán t·∫°i ƒëang kh√¥ng t·∫≠p trung v√†o b√†i gi·∫£ng ','2026-01-17 10:32:37.138986','SENT','GENERAL',_binary 'EVé)3£HæjÄ\∆',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@'),(_binary 'G\◊ \Ô`eM∂≤ßbYo','2026-01-17 10:43:55.457621','b·∫°n h·ªçc t·ªët v√†o nh√© ','2026-01-17 10:43:55.457621','SENT','GENERAL',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@'),(_binary 'ã¥Zn\ZÙI£≥Ò¸8¨@','2026-01-22 15:51:55.629613','hi','2026-01-22 15:51:55.629613','SENT','GENERAL',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@'),(_binary '\ŒWïOkGÜ0|6ò‹á','2026-01-17 10:49:29.346842','h√£y c·ªë l√™n ','2026-01-17 10:49:29.346842','SENT','INACTIVE',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4',NULL,_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@');
/*!40000 ALTER TABLE `ta_reminders` ENABLE KEYS */;
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

-- Dump completed on 2026-01-24 16:27:07
