package com.example.webdaylaptrinh.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Service để tích hợp với Google Gemini API để chấm bài tự động và tạo feedback
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final RestTemplateBuilder restTemplateBuilder;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:AIzaSyC-cSMeQupiFKWB8zMBRn0LOJ4ImqOGeiA}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.enabled:true}")
    private boolean enabled;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    /**
     * Chấm bài và tạo feedback cho một câu hỏi
     * 
     * @param questionPrompt Nội dung câu hỏi
     * @param questionType Loại câu hỏi (MCQ hoặc CODE)
     * @param correctAnswer Đáp án đúng
     * @param studentAnswer Đáp án của học viên
     * @param isCorrect Đã đúng hay chưa (từ test case)
     * @param testResults Kết quả test case (nếu là câu hỏi code)
     * @return Feedback từ Gemini
     */
    public String gradeAndProvideFeedback(
            String questionPrompt,
            String questionType,
            String correctAnswer,
            String studentAnswer,
            boolean isCorrect,
            String testResults
    ) {
        if (!enabled) {
            log.warn("Gemini API is disabled");
            return generateDefaultFeedback(isCorrect, questionType);
        }
        
        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.error("Gemini API key is not configured! Please set gemini.api-key in application.properties");
            return generateDefaultFeedback(isCorrect, questionType);
        }

        try {
            log.info("Generating feedback for question type: {}, isCorrect: {}", questionType, isCorrect);
            String prompt = buildPrompt(questionPrompt, questionType, correctAnswer, studentAnswer, isCorrect, testResults);
            String response = callGeminiAPI(prompt);
            if (response != null && !response.trim().isEmpty()) {
                log.info("Successfully generated feedback, length: {}", response.length());
                return response;
            } else {
                log.warn("Gemini API returned empty response, using default feedback");
                return generateDefaultFeedback(isCorrect, questionType);
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API for feedback generation", e);
            // Trả về feedback mặc định kèm thông báo lỗi
            String defaultFeedback = generateDefaultFeedback(isCorrect, questionType);
            return defaultFeedback + "\n\n[Lưu ý: Không thể tạo feedback từ AI. Lỗi: " + e.getMessage() + "]";
        }
    }

    /**
     * Xây dựng prompt cho Gemini
     */
    private String buildPrompt(
            String questionPrompt,
            String questionType,
            String correctAnswer,
            String studentAnswer,
            boolean isCorrect,
            String testResults
    ) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là một giáo viên chấm bài kiểm tra lập trình. Hãy đánh giá câu trả lời của học viên và đưa ra nhận xét, lời khuyên cụ thể.\n\n");
        
        prompt.append("Câu hỏi: ").append(questionPrompt).append("\n\n");
        prompt.append("Loại câu hỏi: ").append(questionType.equals("MCQ") ? "Trắc nghiệm" : "Lập trình").append("\n\n");

        if ("MCQ".equals(questionType)) {
            prompt.append("Đáp án đúng: ").append(correctAnswer).append("\n");
            prompt.append("Đáp án học viên chọn: ").append(studentAnswer != null ? studentAnswer : "Chưa trả lời").append("\n");
            prompt.append("Kết quả: ").append(isCorrect ? "ĐÚNG" : "SAI").append("\n\n");
        } else {
            prompt.append("Đáp án mẫu (tham khảo): ").append(correctAnswer != null ? correctAnswer : "Không có").append("\n");
            prompt.append("Code của học viên:\n").append(studentAnswer != null ? studentAnswer : "Chưa có code").append("\n\n");
            if (testResults != null && !testResults.trim().isEmpty()) {
                prompt.append("Kết quả test case:\n").append(testResults).append("\n\n");
            }
            prompt.append("Kết quả: ").append(isCorrect ? "ĐÚNG" : "SAI").append("\n\n");
        }

        prompt.append("Hãy đưa ra:\n");
        prompt.append("1. Nhận xét về câu trả lời (ngắn gọn, 2-3 câu)\n");
        prompt.append("2. Điểm mạnh (nếu có)\n");
        prompt.append("3. Điểm cần cải thiện (nếu có)\n");
        prompt.append("4. Lời khuyên cụ thể để học viên cải thiện\n");
        prompt.append("5. Gợi ý học tập (nếu sai)\n\n");
        prompt.append("Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, khuyến khích học viên.");

        return prompt.toString();
    }

    /**
     * Gọi Gemini API
     */
    private String callGeminiAPI(String prompt) {
        try {
            RestTemplate restTemplate = restTemplateBuilder.build();
            String url = String.format(GEMINI_API_URL, model, apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            
            List<Map<String, Object>> parts = new ArrayList<>();
            parts.add(part);
            content.put("parts", parts);
            
            List<Map<String, Object>> contents = new ArrayList<>();
            contents.add(content);
            requestBody.put("contents", contents);

            // Cấu hình generation config - không giới hạn thời gian nghĩ của AI
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topK", 40);
            generationConfig.put("topP", 0.95);
            // Tăng maxOutputTokens lên 8192 để AI có thể trả lời chi tiết hơn
            generationConfig.put("maxOutputTokens", 8192);
            requestBody.put("generationConfig", generationConfig);
            
            log.info("Calling Gemini API with model: {}, prompt length: {}", model, prompt.length());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            log.debug("Gemini API Request URL: {}", url.replace(apiKey, "***"));
            try {
                log.debug("Gemini API Request Body: {}", objectMapper.writeValueAsString(requestBody).replace(apiKey, "***"));
            } catch (Exception e) {
                log.debug("Gemini API Request Body: [Unable to serialize]");
            }

            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            log.info("Gemini API Response Status: {}", response.getStatusCode());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String extractedText = extractTextFromResponse(response.getBody());
                if (extractedText != null) {
                    log.info("Successfully extracted feedback from Gemini, length: {}", extractedText.length());
                    return extractedText;
                } else {
                    try {
                        log.error("Failed to extract text from Gemini response. Response body: {}", 
                            objectMapper.writeValueAsString(response.getBody()));
                    } catch (Exception e) {
                        log.error("Failed to extract text from Gemini response. Response body: [Unable to serialize]");
                    }
                    throw new RuntimeException("Không thể trích xuất text từ response của Gemini API");
                }
            } else {
                String errorMessage = "Gemini API returned error status: " + response.getStatusCode();
                if (response.getBody() != null) {
                    try {
                        errorMessage += ", Response: " + objectMapper.writeValueAsString(response.getBody());
                    } catch (Exception e) {
                        errorMessage += ", Response body: " + response.getBody().toString();
                    }
                }
                log.error(errorMessage);
                throw new RuntimeException(errorMessage);
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String errorMessage = "HTTP Error calling Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
            log.error(errorMessage, e);
            throw new RuntimeException(errorMessage, e);
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            String errorMessage = "Server Error calling Gemini API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
            log.error(errorMessage, e);
            throw new RuntimeException(errorMessage, e);
        } catch (Exception e) {
            String errorMessage = "Unexpected error calling Gemini API: " + e.getMessage();
            log.error(errorMessage, e);
            throw new RuntimeException(errorMessage, e);
        }
    }

    /**
     * Trích xuất text từ response của Gemini
     */
    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            // Kiểm tra lỗi trong response
            if (response.containsKey("error")) {
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                String errorMessage = "Gemini API Error: " + error.get("message");
                if (error.containsKey("code")) {
                    errorMessage += " (Code: " + error.get("code") + ")";
                }
                log.error(errorMessage);
                throw new RuntimeException(errorMessage);
            }
            
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                try {
                    log.error("No candidates in Gemini response. Full response: {}", 
                        objectMapper.writeValueAsString(response));
                } catch (Exception e) {
                    log.error("No candidates in Gemini response. Full response: [Unable to serialize]");
                }
                throw new RuntimeException("Gemini API không trả về candidates");
            }
            
            Map<String, Object> candidate = candidates.get(0);
            
            // Kiểm tra finishReason
            if (candidate.containsKey("finishReason")) {
                String finishReason = (String) candidate.get("finishReason");
                if (!"STOP".equals(finishReason)) {
                    log.warn("Gemini finish reason: {}", finishReason);
                    if ("MAX_TOKENS".equals(finishReason)) {
                        log.warn("Response was truncated due to max tokens limit");
                    }
                }
            }
            
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            if (content == null) {
                try {
                    log.error("No content in candidate. Candidate: {}", 
                        objectMapper.writeValueAsString(candidate));
                } catch (Exception e) {
                    log.error("No content in candidate. Candidate: [Unable to serialize]");
                }
                throw new RuntimeException("Gemini API không trả về content");
            }
            
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                try {
                    log.error("No parts in content. Content: {}", 
                        objectMapper.writeValueAsString(content));
                } catch (Exception e) {
                    log.error("No parts in content. Content: [Unable to serialize]");
                }
                throw new RuntimeException("Gemini API không trả về parts");
            }
            
            String text = (String) parts.get(0).get("text");
            if (text == null || text.trim().isEmpty()) {
                try {
                    log.error("Text is null or empty in parts. Parts: {}", 
                        objectMapper.writeValueAsString(parts));
                } catch (Exception e) {
                    log.error("Text is null or empty in parts. Parts: [Unable to serialize]");
                }
                throw new RuntimeException("Gemini API trả về text rỗng");
            }
            
            return text;
        } catch (RuntimeException e) {
            throw e; // Re-throw RuntimeException
        } catch (Exception e) {
            try {
                log.error("Error extracting text from Gemini response. Response: {}", 
                    objectMapper.writeValueAsString(response), e);
            } catch (Exception ex) {
                log.error("Error extracting text from Gemini response. Response: [Unable to serialize]", e);
            }
            throw new RuntimeException("Lỗi khi trích xuất text từ response: " + e.getMessage(), e);
        }
    }

    /**
     * Tạo feedback mặc định khi Gemini API không khả dụng
     */
    private String generateDefaultFeedback(boolean isCorrect, String questionType) {
        if (isCorrect) {
            return "Chúc mừng! Bạn đã trả lời đúng. Hãy tiếp tục phát huy!";
        } else {
            if ("CODE".equals(questionType)) {
                return "Câu trả lời chưa đúng. Hãy xem lại logic và cú pháp code. Thử chạy lại với các test case để kiểm tra.";
            } else {
                return "Câu trả lời chưa đúng. Hãy xem lại kiến thức và thử lại!";
            }
        }
    }
}

