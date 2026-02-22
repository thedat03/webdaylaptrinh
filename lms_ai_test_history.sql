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
-- Table structure for table `ai_test_history`
--

DROP TABLE IF EXISTS `ai_test_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_test_history` (
  `id` binary(16) NOT NULL,
  `answers` text,
  `completed` bit(1) NOT NULL,
  `correct_code_exercises` int DEFAULT NULL,
  `correct_quiz_answers` int DEFAULT NULL,
  `difficulty` varchar(255) DEFAULT NULL,
  `max_score` double DEFAULT NULL,
  `num_code_exercises` int DEFAULT NULL,
  `num_quiz_questions` int DEFAULT NULL,
  `programming_language` varchar(255) DEFAULT NULL,
  `score` double DEFAULT NULL,
  `started_at` datetime(6) DEFAULT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `test_data` text,
  `topic` varchar(255) DEFAULT NULL,
  `total_code_exercises` int DEFAULT NULL,
  `total_quiz_questions` int DEFAULT NULL,
  `user_id` binary(16) DEFAULT NULL,
  `ai_feedback` text,
  `code_results` text,
  PRIMARY KEY (`id`),
  KEY `FKa9k5bh2pih75u4sipfgkrvr6w` (`user_id`),
  CONSTRAINT `FKa9k5bh2pih75u4sipfgkrvr6w` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_test_history`
--

LOCK TABLES `ai_test_history` WRITE;
/*!40000 ALTER TABLE `ai_test_history` DISABLE KEYS */;
INSERT INTO `ai_test_history` VALUES (_binary '8�OmIӬ\� \nMZB',NULL,_binary '\0',NULL,NULL,'BEGINNER',NULL,1,10,'javascript',NULL,'2025-12-21 09:12:52.369859',NULL,'{\"codingExercises\":[],\"quizQuestions\":[]}','array',0,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '&Ƈ\�J���\�yc s\�',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,1,10,'javascript',NULL,'2025-12-21 15:48:20.168784',NULL,'{\"testHistoryId\":null,\"codingExercises\":[{\"title\":\"Quản lý kho sản phẩm\",\"description\":\"Bạn được cung cấp một mảng các đối tượng sản phẩm. Mỗi đối tượng sản phẩm có các thuộc tính `id`, `name`, `price`, và `quantity`. Nhiệm vụ của bạn là viết một hàm để cập nhật số lượng của một sản phẩm cụ thể và tính tổng giá trị của tất cả sản phẩm trong kho.\",\"requirements\":\"Viết một hàm `manageInventory(products, productId, newQuantity)` nhận vào một mảng `products`, một `productId\",\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":\"\",\"solution\":\"\"}],\"quizQuestions\":[]}','object',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '+\�\�\�ԋA��a\�}NZm\�',NULL,_binary '\0',NULL,NULL,'BEGINNER',NULL,2,20,'python',NULL,'2025-12-21 09:24:52.814217',NULL,'{\"codingExercises\":[{\"title\":\"Quản lý Danh sách Sản phẩm\",\"description\":\"Bạn được yêu cầu viết một chương trình Python để thực hiện các thao tác cơ bản trên một danh sách các sản phẩm. Đây là một bài tập thực tế giúp bạn làm quen với việc quản lý dữ liệu trong\",\"requirements\":null,\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":null,\"solution\":null}],\"quizQuestions\":[]}','array',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary ',9�M��\���\�x\�',NULL,_binary '\0',NULL,NULL,'BEGINNER',NULL,NULL,NULL,'python',NULL,'2025-12-21 08:48:32.376247',NULL,'{\"codingExercises\":[],\"quizQuestions\":[]}','array',0,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '6�^C�lG^�\"\�&�u0',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,1,10,'javascript',NULL,'2025-12-21 14:29:17.491937',NULL,'{\"testHistoryId\":null,\"codingExercises\":[{\"title\":\"Hệ thống Quản lý Sản phẩm Đơn giản\",\"description\":\"Bạn được yêu cầu xây dựng một hệ thống quản lý sản phẩm cơ bản bằng JavaScript. Hệ thống này sẽ cho phép thêm sản phẩm mới, cập nhật thông tin sản phẩm, và lọc sản\",\"requirements\":null,\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":null,\"solution\":null}],\"quizQuestions\":[]}','',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary 'Mo\�K6=F�\�y��Z',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,4,10,'javascript',NULL,'2025-12-21 14:28:02.507898',NULL,'{\"testHistoryId\":null,\"codingExercises\":[{\"title\":\"Xử lý danh sách sản phẩm\",\"description\":\"Bạn được cung cấp một mảng các đối tượng sản phẩm. Mỗi đối tượng sản phẩm có các thuộc tính: `id` (số nguyên), `name` (chuỗi), `price` (số), và `\",\"requirements\":null,\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":null,\"solution\":null}],\"quizQuestions\":[]}','array',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary 'V!p��\�Hq��\\9ŷ�E',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,3,10,'javascript',NULL,'2025-12-21 15:32:24.104057',NULL,'{\"testHistoryId\":null,\"codingExercises\":[{\"title\":\"Lọc và Chuyển đổi Mảng Số\",\"description\":\"Viết một hàm `processNumbers` nhận vào một mảng các số nguyên. Hàm này cần lọc ra các số chẵn, sau đó nhân đôi giá trị của mỗi số chẵn đã lọc. Cuối cùng, trả về một mảng mới chứa các số đã được nhân đôi.\",\"requirements\":\"1. Hàm phải có tên `processNumbers` và nhận một tham số là `numbers` (một mảng số nguyên).\\n2. Chỉ giữ lại các số chẵn từ mảng đầu vào.\\n3. Nhân đôi giá trị của mỗi số chẵn đã lọc.\\n4. Trả về một mảng mới chứa các số đã được nhân đôi. Không được sửa đổi mảng đầu vào gốc.\",\"exampleInput\":\"[1, 2, 3, 4, 5, 6\",\"exampleOutput\":null,\"hints\":null,\"starterCode\":\"\",\"solution\":\"\"}],\"quizQuestions\":[{\"question\":\"Kết quả của đoạn code sau là gì?\\n```javascript\\nconst arr = [1, 2, 3];\\nconst newArr = arr.map(num => num * 2);\\nconsole.log(arr);\\n```\",\"options\":[\"`[1, 2, 3]`\",\"`[2, 4, 6]`\",\"`undefined`\",\"Lỗi\"],\"correctAnswerIndex\":0,\"explanation\":\"Phương thức `map()` tạo ra một mảng mới mà không làm thay đổi mảng gốc. Do đó, `arr` vẫn giữ nguyên giá trị ban đầu là `[1, 2, 3]`.\"},{\"question\":\"Để thêm một phần tử vào cuối mảng trong JavaScript mà không làm thay đổi mảng gốc (immutable), bạn nên sử dụng phương pháp nào?\",\"options\":[\"`arr.push(item)`\",\"`arr.concat(item)`\",\"`arr[arr.length] = item`\",\"`arr.splice(arr.length, 0, item)`\"],\"correctAnswerIndex\":1,\"explanation\":\"`arr.push(item)`, `arr[arr.length] = item` và `arr.splice()` đều thay đổi mảng gốc. Phương thức `arr.concat(item)` trả về một mảng mới chứa các phần tử của `arr` và `item` mà không làm thay đổi `arr`.\"},{\"question\":\"Phương thức `reduce()` của mảng trong JavaScript được sử dụng để làm gì?\",\"options\":[\"Lọc các phần tử dựa trên một điều kiện.\",\"Chuyển đổi mỗi phần tử trong mảng thành một giá trị mới.\",\"Thực thi một hàm cho mỗi phần tử trong mảng mà không trả về giá trị.\",\"Áp dụng một hàm cho một bộ tích lũy và mỗi phần tử trong mảng (từ trái sang phải) để giảm mảng thành một giá trị duy nhất.\"],\"correctAnswerIndex\":3,\"explanation\":\"`reduce()` là phương thức mạnh mẽ dùng để giảm (reduce) mảng về một giá trị duy nhất (có thể là một số, một đối tượng, một mảng, v.v.) bằng cách áp dụng một hàm callback qua mỗi phần tử.\"},{\"question\":\"Đoạn code nào sau đây sẽ trả về `true`?\",\"options\":[\"`[1, 2, 3].includes(4)`\",\"`[1, 2, 3].some(num => num > 2)`\",\"`[1, 2, 3].every(num => num > 0)`\",\"`[1, 2, 3].find(num => num === 0)`\"],\"correctAnswerIndex\":1,\"explanation\":\"`[1, 2, 3].some(num => num > 2)` trả về `true` vì có ít nhất một số (số 3) lớn hơn 2. `includes(4)` là `false`. `every(num => num > 0)` là `true` nhưng `every(num => num > 2)` là `false`. `find(num => num === 0)` sẽ trả về `undefined`.\"},{\"question\":\"Sự khác biệt chính giữa `slice()` và `splice()` khi làm việc với mảng là gì?\",\"options\":[\"`slice()` thay đổi mảng gốc, `splice()` thì không.\",\"`splice()` thay đổi mảng gốc, `slice()` thì không.\",\"Cả hai đều thay đổi mảng gốc nhưng có cú pháp khác nhau.\",\"Cả hai đều không thay đổi mảng gốc nhưng `slice()` trả về mảng con, `splice()` trả về phần tử bị xóa.\"],\"correctAnswerIndex\":1,\"explanation\":\"`slice()` trả về một mảng con mới mà không làm thay đổi mảng gốc. `splice()` thay đổi mảng gốc bằng cách thêm, xóa hoặc thay thế các phần tử.\"},{\"question\":\"Phương thức nào sau đây được sử dụng để lặp qua các phần tử của mảng và thực thi một hàm cho mỗi phần tử, nhưng không trả về một mảng mới và không thể dừng vòng lặp giữa chừng?\",\"options\":[\"`map()`\",\"`filter()`\",\"`forEach()`\",\"`reduce()`\"],\"correctAnswerIndex\":2,\"explanation\":\"`forEach()` thực thi một hàm cho mỗi phần tử. Nó không trả về giá trị và không có cách nào để dừng hoặc thoát khỏi vòng lặp ngoại trừ việc ném một ngoại lệ. `map()`, `filter()`, `reduce()` đều trả về một giá trị mới (mảng mới hoặc giá trị tích lũy).\"},{\"question\":\"Cho mảng `const arr = [[1, 2], [3, 4], [5, 6]];`. Để làm phẳng mảng này thành `[1, 2, 3, 4, 5, 6]`, bạn có thể sử dụng phương thức nào?\",\"options\":[\"`arr.flatten()`\",\"`arr.join(\',\')`\",\"`arr.reduce((acc, val) => acc.concat(val), [])`\",\"`arr.spread()`\"],\"correctAnswerIndex\":2,\"explanation\":\"Phương thức `arr.flat()` (ES2019) có thể được sử dụng, nhưng không có trong các tùy chọn. Cách phổ biến và tương thích hơn là sử dụng `reduce()` với `concat()` để làm phẳng mảng một cấp. Đáp án `arr.flatten()` không phải là cú pháp chuẩn của JavaScript.\"},{\"question\":\"Kết quả của `Array.isArray(\\\"hello\\\")` là gì?\",\"options\":[\"`true`\",\"`false`\",\"`undefined`\",\"Lỗi\"],\"correctAnswerIndex\":1,\"explanation\":\"`Array.isArray()` kiểm tra xem giá trị truyền vào có phải là một mảng hay không. \\\"hello\\\" là một chuỗi, không phải mảng, nên nó trả về `false`.\"},{\"question\":\"Cho đoạn code sau:\\n```javascript\\nconst arr = [10, 20, 30, 40];\\nconst [first, ...rest] = arr;\\nconsole.log(rest);\\n```\\nKết quả in ra console là gì?\",\"options\":[\"`[10]`\",\"`[20, 30, 40]`\",\"`[10, 20, 30, 40]`\",\"`undefined`\"],\"correctAnswerIndex\":1,\"explanation\":\"Đây là cú pháp destructuring assignment kết hợp với rest operator (`...`). `first` sẽ nhận giá trị `10`. `rest` sẽ là một mảng chứa các phần tử còn lại: `[20, 30, 40]`.\"},{\"question\":\"Bạn muốn xóa phần tử đầu tiên khỏi một mảng và lấy giá trị của nó. Phương thức nào phù hợp nhất và thay đổi mảng gốc?\",\"options\":[\"`arr.slice(1)`\",\"`arr.shift()`\",\"`arr.pop()`\",\"`arr.splice(0, 1)`\"],\"correctAnswerIndex\":1,\"explanation\":\"`arr.shift()` xóa phần tử đầu tiên của mảng và trả về phần tử đó, đồng thời thay đổi mảng gốc. `arr.slice(1)` tạo ra một mảng mới mà không thay đổi mảng gốc. `arr.pop()` xóa và trả về phần tử cuối cùng. `arr.splice(0, 1)` cũng xóa phần tử đầu tiên nhưng trả về một mảng chứa phần tử bị xóa.\"}]}','array',1,10,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '��8�\�.C���0X�<\�',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,1,10,'javascript',NULL,'2025-12-21 15:47:10.104502',NULL,'{\"testHistoryId\":null,\"codingExercises\":[{\"title\":\"Tổng hợp dữ liệu sản phẩm theo danh mục\",\"description\":\"Bạn được cung cấp một mảng các đối tượng sản phẩm. Mỗi đối tượng sản phẩm có các thuộc tính: `name` (tên sản phẩm), `category` (danh mục), `price` (giá), và `quantity` (số lượng). Nhiệm vụ của bạn là viết một hàm để tổng hợp dữ liệu này, nhóm các sản phẩm theo danh mục của chúng. Đối với mỗi danh mục, bạn cần tính tổng số lượng sản phẩm\",\"requirements\":null,\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":\"\",\"solution\":\"\"}],\"quizQuestions\":[]}','object',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '���\�\�&C0��\�\�(\�e',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,1,10,'javascript',NULL,'2025-12-21 09:06:30.146638',NULL,'{\"codingExercises\":[{\"title\":\"Phân tích Dữ liệu Đơn hàng\",\"description\":\"Bạn được giao nhiệm vụ xây dựng một hàm để phân tích dữ liệu từ một danh sách các đơn hàng. Mỗi đơn hàng bao gồm thông tin chi tiết về sản phẩm đã mua, trạng thái đơn hàng và thông tin\",\"requirements\":null,\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":null,\"solution\":null}],\"quizQuestions\":[]}','array',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '�,Z\�p\�BӔ+!\�-�\':',NULL,_binary '\0',NULL,NULL,'BEGINNER',NULL,3,20,'javascript',NULL,'2025-12-21 09:18:44.793730',NULL,'{\"codingExercises\":[{\"title\":\"Tính tổng các phần tử trong mảng\",\"description\":\"Viết một hàm có tên `sumArray` nhận vào một mảng các số nguyên và trả về tổng của tất cả các phần tử trong mảng đó.\",\"requirements\":\"- Hàm phải có\",\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":null,\"solution\":null}],\"quizQuestions\":[]}','array',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '�A�6{MȤ�a`_)�',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,4,10,'javascript',NULL,'2025-12-21 09:26:03.875428',NULL,'{\"codingExercises\":[{\"title\":\"Xử lý danh sách sản phẩm\",\"description\":\"Viết một hàm JavaScript nhận vào một mảng các đối tượng sản phẩm. Mỗi đối tượng sản phẩm có các thuộc tính \\\"id\\\" (số), \\\"name\\\" (chuỗi), \\\"price\\\" (số), và \\\"\",\"requirements\":null,\"exampleInput\":null,\"exampleOutput\":null,\"hints\":null,\"starterCode\":null,\"solution\":null}],\"quizQuestions\":[]}','',1,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '�\�AcٝLȯN�\�K9',NULL,_binary '\0',NULL,NULL,'BEGINNER',NULL,1,10,'javascript',NULL,'2025-12-21 09:01:53.183002',NULL,'{\"codingExercises\":[],\"quizQuestions\":[]}','array',0,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '\�\r\�WB��\�0�J\�',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,3,20,'python',NULL,'2025-12-21 09:07:48.388970',NULL,'{\"codingExercises\":[],\"quizQuestions\":[]}','array',0,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '\�t����A\�\�]N킕3',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,3,10,'javascript',NULL,'2025-12-21 14:29:51.026411',NULL,'{\"testHistoryId\":null,\"codingExercises\":[],\"quizQuestions\":[]}','',0,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL),(_binary '�\�.qC��/�\\(\�O',NULL,_binary '\0',NULL,NULL,'INTERMEDIATE',NULL,3,20,'python',NULL,'2025-12-21 14:27:26.132937',NULL,'{\"testHistoryId\":null,\"codingExercises\":[],\"quizQuestions\":[]}','array',0,0,_binary 'R?��!�AW�(q�X\"\��',NULL,NULL);
/*!40000 ALTER TABLE `ai_test_history` ENABLE KEYS */;
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
