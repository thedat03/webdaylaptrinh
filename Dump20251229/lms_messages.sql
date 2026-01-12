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
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` binary(16) NOT NULL,
  `content` varchar(5000) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `receiver_id` binary(16) NOT NULL,
  `sender_id` binary(16) NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `FKt05r0b6n0iis8u7dfna4xdh73` (`receiver_id`),
  KEY `FK4ui4nnwntodh6wjvck53dbk9m` (`sender_id`),
  CONSTRAINT `FK4ui4nnwntodh6wjvck53dbk9m` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKt05r0b6n0iis8u7dfna4xdh73` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (_binary '\rÅ±w\"LSº\€(\ŒBBd:','.','2025-12-25 23:49:45.332723',_binary '','2025-12-25 23:49:45.332723',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'ÙZ\œ-∑LqáºT5ôY\¬','ok','2025-12-08 17:20:32.147446',_binary '','2025-12-08 17:20:32.147446',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'hp\Ë®+LB≠\Ëï\rn','hi','2025-12-29 09:44:44.404232',_binary '','2025-12-29 09:44:44.404232',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\ZSºú¨K‹ì≈ê¡¿\Ï¨','hi','2025-12-08 17:11:55.396275',_binary '\0','2025-12-08 17:11:55.396275',_binary '$3Ù?KRO<ùq©æ§n\Ï©',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '…∞∫6É@ö°UØå\nÛQ','ch√†o b·∫°n','2025-12-06 16:57:37.382149',_binary '','2025-12-06 16:57:37.382149',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '-™äFøñIêÜx∞\√P','..','2025-12-25 23:49:46.149638',_binary '','2025-12-25 23:49:46.149638',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '@≥\ UZˆJôoÛ7\⁄N\'h','.','2025-12-08 17:12:10.050330',_binary '','2025-12-08 17:12:10.050330',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '@\›|&g\nI@∏\ÍVÄ$t\Õ','chao ban\\','2025-12-29 09:45:03.771521',_binary '','2025-12-29 09:45:03.771521',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'D˝diIA1∞{2äºà\∆','.','2025-12-25 23:49:45.818513',_binary '','2025-12-25 23:49:45.818513',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'F\"\⁄\ÈÇxC6õôÙ•∑ˇ','.','2025-12-25 23:49:45.041562',_binary '','2025-12-25 23:49:45.041562',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'NÜ\‰P^NM(äUs\Ô\È„õ•','.','2025-12-08 17:12:11.419360',_binary '','2025-12-08 17:12:11.419360',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '^î\Ì’©TI¶∫\Ôq«ò/','b·∫°n mu·ªën h·ªèi g√¨ ·∫°','2025-12-06 16:58:46.004827',_binary '','2025-12-06 16:58:46.004827',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'v¯?M¸+B\näó W:\≈u','.','2025-12-25 23:49:45.586704',_binary '','2025-12-25 23:49:45.586704',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'áØâ∏FºNªùˆµ\Èµ>\È','ok','2025-12-08 17:15:44.033909',_binary '','2025-12-08 17:15:44.033909',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'ì\0=˛+\’I\ÍÜ\Êï)41','t√¥i mu·ªën h·ªèi  kh√≥a java','2025-12-06 17:07:49.226931',_binary '','2025-12-06 17:07:49.226931',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary '§örÇ§ØMûÑP≤òrJ\È','m√¨nh mu·ªën h·ªèi t·∫°i sao b·∫°n l·∫°i h·ªèi','2025-12-06 16:59:27.208956',_binary '','2025-12-06 16:59:27.208956',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'Æ\÷é$wGdãí[_Çv','kh√≥a java l√† kh√≥a h·ªçc n·ªÅn t·∫£ng','2025-12-06 17:08:13.182560',_binary '','2025-12-06 17:08:13.182560',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '±_v©\€A7ù5B\“:∂\Õ','b·∫°n mu·ªën gi·ªõi thi·ªáu kh√≥a h·ªçc n√†o ·∫°','2025-12-06 17:07:35.415775',_binary '','2025-12-06 17:07:35.415775',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'ÒUâ˘\„I	ªDk\Íaﬂ∫','ok','2025-12-25 23:49:32.542049',_binary '','2025-12-25 23:49:32.542049',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '˚î¯\◊\Œ.Csú]√≤Ù%â\\','.','2025-12-25 23:49:44.703448',_binary '','2025-12-25 23:49:44.703448',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
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

-- Dump completed on 2025-12-29  9:56:42
