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
  `watched_percentage` double DEFAULT NULL,
  `watched_seconds` int DEFAULT NULL,
  `video_duration` int DEFAULT NULL,
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
INSERT INTO `lesson_progress` VALUES (_binary 'p4\…K•Ñ\Z\Î\ÿ\¬w/\„','2025-12-29 09:48:39.383022',_binary '','2025-12-29 09:48:39.383022',_binary 'D\¬\»GÛ\ŸA\ÎÉ\ŸvJí2\»',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '\n\«˙lLG)õT1°≤@≥','2025-12-27 21:29:02.221297',_binary '','2025-12-27 21:29:02.221297',_binary 'ç\'P®\⁄\ËAûí\nHv\Í£\À',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '}æ.s\€Nä-r2\◊Fil',NULL,_binary '\0','2025-12-27 22:06:17.483425',_binary '-Öí*IwCQØ\—˝&∂ò<Æ',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'ù S®MA+çêˆsL*+',NULL,_binary '\0','2026-01-17 23:38:32.506591',_binary 'ª~Ùe5ˆN\'≤Aˆs\rlì=',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '9¸\Ëõ\‚\ËI∑¢9¬¥\ZÖó¡',NULL,_binary '\0','2026-01-18 16:40:35.214984',_binary '\¬°ªvÇC%Ω\ŸıßipM',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary '<j\ÍtöK\'§Ñµ £ª±Æ',NULL,_binary '\0','2026-01-18 15:02:12.094458',_binary 'πﬁ≤~^K–ø#y\‹\ÏF\0q',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary 'C?qùı\’M:¨Ûˇì\ƒ\“E','2026-01-18 17:18:21.328030',_binary '','2026-01-18 17:18:24.716210',_binary '∏DuõüLN,≠Ù6øúUw',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',72.41,21,NULL),(_binary 'HM}ºöLÉâxz)zF\ƒ',NULL,_binary '\0','2026-01-18 16:38:41.518305',_binary '\ÈÛ¡Å9ºAß\–0°\'\·ˇR',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary 'KHi{\ÍJYªPB6|¶\Ë\Â',NULL,_binary '\0','2026-01-17 23:50:09.469537',_binary 'Än=ûKµÖ∂˚åyâ$',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary 'O˝\n_\ÃMåò\Ã˙Wj#V',NULL,_binary '\0','2026-01-17 10:20:27.149960',_binary '˛≈Ø√ì\⁄Af†SÚs\Ï\œ\r',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@',NULL,NULL,NULL),(_binary 'QX\r©ó˚FˆßπZl8\»\»U','2025-12-27 21:35:14.168727',_binary '','2025-12-27 21:35:14.169727',_binary '\€{˛üºXKÆìD\ZˆOú',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'Reæq{çDç7\0\”\Â]\‚',NULL,_binary '\0','2026-01-17 23:49:55.663119',_binary 'nˆmyF÷á0f\Ï£⁄è',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary '`y\‰=∏îH¢¿ZyYJ',NULL,_binary '\0','2025-12-29 09:48:47.433957',_binary '˙\'ë\¬5Of≠YñObÄ\◊',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'd{ ¥ÄÚJôØe*\rı\√\Z','2025-12-29 09:48:31.014729',_binary '','2025-12-29 09:48:31.014729',_binary '\»u\…lF∞DÓëæÇ˝\Ã',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'hD6Ü&eEÆå\Ï\ÁQay','2025-12-27 21:35:04.443064',_binary '','2026-01-17 16:57:38.021177',_binary 'òÀæô\ÏG@&§ñcÆt\\\ﬂ6',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'ibg\ﬂ_C5î\…f¸∑⁄Æ\ﬁ','2025-12-29 09:48:33.917892',_binary '','2026-01-18 15:06:17.526095',_binary '∑Z!<:JF∑∂∫(ÇO\·˙',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'vì˝uó.N¡∞\0\’[o≥','2026-01-18 18:01:29.007898',_binary '','2026-01-18 18:01:29.008907',_binary 'x}b\r€ùE;ãö»¥ \È»ø',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',82.76,24,NULL),(_binary 'Ç¶J*\ÓBwπF˜ñµ\Zë',NULL,_binary '\0','2026-01-18 16:38:43.667469',_binary '\ ?/®HÖŸõ«Ñê\–˚',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'ÉÜ\Ã4GHk±\Ï\›lH7','2026-01-18 17:35:33.555627',_binary '','2026-01-24 14:02:14.859338',_binary '-\0∏[aM,Ω\’h¯n^ú',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',53.33,16,NULL),(_binary 'Öù\¬\Ì©\ÁJ‘§m ı\r\Ô˘','2025-12-29 09:49:04.291690',_binary '','2025-12-29 09:49:04.291690',_binary '9°\n\n;\ Eºº@\∆S}',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary 'àˇãIöVx;¶µ','2026-01-18 16:07:48.236730',_binary '','2026-01-21 23:01:53.905576',_binary '\ÿMo}˚!MÖ©2õ\»eà',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',90.08264462809917,109,NULL),(_binary 'öÙå\’M@ëï@˛•~µ','2026-01-18 15:29:33.327401',_binary '','2026-01-18 15:29:33.327401',_binary '\Œ¿\‰XπDI!π ß\‰>¡',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary 'ß∏˚.\¬\ÁBVΩé)k+F¢/',NULL,_binary '\0','2026-01-17 10:21:30.608455',_binary '\ÃO÷ÜµN€âs$I]~ê',_binary 'Zx\»˚øgGJÜ±,Û\Óô\ƒ@',NULL,NULL,NULL),(_binary '∂üKs≤EÈù∑`ã\œB¯',NULL,_binary '\0','2026-01-13 11:17:40.008033',_binary 'öÒnÅàL_§Z\Ï.\ÃD\‚`',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '\≈”∑º\·3Joí_l≠¯â\⁄','2025-12-27 21:29:29.199460',_binary '','2026-01-16 21:21:32.111687',_binary '˛≈Ø√ì\⁄Af†SÚs\Ï\œ\r',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '∆êúã\\\⁄A†!Bõ\–k¶','2026-01-18 17:32:55.464544',_binary '','2026-01-18 17:33:06.588253',_binary '\'\Ã\0\›/G\·á˚÷É\—2',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',51.72,15,NULL),(_binary '\Õ7¿X°\¬M5úã`\·õ:\€',NULL,_binary '\0','2026-01-18 16:47:36.155016',_binary 'e T\Ìª\ÕB\Áö[)ñ\¬Gò˛',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary '\œ(FB’∏®[≤d\≈',NULL,_binary '\0','2026-01-18 16:38:45.843817',_binary 'ú(≤πLI÷†™¸Qı‹ÜÑ',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '\Ê\’õ¶Nz±8\ﬂG-E¨~','2025-12-27 21:35:09.829205',_binary '','2025-12-27 21:35:09.829205',_binary '∞{;tkCª¶˙c%d ^\—',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL),(_binary '\Ì=k\\\\\ÁAÿÄ7∑2¯',NULL,_binary '\0','2026-01-17 23:49:58.073312',_binary '\ﬂ\—\'y\·jLxÄ\‰\ÍE]1Ñ',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',0,0,NULL),(_binary 'Òp<¯™KR™≠m3¡ŒÆ0','2026-01-18 17:48:57.679724',_binary '','2026-01-18 17:48:57.679724',_binary 'áI^ôA6ås\–W∏Ûë',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',51.72,15,NULL),(_binary 'Òä8æx@p©_ó@5‹∞','2026-01-18 17:46:41.366632',_binary '','2026-01-18 17:47:36.645708',_binary '\◊Ûà…£Bpñfz&}G¯Ù',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',51.72,15,NULL),(_binary '˝,ä4ı7Oñú??ó	d\‡','2025-12-27 21:29:07.208860',_binary '','2026-01-18 17:46:23.233417',_binary '\ÃO÷ÜµN€âs$I]~ê',_binary 'R?¿ç!ØAWü(qâX\"\ÀÛ',NULL,NULL,NULL);
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

-- Dump completed on 2026-01-24 16:27:09
