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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4991280d-b224-11f0-9506-d8bbc1f45039:1-124';

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
  PRIMARY KEY (`course_id`),
  KEY `FKhultp2ggpgyjg2ulxpsrywkvg` (`category_id`),
  CONSTRAINT `FKhultp2ggpgyjg2ulxpsrywkvg` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

LOCK TABLES `course` WRITE;
/*!40000 ALTER TABLE `course` DISABLE KEYS */;
INSERT INTO `course` VALUES (_binary 't\Ü|\Ýñ4O8‡\Æ<…','Java Spring Boot','? MÃ´ táº£ khÃ³a há»c: Java Spring Boot','Nguyá»…n Tháº¿ Äáº¡t','/api/files/1762390253374-1442112119.jpeg',200,'https://youtu.be/sDHe-P0DJ3E','BACKEND','backend , springboot',_binary 'RR\Æ#E\nˆBd8%žº'),(_binary '3\Z¢¶Jÿ=\Þ¡a¾','KhÃ³a há»c Flutter','? Má»¥c tiÃªu khÃ³a há»c\n\nGiÃºp há»c viÃªn thÃ nh tháº¡o trong viá»‡c phÃ¡t triá»ƒn á»©ng dá»¥ng web backend vá»›i Spring Boot.\n\nHiá»ƒu quy trÃ¬nh phÃ¡t triá»ƒn pháº§n má»m tá»« thiáº¿t káº¿, coding, Ä‘áº¿n triá»ƒn khai.\n\nSáºµn sÃ ng Ä‘áº£m nháº­n vá»‹ trÃ­ Java Backend Developer hoáº·c Full-stack Developer.','Nguyá»…n Tháº¿ Äáº¡t','/api/files/1762390696867-1050185230.png',300,'https://www.youtube.com/watch?v=UhvED-zRWFg','AI','frontend',_binary 'Û“<§-xD¯·?\Ý\ä÷7	1'),(_binary 'Å¶K8j%NÃ½UM\Ø\Ê','KhÃ³a há»c láº­p trÃ¬nh','Ã¡dasdasdasdasd','Nguyá»…n Tháº¿ Äáº¡t','/api/files/1762390253374-1442112119.jpeg',200,'https://www.youtube.com/watch?v=o0kCRu8Rpq8',NULL,'Ã¡dÃ¡d',_binary 'RR\Æ#E\nˆBd8%žº');
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

-- Dump completed on 2025-11-07  9:58:41
