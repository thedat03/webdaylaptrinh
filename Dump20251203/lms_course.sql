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
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course` (
  `course_id` binary(16) NOT NULL,
  `course_name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `instructor` varchar(255) DEFAULT NULL,
  `p_link` varchar(255) DEFAULT NULL,
  `price` int NOT NULL,
  `y_link` varchar(255) DEFAULT NULL,
  `category` enum('AI','BACKEND','DATA','DEVOPS','FRONTEND','FULLSTACK','MOBILE','OTHER') DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `category_id` binary(16) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `user_id` binary(16) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  KEY `FKhultp2ggpgyjg2ulxpsrywkvg` (`category_id`),
  KEY `FK2nmcqx8d89xeticql10qxxvdl` (`user_id`),
  CONSTRAINT `FK2nmcqx8d89xeticql10qxxvdl` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKhultp2ggpgyjg2ulxpsrywkvg` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (_binary '&\Ê_Gg\ÂL\Ì≤≤5Æ_î4','Ki·∫øn Th·ª©c Nh·∫≠p M√¥n IT','Ki·∫øn th·ª©c nh·∫≠p m√¥n IT','F8 Official','/api/files/1763521224373-43248739.png',0,'https://youtu.be/CyZ_O7v62h4?list=PL_-VfJajZj0WSVCw3lKo2lYifzXekkv6M',NULL,'',_binary '\‘d^JbIJü¿ã_më∑¯','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'EVé)3£HæjÄ\∆','Ki·∫øn Th·ª©c Database','kh√≥a h·ªçc v·ªÅ database','F8 Official','/api/files/1764089516166-301870536.webp',300000,'https://youtu.be/CyZ_O7v62h4?list=PL_-VfJajZj0WSVCw3lKo2lYifzXekkv6M',NULL,'db',_binary 'RRç\∆#E\nàBd8%û∫','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'k“î≥¢Näçhn`ˇO	§','L·∫≠p Tr√¨nh C#','D·∫°y l·∫≠p tr√¨nh C#','Nguy·ªÖn Th·∫ø ƒê·∫°t','/api/files/1764646674496-979937719.webp',1000000,'https://youtu.be/vpqMmfkSAMo?list=PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND',NULL,'backend',_binary '\‘d^JbIJü¿ã_më∑¯','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'vàH\”ªGàØÚ\r\r\‹_±\√','Ki·∫øn th·ª©c l·∫≠p tr√¨nh Game','L·∫≠p tr√¨nh Game','F8 Official','/api/files/1764292334211-979937719.webp',400000,'https://www.youtube.com/watch?v=6XSK5Tmmhhg&list=PLN7QjCLMMKD6hM7SI3dUIKoUNFJ97aj01',NULL,'game',_binary '\‘d^JbIJü¿ã_më∑¯','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'ê3\Z¢∂Jùçˇ=\ﬁ°aæ','Kh√≥a h·ªçc Flutter','? M·ª•c ti√™u kh√≥a h·ªçc\n\nGi√∫p h·ªçc vi√™n th√†nh th·∫°o trong vi·ªác ph√°t tri·ªÉn ·ª©ng d·ª•ng web backend v·ªõi Spring Boot.\n\nHi·ªÉu quy tr√¨nh ph√°t tri·ªÉn ph·∫ßn m·ªÅm t·ª´ thi·∫øt k·∫ø, coding, ƒë·∫øn tri·ªÉn khai.\n\nS·∫µn s√†ng ƒë·∫£m nh·∫≠n v·ªã tr√≠ Java Backend Developer ho·∫∑c Full-stack Developer.','Nguy·ªÖn Th·∫ø ƒê·∫°t','/api/files/1762390696867-1050185230.png',300,'https://www.youtube.com/watch?v=UhvED-zRWFg','AI','frontend',_binary '€ì<ß-xDØ∑?\›\‰˜7	1','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary '¢6.Å~MÆñ™Ic;x§µ','Ki·∫øn th·ª©c n·ªÅn t·∫£ng v·ªÅ nh√∫ng ','H·ªçc l·∫≠p tr√¨nh nh√∫ng ','F8 Official','/api/files/1764652450496-1966826909.webp',3000000,'https://youtu.be/vpqMmfkSAMo?list=PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND',NULL,'',_binary '\‘d^JbIJü¿ã_më∑¯','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary '∂©mç!Jïª\Ï\÷\‰Z†s@','Ki·∫øn Th·ª©c Nh·∫≠p M√¥n AI','Kh√≥a H·ªçc AI','F8 Official','/api/files/1764068950072-1180868246.webp',20000,'https://youtu.be/CyZ_O7v62h4?list=PL_-VfJajZj0WSVCw3lKo2lYifzXekkv6M',NULL,'AI',_binary '\‘d^JbIJü¿ã_më∑¯','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary 'ΩU]\ƒH\À@öé∑n∏\»_','L·∫≠p Tr√¨nh ','D·∫°y l·∫≠p tr√¨nh ','Nguy·ªÖn Th·∫ø ƒê·∫°t','/api/files/1764675371341-1966826909.webp',1000000,'https://youtu.be/vpqMmfkSAMo?list=PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND',NULL,'',_binary 'RRç\∆#E\nàBd8%û∫','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary '≈∂K8j%N√ΩUùM\ÿ\ ','Kh√≥a h·ªçc l·∫≠p tr√¨nh','√°dasdasdasdasd','Nguy·ªÖn Th·∫ø ƒê·∫°t','/api/files/1762390253374-1442112119.jpeg',200,'https://www.youtube.com/watch?v=o0kCRu8Rpq8',NULL,'√°d√°d',_binary 'RRç\∆#E\nàBd8%û∫','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r'),(_binary '¸≤;Yü\ÊA6øÇ3\È\Áò','L·∫≠p tr√¨nh C/C+','Gi·ªõi thi·ªáu kh√≥a h·ªçc L·∫≠p tr√¨nh C/C++\n\nKh√≥a h·ªçc L·∫≠p tr√¨nh C/C++ gi√∫p h·ªçc vi√™n n·∫Øm v·ªØng n·ªÅn t·∫£ng l·∫≠p tr√¨nh th√¥ng qua hai ng√¥n ng·ªØ m·∫°nh m·∫Ω v√† ph·ªï bi·∫øn nh·∫•t hi·ªán nay.','F8 Official','/api/files/1762485146304-1694518936.jpg',200000,'https://youtu.be/1ppDCzoB03k?list=PL_-VfJajZj0Uo72G_6tSY4NRLpmffeXSA',NULL,'C,C++',_binary '\‘d^JbIJü¿ã_më∑¯','APPROVED',_binary 'f\ ¯ï\œEÅ¶J\“ıî6r');
/*!40000 ALTER TABLE `course` ENABLE KEYS */;
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
