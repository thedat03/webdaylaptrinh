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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '4991280d-b224-11f0-9506-d8bbc1f45039:1-251';

--
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `news_id` binary(16) NOT NULL,
  `content` longtext,
  `created_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_featured` bit(1) DEFAULT NULL,
  `link_url` varchar(255) DEFAULT NULL,
  `summary` varchar(2000) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`news_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (_binary 'ގvDպ��7$\�.�','Cháu nói đam mê game, muốn trở thành một lập trình viên thành công, giàu có nhưng người anh hàng xóm, nhưng tôi tin điều đó là viển vông.','2025-11-19 09:54:10.623434','/api/files/1763520849406-1565254384.webp',_binary '','https://vnexpress.net/lap-trinh-python-cong-nghe-da-phuong-tien-game-thu-toi-ngan-dua-chau-me-game-hoc-cong-nghe-thong-tin-4952510.html',NULL,'Tôi ngăn đứa cháu mê game học Công nghệ thông tin'),(_binary 'q\��/p!H\r���Ѱ�5;',NULL,'2025-11-19 09:56:53.330329','/api/files/1763520998851-301870536.webp',_binary '','https://vnexpress.net/ceo-luna-base-ai-lap-trinh-vien-cap-thap-de-bi-ai-thay-the-4910853.html',NULL,'CEO Luna Base AI: Lập trình viên cấp thấp dễ bị AI thay thế'),(_binary '�&�\�Fb�\�`:6�\�','Trong cuộc đua căng thẳng với các ông lớn công nghệ, Google gia tăng áp lực lên nhân viên, thúc giục họ sử dụng AI hàng ngày để tăng năng suất.','2025-11-19 09:56:10.258784','/api/files/1763520964032-1180868246.webp',_binary '','https://vnexpress.net/google-thuc-giuc-nhan-vien-dung-ai-trong-cong-viec-4931431.html',NULL,'Google thúc giục nhân viên dùng AI trong công việc');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
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

-- Dump completed on 2025-11-19 11:17:37
