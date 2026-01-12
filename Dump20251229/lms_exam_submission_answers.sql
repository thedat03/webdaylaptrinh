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
-- Table structure for table `exam_submission_answers`
--

DROP TABLE IF EXISTS `exam_submission_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exam_submission_answers` (
  `id` binary(16) NOT NULL,
  `auto_result` varchar(4000) DEFAULT NULL,
  `code_answer` varchar(8000) DEFAULT NULL,
  `passed` bit(1) NOT NULL,
  `score` double DEFAULT NULL,
  `selected_option` varchar(255) DEFAULT NULL,
  `question_id` binary(16) DEFAULT NULL,
  `submission_id` binary(16) DEFAULT NULL,
  `feedback` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5ew2pp7bxr83udp1jtovpdtas` (`question_id`),
  KEY `FKadartk7klfosvwfsi10dqxr53` (`submission_id`),
  CONSTRAINT `FK5ew2pp7bxr83udp1jtovpdtas` FOREIGN KEY (`question_id`) REFERENCES `exam_questions` (`id`),
  CONSTRAINT `FKadartk7klfosvwfsi10dqxr53` FOREIGN KEY (`submission_id`) REFERENCES `exam_submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_submission_answers`
--

LOCK TABLES `exam_submission_answers` WRITE;
/*!40000 ALTER TABLE `exam_submission_answers` DISABLE KEYS */;
INSERT INTO `exam_submission_answers` VALUES (_binary '\0��R\�LÈ�!E\�X�',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '�\���B�����=0�','Chào em,\n\nDưới đây là nhận xét về câu trả lời của em:\n\n1.  **Nhận xét về câu trả lời:**\n    Em đã chọn đáp án hoàn toàn chính xác. Điều này cho thấy em có kiến thức cơ bản vững chắc về C#.\n\n2.  **Điểm mạnh:**\n    *   Nắm vững khái niệm cơ bản về C#.\n    *   Khả năng nhận diện thông tin chính xác trong các lựa chọn.\n\n3.  **Điểm cần cải thiện:**\n    Đối với câu hỏi trắc nghiệm cơ bản như thế này, việc chọn đúng là rất tốt. Tuy nhiên, để thực sự hiểu sâu, em có thể tìm hiểu thêm về các đặc điểm nổi bật và ứng dụng của C#.\n\n4.  **Lời khuyên cụ thể để học viên cải thiện:**\n    Đừng chỉ dừng lại ở việc biết C# là gì, hãy tìm hiểu thêm về: các tính năng chính (như hướng đối tượng, quản lý bộ nhớ tự động), môi trường phát triển (Visual Studio, .NET), và các lĩnh vực ứng dụng phổ biến của C# (như phát triển web với ASP.NET, ứng dụng desktop, game với Unity).\n\n5.  **Gợi ý học tập (nếu sai):**\n    Vì em đã trả lời đúng, phần này không áp dụng. Hãy tiếp tục phát huy!\n\nChúc em học tốt và tiếp tục khám phá nhiều điều thú vị về lập trình C#!'),(_binary '�I�\�\�Mz�0�\0׬',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '�c%ťF\r�!2Rkۣ','Chúc mừng! Bạn đã trả lời đúng. Hãy tiếp tục phát huy!'),(_binary '4^�\�uD���<\"���,','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '\'�{AwM%���4$\�',NULL),(_binary 'g\�}aQO���;or�','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '3\���lK\�ތQ\�$\n*',NULL),(_binary '�iB=Hu�\�Y\��\�\�','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary ':>!5�yG��L[�	Ƀ�',NULL),(_binary '\Z@\�\�Du��D�M��\0',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '%[�\�XBF��*.\��cl','Chào bạn,\n\nDưới đây là nhận xét của tôi về câu trả lời của bạn:\n\n1.  **Nhận xét về câu trả lời:**\n    Bạn đã trả lời chính xác'),(_binary '?W\�%)�CF��-�fs�0','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '+�]�I\n�7)�0QCA',NULL),(_binary 'H\�:\�.�Cܜ�W\�ɵ|','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '�c%ťF\r�!2Rkۣ',NULL),(_binary 'O\�A�FЍ$H�D\���',NULL,NULL,_binary '\0',0,'3',_binary '�|F�Fd��\�\�W�',_binary '�s�A^LH��5\0a\�',NULL),(_binary '[�\�\�G��\�B\�w.\�5',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '\�\� ��1F8����`\�F',NULL),(_binary '`{��e�J9�$�܍\�7','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '�\�p�\�H���-t$>�',NULL),(_binary 'd�4TN�����ƞfn',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '\�\�9!;M���*䍵#\�',NULL),(_binary 'hm�B��H���楤l�',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary ':>!5�yG��L[�	Ƀ�','Chào bạn,\n\nDưới đây là nhận xét về câu trả lời của bạn:\n\n1.  **Nhận xét về câu trả lời:**\n    Bạn đã trả lời chính xác câu'),(_binary 'qU6I\�pM寧`$n��\"',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '�\�\�`�Aٰ�\�@�\��\�','Chào em,\n\nChúc mừng em đã trả lời đúng câu hỏi này!\n\n1.  **Nhận xét về câu trả lời:**\n    Em đã trả lời đúng câu hỏi về C#. Điều này cho thấy em có kiến thức cơ bản vững chắc về ngôn ngữ lập trình này, một nền tảng rất quan trọng khi bắt đầu học lập trình.\n\n2.  **Điểm mạnh:**\n    *   Nắm vững kiến thức cơ bản và định nghĩa chính xác về C#.\n    *   Hiểu đúng về bản chất của ngôn ngữ lập trình C#.\n\n3.  **Điểm cần cải thiện:**\n    *   Với câu hỏi trắc nghiệm, khó để đánh giá độ sâu hiểu biết. Tuy nhiên, em có thể tìm hiểu thêm về các đặc điểm nổi bật hoặc ứng dụng của C# để có cái nhìn toàn diện hơn.\n\n4.  **Lời khuyên cụ thể để học viên cải thiện:**\n    *   Đừng chỉ dừng lại ở định nghĩa, hãy thử tìm hiểu C# được dùng để làm gì trong thực tế (ví dụ: phát triển ứng dụng desktop, web với ASP.NET, game với Unity, hoặc ứng dụng di động với Xamarin/MAUI).\n    *   Đọc thêm về lịch sử ra đời, người tạo ra C# (Anders Hejlsberg) và những đặc trưng chính của ngôn ngữ này (hướng đối tượng, an toàn kiểu, quản lý bộ nhớ tự động).\n\n5.  **Gợi ý học tập (nếu sai):**\n    *   *Không áp dụng trong trường hợp này vì em đã trả lời đúng.*'),(_binary '~\�PVZkM��bu$\�z�',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '�\�p�\�H���-t$>�',NULL),(_binary '���\�\�M>��Wl\�\�C','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '%[�\�XBF��*.\��cl',NULL),(_binary '�e|w\�E��T��\��:�',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '��\Z\�mMȪS��\�Ve','Chào bạn,\n\nDưới đây là nhận xét về câu trả lời của bạn:\n\n---\n\n**1. Nhận xét về câu trả lời:**\nBạn đã trả lời chính xác câu hỏi về C#. Điều này cho thấy bạn nắm vững kiến thức cơ bản về ngôn ngữ lập trình quan trọng này.\n\n**2. Điểm mạnh:**\nBạn đã nắm vững định nghĩa cơ bản về C#, đây là một nền tảng tốt để bắt đầu học lập trình với ngôn ngữ này.\n\n**3. Điểm cần cải thiện:**\nĐối với câu hỏi trắc nghiệm này, không có điểm cần cải thiện về độ chính xác. Tuy nhiên, bạn có thể mở rộng kiến thức bằng cách tìm hiểu sâu hơn về các đặc điểm nổi bật và ứng dụng của C#.\n\n**4. Lời khuyên cụ thể để cải thiện:**\nHãy tìm hiểu sâu hơn về các đặc điểm nổi bật của C# như: là một ngôn ngữ lập trình hướng đối tượng (OOP), hoạt động trên nền tảng .NET, khả năng ứng dụng đa dạng (phát triển web, desktop, game với Unity). Điều này sẽ giúp bạn có cái nhìn toàn diện hơn.\n\n**5. Gợi ý học tập:**\n(Không áp dụng vì câu trả lời đúng)\n\n---\nChúc mừng bạn đã trả lời đúng! Hãy tiếp tục phát huy tinh thần học hỏi này nhé.'),(_binary '�FP(�JK�l$i\�[4$','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '.`]>\��L��@f~����',NULL),(_binary '��\\�	\�Em�%�n\����',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '\'�{AwM%���4$\�','Chào em,\n\nDưới đây là nhận xét của thầy về câu trả lời của em:\n\n---\n\n**1. Nhận xét về câu trả lời:**\nEm đã trả lời chính xác câu hỏi về định nghĩa của C#. Đây là một kiến thức cơ bản và rất quan trọng khi bắt đầu học lập trình với C#.\n\n**2. Điểm mạnh:**\nEm nắm vững kiến thức cơ bản về C#, điều này rất cần thiết để xây dựng nền tảng vững chắc cho các bài học tiếp theo.\n\n**3. Điểm cần cải thiện:**\nVới câu hỏi này, em đã trả lời đúng nên không có điểm cần cải thiện cụ thể.\n\n**4. Lời khuyên cụ thể để học viên cải thiện:**\nHãy tiếp tục duy trì sự hiểu biết vững chắc về các khái niệm cơ bản. Em có thể tìm hiểu sâu hơn về lịch sử ra đời, các đặc điểm nổi bật và những ứng dụng phổ biến của C# để có cái nhìn toàn diện hơn.\n\n**5. Gợi ý học tập (nếu sai):**\nEm đã trả lời đúng nên không cần gợi ý học tập trong trường hợp này.\n\n---\n\nChúc mừng em đã hoàn thành tốt câu hỏi này! Hãy tiếp tục phát huy nhé.'),(_binary '��_�\'@O��~�1�\��','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '�\���B�����=0�',NULL),(_binary '��h��\"A�����Y\��5',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '.`]>\��L��@f~����','Chào bạn,\n\nBạn đã trả lời đúng câu hỏi này! Điều này cho thấy bạn nắm vững kiến thức cơ bản về C#.\n\n1.  **Nhận xét về câu trả lời:**\n    Bạn đã chọn đúng đáp án, thể hiện sự hiểu biết chính xác về định nghĩa cơ bản của C#. Đây là một khởi đầu tốt để tiếp tục tìm hiểu sâu hơn về ngôn ngữ này.\n\n2.  **Điểm mạnh:**\n    *   Nắm vững định nghĩa cơ bản và chính xác về C#.\n    *   Có kiến thức nền tảng vững chắc về ngôn ngữ lập trình này.\n\n3.  **Điểm cần cải thiện:**\n    Đối với một câu hỏi trắc nghiệm đúng, không có điểm cần cải thiện trực tiếp về câu trả lời này. Tuy nhiên, luôn có thể đào sâu kiến thức hơn nữa.\n\n4.  **Lời khuyên cụ thể để học viên cải thiện:**\n    Để không chỉ biết C# là gì mà còn hiểu sâu sắc, hãy tìm hiểu thêm về:\n    *   **Các đặc điểm nổi bật của C#**: Ví dụ như là ngôn ngữ hướng đối tượng, an toàn kiểu (type-safe), có cơ chế quản lý bộ nhớ tự động (Garbage Collection).\n    *   **Các nền tảng mà C# hỗ trợ**: Như phát triển ứng dụng Windows (WPF, WinForms), ứng dụng web (ASP.NET Core), ứng dụng di động (Xamarin/MAUI), và trò chơi (Unity).\n    *   **Thực hành**: Bắt đầu viết những đoạn mã C# đơn giản để củng cố kiến thức lý thuyết.\n\n5.  **Gợi ý học tập:**\n    Không áp dụng vì học viên đã trả lời đúng.\n\nTiếp tục phát huy nhé!'),(_binary '��^\r�tNK��\�q�鶵','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '�\�\�`�Aٰ�\�@�\��\�',NULL),(_binary '̬�	�PC����!C','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '\�\� ��1F8����`\�F',NULL),(_binary 'ћHB-\�JC��8\�1	J','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '\�\�9!;M���*䍵#\�',NULL),(_binary '\�H�j\\�DY���i�4\�M','[]','đâsd',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '�s�A^LH��5\0a\�',NULL),(_binary '\�\�h�\�B\'�/��y�\�?','[]','hi',_binary '\0',0,NULL,_binary '\�M\�yMꁎC[\�C�\�',_binary '��\Z\�mMȪS��\�Ve',NULL),(_binary '\���\�\�\�F%�3��\�\�Q',NULL,NULL,_binary '\0',0,'3',_binary '�|F�Fd��\�\�W�',_binary '+�]�I\n�7)�0QCA',NULL),(_binary '�\�� A~�\Z��\�`',NULL,NULL,_binary '',1,'1',_binary '�|F�Fd��\�\�W�',_binary '3\���lK\�ތQ\�$\n*','Chào bạn,\n\nBạn đã trả lời chính xác câu hỏi về C#. Đây là một kiến thức nền tảng rất quan trọng khi bắt đầu học lập trình với C#. Rất tốt!\n\n1');
/*!40000 ALTER TABLE `exam_submission_answers` ENABLE KEYS */;
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
