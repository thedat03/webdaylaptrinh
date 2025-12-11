package com.example.webdaylaptrinh.service;

import com.example.webdaylaptrinh.dto.*;
import com.example.webdaylaptrinh.entity.Lesson;
import com.example.webdaylaptrinh.enums.LessonType;
import com.example.webdaylaptrinh.repository.LessonRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CodeExecutionService {

    private final LessonRepository lessonRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${judge0.base-url:https://ce.judge0.com}")
    private String judge0BaseUrl;

    @Value("${judge0.auth-token:}")
    private String judge0AuthToken;

    public CodeRunResponse executeLessonCode(UUID lessonId, CodeRunRequest request) {
        CodeRunResponse errorResponse = new CodeRunResponse();
        errorResponse.setOverallPassed(false);
        errorResponse.setResults(Collections.emptyList());

        Lesson lesson = lessonRepository.findById(lessonId).orElse(null);
        if (lesson == null) {
            errorResponse.setError("Không tìm thấy bài học");
            return errorResponse;
        }

        if (lesson.getType() != LessonType.CODE) {
            errorResponse.setError("Bài học này không hỗ trợ chạy code");
            return errorResponse;
        }

        if (!StringUtils.hasText(request.getSourceCode())) {
            errorResponse.setError("Vui lòng cung cấp mã nguồn");
            return errorResponse;
        }

        if (lesson.getCodeLanguageId() == null) {
            errorResponse.setError("Bài học chưa được cấu hình ngôn ngữ Judge0. Vui lòng liên hệ admin để cấu hình.");
            return errorResponse;
        }

        List<CodeTestCase> testCases = loadTestCases(lesson);
        if (CollectionUtils.isEmpty(testCases)) {
            errorResponse.setError("Bài học chưa có test case để kiểm tra. Vui lòng liên hệ admin để cấu hình.");
            return errorResponse;
        }

        List<TestCaseResult> results = new ArrayList<>();
        for (int i = 0; i < testCases.size(); i++) {
            CodeTestCase testCase = testCases.get(i);
            TestCaseResult result = executeSingleTest(
                    testCase,
                    request.getSourceCode(),
                    lesson.getCodeLanguageId(),
                    i
            );
            results.add(result);
        }

        boolean overallPassed = results.stream().allMatch(TestCaseResult::isPassed);
        CodeRunResponse response = new CodeRunResponse();
        response.setOverallPassed(overallPassed);
        response.setResults(results);
        response.setMessage(overallPassed ? "Tất cả test case đã vượt qua" : "Một số test case chưa đạt");
        return response;
    }

    /**
     * Chạy code ad-hoc cho danh sách test case (dùng cho bài thi code).
     */
    public List<TestCaseResult> executeAdhocCode(Integer languageId, String sourceCode, List<CodeTestCase> testCases) {
        List<TestCaseResult> results = new ArrayList<>();
        for (int i = 0; i < testCases.size(); i++) {
            CodeTestCase testCase = testCases.get(i);
            TestCaseResult result = executeSingleTest(
                    testCase,
                    sourceCode,
                    languageId,
                    i
            );
            results.add(result);
        }
        return results;
    }

    private List<CodeTestCase> loadTestCases(Lesson lesson) {
        if (!StringUtils.hasText(lesson.getCodeTestCases())) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(
                    lesson.getCodeTestCases(),
                    new TypeReference<List<CodeTestCase>>() {
                    }
            );
        } catch (Exception ex) {
            throw new IllegalStateException("Không thể đọc test case: " + ex.getMessage(), ex);
        }
    }

    private TestCaseResult executeSingleTest(CodeTestCase testCase, String sourceCode, Integer languageId, int index) {
        String url = buildSubmissionUrl();
        Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("language_id", languageId);
        payload.put("source_code", sourceCode);
        if (StringUtils.hasText(testCase.getStdin())) {
            payload.put("stdin", testCase.getStdin());
        }
        if (StringUtils.hasText(testCase.getExpectedOutput())) {
            payload.put("expected_output", testCase.getExpectedOutput());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Judge0 CE: X-Auth-Token chỉ cần nếu admin bật authentication
        if (StringUtils.hasText(judge0AuthToken)) {
            headers.set("X-Auth-Token", judge0AuthToken);
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        TestCaseResult result = new TestCaseResult();
        result.setName(StringUtils.hasText(testCase.getName()) ? testCase.getName() : "Test " + (index + 1));
        result.setExpectedOutput(testCase.getExpectedOutput());
        result.setInput(testCase.getStdin());
        result.setHidden(testCase.isHidden());

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    JsonNode.class
            );

            JsonNode body = response.getBody();
            if (body != null) {
                int statusId = body.path("status").path("id").asInt(-1);
                String statusDesc = body.path("status").path("description").asText("Unknown");
                result.setStatus(statusDesc);
                // Status ID 3 = Accepted (passed), các status khác = failed
                result.setPassed(statusId == 3);
                result.setStdout(body.path("stdout").asText(null));
                result.setStderr(body.path("stderr").asText(null));
                result.setCompileOutput(body.path("compile_output").asText(null));
                if (body.hasNonNull("time")) {
                    result.setTime(body.get("time").asDouble());
                }
                if (body.hasNonNull("memory")) {
                    result.setMemory(body.get("memory").asDouble());
                }
            } else {
                result.setStatus("No response from Judge0");
                result.setPassed(false);
            }
        } catch (org.springframework.web.client.RestClientException e) {
            result.setStatus("Lỗi kết nối Judge0: " + e.getMessage());
            result.setPassed(false);
            result.setStderr("Không thể kết nối đến Judge0 CE. Vui lòng thử lại sau.");
        } catch (Exception e) {
            result.setStatus("Lỗi không xác định: " + e.getMessage());
            result.setPassed(false);
            result.setStderr("Đã xảy ra lỗi khi chạy code: " + e.getMessage());
        }

        return result;
    }

    private String buildSubmissionUrl() {
        String base = judge0BaseUrl != null ? judge0BaseUrl.trim() : "https://ce.judge0.com";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/submissions?base64_encoded=false&wait=true";
    }
}

