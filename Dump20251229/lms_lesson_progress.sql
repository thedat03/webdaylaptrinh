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
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_progress` (
  `id` binary(16) NOT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `is_completed` bit(1) NOT NULL,
  `last_accessed_at` datetime(6) DEFAULT NULL,
  `lesson_id` binary(16) NOT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK7lok1iwll7jsobapv1rmr563` (`user_id`,`lesson_id`),
  KEY `FKqff2stq7jrqvtih96pxu72xcv` (`lesson_id`),
  CONSTRAINT `FKhxwj6gbacmwi2768sceg602uf` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqff2stq7jrqvtih96pxu72xcv` FOREIGN KEY (`lesson_id`) REFERENCES `lesson` (`lesson_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
INSERT INTO `lesson_progress` VALUES (_binary 'p4\…K•Ñ\Z\Î\ÿ\¬w/\„','2025-12-29 09:48:39.383022',_binary '','2025-12-29 09:48:39.383022',_binary 'D\¬\»GÛ\ŸA\ÎÉ\ŸvJí2\»',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\n\«˙lLG)õT1°≤@≥','2025-12-27 21:29:02.221297',_binary '','2025-12-27 21:29:02.221297',_binary 'ç\'P®\⁄\ËAûí\nHv\Í£\À',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '}æ.s\€Nä-r2\◊Fil',NULL,_binary '\0','2025-12-27 22:06:17.483425',_binary '-Öí*IwCQØ\—˝&∂ò<Æ',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'QX\r©ó˚FˆßπZl8\»\»U','2025-12-27 21:35:14.168727',_binary '','2025-12-27 21:35:14.169727',_binary '\€{˛üºXKÆìD\ZˆOú',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '`y\‰=∏îH¢¿ZyYJ',NULL,_binary '\0','2025-12-29 09:48:47.433957',_binary '˙\'ë\¬5Of≠YñObÄ\◊',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'd{ ¥ÄÚJôØe*\rı\√\Z','2025-12-29 09:48:31.014729',_binary '','2025-12-29 09:48:31.014729',_binary '\»u\…lF∞DÓëæÇ˝\Ã',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'hD6Ü&eEÆå\Ï\ÁQay','2025-12-27 21:35:04.443064',_binary '','2025-12-27 21:35:04.443064',_binary 'òÀæô\ÏG@&§ñcÆt\\\ﬂ6',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'ibg\ﬂ_C5î\…f¸∑⁄Æ\ﬁ','2025-12-29 09:48:33.917892',_binary '','2025-12-29 09:48:33.917892',_binary '∑Z!<:JF∑∂∫(ÇO\·˙',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary 'Öù\¬\Ì©\ÁJ‘§m ı\r\Ô˘','2025-12-29 09:49:04.291690',_binary '','2025-12-29 09:49:04.291690',_binary '9°\n\n;\ Eºº@\∆S}',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '°)+2yôEFôf∂cím',NULL,_binary '\0','2025-12-29 09:51:05.762893',_binary 'hâLê¢J}∫Rø| Ω\‡',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '∂üKs≤EÈù∑`ã\œB¯',NULL,_binary '\0','2025-12-27 22:05:06.753014',_binary 'öÒnÅàL_§Z\Ï.\ÃD\‚`',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\≈”∑º\·3Joí_l≠¯â\⁄','2025-12-27 21:29:29.199460',_binary '','2025-12-27 21:35:02.876402',_binary '˛≈Ø√ì\⁄Af†SÚs\Ï\œ\r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '\Ê\’õ¶Nz±8\ﬂG-E¨~','2025-12-27 21:35:09.829205',_binary '','2025-12-27 21:35:09.829205',_binary '∞{;tkCª¶˙c%d ^\—',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ'),(_binary '˝,ä4ı7Oñú??ó	d\‡','2025-12-27 21:29:07.208860',_binary '','2025-12-29 09:48:27.587627',_binary '\ÃO÷ÜµN€âs$I]~ê',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ');
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
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

-- Dump completed on 2025-12-29  9:56:39
