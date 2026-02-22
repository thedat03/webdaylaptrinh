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
-- Table structure for table `direct_questions`
--

DROP TABLE IF EXISTS `direct_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_questions` (
  `id` binary(16) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `converted_to_comment` bit(1) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `responded_at` datetime(6) DEFAULT NULL,
  `status` enum('ANSWERED','ASSIGNED','CONVERTED','PENDING') NOT NULL,
  `ta_response` varchar(2000) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `course_id` binary(16) DEFAULT NULL,
  `lesson_id` binary(16) DEFAULT NULL,
  `student_id` binary(16) NOT NULL,
  `ta_id` binary(16) DEFAULT NULL,
  `is_resolved` bit(1) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKgg98rou5b71euccretu56diou` (`course_id`),
  KEY `FKibckjlv665uat1r01lmd2h9d2` (`lesson_id`),
  KEY `FKfytcqhash6nmfvt5cs6ugurw` (`student_id`),
  KEY `FKfgfavp3oadlyx3wbpmet4qopy` (`ta_id`),
  CONSTRAINT `FKfgfavp3oadlyx3wbpmet4qopy` FOREIGN KEY (`ta_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKfytcqhash6nmfvt5cs6ugurw` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgg98rou5b71euccretu56diou` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`),
  CONSTRAINT `FKibckjlv665uat1r01lmd2h9d2` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_questions`
--

LOCK TABLES `direct_questions` WRITE;
/*!40000 ALTER TABLE `direct_questions` DISABLE KEYS */;
INSERT INTO `direct_questions` VALUES (_binary 'vQ\à¬CK“f\ç\×<Rv8','[Bá»‹ lá»—i code] ok\n\n--- Ngá»¯ cáº£nh bÃ i há»c ---\nBÃ i há»c: Test video 2\nLoáº¡i: VIDEO\n',_binary '\0','2026-01-24 13:25:53.310862','2026-01-24 13:26:01.080365','ANSWERED','ok ','2026-01-24 13:26:01.080365',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜',_binary '-\0¸[aM,½\Õhøn^œ',_binary 'R?À!¯AWŸ(q‰X\"\Ëó',_binary 'Zx\Èû¿gGJ†±,ó\î™\Ä@',_binary '\0',NULL,NULL),(_binary '£\Ä*\ãœLµ,øÈžós','[KhÃ´ng hiá»ƒu khÃ¡i niá»‡m] ok\n\n--- Ngá»¯ cáº£nh bÃ i há»c ---\nBÃ i há»c: Test video 2\nLoáº¡i: VIDEO\n',_binary '\0','2026-01-24 13:34:52.777012','2026-01-24 13:35:05.078507','ANSWERED','ok\n','2026-01-24 14:00:18.413721',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜',_binary '-\0¸[aM,½\Õhøn^œ',_binary 'R?À!¯AWŸ(q‰X\"\Ëó',_binary 'Zx\Èû¿gGJ†±,ó\î™\Ä@',_binary '',5,'2026-01-24 14:00:18.413721'),(_binary '¶Œ\Þ\é@¿’:?ÏŠj','[Bá»‹ lá»—i code] ok\n\n--- Ngá»¯ cáº£nh bÃ i há»c ---\nBÃ i há»c: Test video 2\nLoáº¡i: VIDEO\n',_binary '\0','2026-01-24 13:51:26.003398','2026-01-24 13:51:33.135821','ANSWERED','ok ','2026-01-24 13:51:33.138836',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜',_binary '-\0¸[aM,½\Õhøn^œ',_binary 'R?À!¯AWŸ(q‰X\"\Ëó',_binary 'Zx\Èû¿gGJ†±,ó\î™\Ä@',_binary '\0',NULL,NULL),(_binary '»\ÞÀÉª\ÎE\0\ïj\0¢','[KhÃ´ng hiá»ƒu khÃ¡i niá»‡m] TÃ´i Ä‘ang gáº·p váº¥n Ä‘á» vá» khÃ¡i niá»‡m\n\n--- Ngá»¯ cáº£nh bÃ i há»c ---\nBÃ i há»c: Test video 2\nLoáº¡i: VIDEO\n',_binary '\0','2026-01-19 00:14:23.750660','2026-01-19 00:32:02.377181','ANSWERED','ok','2026-01-19 00:32:02.378182',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜',_binary '-\0¸[aM,½\Õhøn^œ',_binary 'R?À!¯AWŸ(q‰X\"\Ëó',_binary 'Zx\Èû¿gGJ†±,ó\î™\Ä@',NULL,NULL,NULL),(_binary '¿C¹\Ø4øOv¿\Æ\Ýlg\ÔN4','[KhÃ´ng hiá»ƒu khÃ¡i niá»‡m] ok\n\n--- Ngá»¯ cáº£nh bÃ i há»c ---\nBÃ i há»c: Test video 2\nLoáº¡i: VIDEO\n',_binary '\0','2026-01-24 13:21:10.050443','2026-01-24 13:43:42.156587','ANSWERED','ok\n','2026-01-24 13:43:42.161119',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜',_binary '-\0¸[aM,½\Õhøn^œ',_binary 'R?À!¯AWŸ(q‰X\"\Ëó',_binary 'Zx\Èû¿gGJ†±,ó\î™\Ä@',_binary '\0',NULL,NULL),(_binary 'þ\Ë\ç\Â×­IŸ‹šQŽx','[KhÃ´ng hiá»ƒu khÃ¡i niá»‡m] ok\n\n--- Ngá»¯ cáº£nh bÃ i há»c ---\nBÃ i há»c: Test video 2\nLoáº¡i: VIDEO\n',_binary '\0','2026-01-24 13:55:44.822169','2026-01-24 13:55:53.137319','ANSWERED','ok','2026-01-24 13:55:53.141325',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜',_binary '-\0¸[aM,½\Õhøn^œ',_binary 'R?À!¯AWŸ(q‰X\"\Ëó',_binary 'Zx\Èû¿gGJ†±,ó\î™\Ä@',_binary '\0',NULL,NULL);
/*!40000 ALTER TABLE `direct_questions` ENABLE KEYS */;
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

-- Dump completed on 2026-01-24 16:27:08
