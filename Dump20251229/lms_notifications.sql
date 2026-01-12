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
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` binary(16) NOT NULL,
  `content` varchar(2000) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `related_id` binary(16) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `title` varchar(500) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` binary(16) NOT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (_binary '\æjg@;“‚ˆ].†n','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-11 00:03:27.932465',_binary '',_binary 'Uøˆœt©L_¨d33üÀ^','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-11 00:03:27.932465',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '»ùÀ\ÎL^®’\Û;ÁP','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-11 00:03:28.988590',_binary '',_binary 'Uøˆœt©L_¨d33üÀ^','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-11 00:03:28.988590',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '\Ôc\Ø7TM¼\Î\ì‰\rQr','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"TÃ i Liá»‡u Hay\" vÃ o khÃ³a há»c \"Láº­p trÃ¬nh C/C+\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-26 22:17:16.370697',_binary '',_binary 'ü²;YŸ\æA6¿‚3\é\ç˜','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-26 22:17:16.370697',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '-Œô.¼vJ^ª\ŞA&{c{„','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"Video giá»›i thiá»‡u\" vÃ o khÃ³a há»c \"Láº­p TrÃ¬nh C#\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-08 09:51:50.593077',_binary '',_binary 'kÒ”³¢NŠhn`ÿO	¤','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-08 09:51:50.593077',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '>\0³\ÈEÖªŠ(\äù•ñ','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-11 00:03:26.800912',_binary '',_binary 'Uøˆœt©L_¨d33üÀ^','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-11 00:03:26.800912',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary 'B\ä]\âùKM†<b\è)ÿ`','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"Video giá»›i thiá»‡u\" vÃ o khÃ³a há»c \"Láº­p TrÃ¬nh C#\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-08 09:51:50.593077',_binary '\0',_binary 'kÒ”³¢NŠhn`ÿO	¤','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-08 09:51:50.593077',_binary '’ò\ÏL\Û\rFÀ«ÉŠˆ!Pg'),(_binary 'GgJ\ÇK\äCôš!\"&\èß¯¯','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"123\" vÃ o khÃ³a há»c \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-26 16:12:33.555279',_binary '',_binary '&\æ_Gg\åL\í²²5®_”4','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-26 16:12:33.555279',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary 'J \0\ÍJWFŸ\îó¦­3\×','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"BÃ i táº­p test\" vÃ o khÃ³a há»c \"Láº­p TrÃ¬nh C#\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-08 09:58:25.003992',_binary '',_binary 'kÒ”³¢NŠhn`ÿO	¤','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-08 09:58:25.003992',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '\\\ÌbV\ã\ËJXŸz†\éÁ\×w\'','Há»c viÃªn dat123 Ä‘Ã£ thanh toÃ¡n thÃ nh cÃ´ng khÃ³a há»c \"Láº­p TrÃ¬nh C#\" vá»›i sá»‘ tiá»n 1000000 VNÄ.','2025-12-06 21:24:05.896207',_binary '\0',_binary 's\ÏhS\â@MÙ†¹\Ç=~\"','PAYMENT','Giao dá»‹ch thanh toÃ¡n má»›i','PAYMENT_SUCCESS','2025-12-06 21:24:05.896207',_binary 'Î\\ÕŒmCş‹¢/,­¡M‡'),(_binary 'h¦j}›FQœ\è\ãÖ«k','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra giá»¯a kÃ¬\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-11 00:02:43.569231',_binary '',_binary '€Ÿ«52IG·€¶g¹{·','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-11 00:02:43.569231',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary 'qÑŒ\á\ÇI¿«\Êİç¿’\ß','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-11 00:02:45.017474',_binary '',_binary 'Uøˆœt©L_¨d33üÀ^','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-11 00:02:45.017474',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '|QÓ·Lô˜\Û2\ÜP\Î','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"BÃ i táº­p test\" vÃ o khÃ³a há»c \"Láº­p TrÃ¬nh C#\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-08 09:58:25.003992',_binary '\0',_binary 'kÒ”³¢NŠhn`ÿO	¤','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-08 09:58:25.003992',_binary '’ò\ÏL\Û\rFÀ«ÉŠˆ!Pg'),(_binary '}\ÑpôJ3lü\àN!u','GiÃ¡o viÃªn Ä‘Ã£ thÃªm bÃ i há»c \"21312\" vÃ o khÃ³a há»c \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o há»c ngay nhÃ©!','2025-12-25 23:48:09.924356',_binary '',_binary '&\æ_Gg\åL\í²²5®_”4','COURSE','BÃ i há»c má»›i Ä‘Ã£ Ä‘Æ°á»£c thÃªm vÃ o khÃ³a há»c','COURSE_UPDATE','2025-12-25 23:48:09.924356',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '…iĞœ—oLù‚\\ô	u\Î4\Å','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra giá»¯a kÃ¬\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-10 23:17:50.121376',_binary '',_binary '€Ÿ«52IG·€¶g¹{·','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-10 23:17:50.121376',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary '…Ö¬\î\îG¢1±\í','Há»c viÃªn dat123 Ä‘Ã£ mua khÃ³a há»c \"Láº­p TrÃ¬nh C#\" cá»§a báº¡n.','2025-12-06 21:24:05.885681',_binary '',_binary 'kÒ”³¢NŠhn`ÿO	¤','COURSE','Há»c viÃªn má»›i Ä‘Ã£ mua khÃ³a há»c','COURSE_ENROLLMENT','2025-12-06 21:24:05.885681',_binary 'f\Êø•\ÏE¦J\Òõ”6r'),(_binary '®\Å<\éŠG¤\ë;\È e^\è','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra giá»¯a kÃ¬\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-10 23:26:25.699598',_binary '',_binary '€Ÿ«52IG·€¶g¹{·','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-10 23:26:25.699598',_binary 'R?À!¯AWŸ(q‰X\"\Ëó'),(_binary 'Ë’-R\äÁHy™|®š &÷','ÄÃ£ cÃ³ Ä‘á» thi \"Kiá»ƒm tra giá»¯a kÃ¬\" cho khÃ³a \"Kiáº¿n Thá»©c Nháº­p MÃ´n IT\". HÃ£y vÃ o lÃ m bÃ i!','2025-12-11 00:02:42.450375',_binary '',_binary '€Ÿ«52IG·€¶g¹{·','EXAM','KhÃ³a há»c cÃ³ Ä‘á» thi má»›i','EXAM_PUBLISHED','2025-12-11 00:02:42.450375',_binary 'R?À!¯AWŸ(q‰X\"\Ëó');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
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
