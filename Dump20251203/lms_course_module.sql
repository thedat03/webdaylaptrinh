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
-- Table structure for table `course_module`
--

DROP TABLE IF EXISTS `course_module`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_module` (
  `module_id` binary(16) NOT NULL,
  `position_index` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `course_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`module_id`),
  KEY `FKkge7sg0xxyo0sxgfelpavhjdj` (`course_id`),
  CONSTRAINT `FKkge7sg0xxyo0sxgfelpavhjdj` FOREIGN KEY (`course_id`) REFERENCES `course` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_module`
--

LOCK TABLES `course_module` WRITE;
/*!40000 ALTER TABLE `course_module` DISABLE KEYS */;
INSERT INTO `course_module` VALUES (_binary '\r\◊‘Å\÷B«ì∑zûá5\Ôá',6,'H√†m',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '\Óuﬁ¥I†∫¸\ÿ{/jMj',1,'Kh√°i ni·ªám k·ªπ thu·∫≠t c·∫ßn bi·∫øt',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4'),(_binary '1T–Æ6CÑ®\ﬂ	\‚&#/\’',11,'Ho√†n Th√†nh Kh√≥a H·ªçc',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '©\Ã(£IÙµ\ÿ2H¯tg',2,'Bi·∫øn v√† Ki·ªÉu d·ªØ li·ªáu',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '¸?∂\"$Ißß]îë$ub∂',2,'M√¥i tr∆∞·ªùng , con ng∆∞·ªùi IT',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4'),(_binary ' ]å¯à\ﬁOñÅù.\"1úC',5,'String',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary 'F\ÿÕç\›bN:°/\Ôƒª†',8,'Struct',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary 'Kij8EªDZ∏Dîµå:#v',3,'Ph∆∞∆°ng ph√°p ƒë·ªãnh h∆∞·ªõng',_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4'),(_binary 'aÄ˙ŸßäH¯èπ©\„tU\–$',7,'Con Tr·ªè',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary 'êÒÅ4LhNL∑sí|e\À',10,'H∆∞·ªõng ƒê·ªëi T∆∞·ª£ng ( OPP )',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary 'ó?.‰´∏E`©¥=Cb\¬\Âì',1,'Gi·ªõi thi·ªáu',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '\€m\Êâ¿\ÌKÓìÑ\·o¸6Ù',3,'C·∫•u tr√∫c ƒëi·ªÅu khi·ªÉn v√† v√≤ng l·∫∑p',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary 'ﬂÉü\Ê√¥A˙Ñ\ÍK2 ñ\Ê',1,'Ch∆∞∆°ng 1',_binary 'EVé)3£HæjÄ\∆'),(_binary '\ÌÕñ\∆—åEﬂ∏R\Ÿ‹™7\ÍU',2,'Ch∆∞∆°ng 2',_binary 'EVé)3£HæjÄ\∆'),(_binary '¯ç\r+\œyC9Ñfãzh∫i',9,'L√†m vi·ªác v·ªõi file text',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò'),(_binary '˚\À_\Ÿ(E¶Ø1uÅ\€V¡',4,'M·∫£ng',_binary '¸≤;Yü\ÊA6øÇ3\È\Áò');
/*!40000 ALTER TABLE `course_module` ENABLE KEYS */;
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

-- Dump completed on 2025-12-03 11:39:43
