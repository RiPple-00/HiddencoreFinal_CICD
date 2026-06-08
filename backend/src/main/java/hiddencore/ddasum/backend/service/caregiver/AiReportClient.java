package hiddencore.ddasum.backend.service.caregiver;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * ai/ai-report FastAPI 서비스 클라이언트 (OpenAI 키는 Python 쪽에서 관리).
 */
@Service
public class AiReportClient {

    private static final Logger log = LoggerFactory.getLogger(AiReportClient.class);
    private static final int CONNECT_TIMEOUT_MS = 5_000;
    /** LLM 응답 대기 (처방전 분석은 30~60초 걸릴 수 있음) */
    private static final int READ_TIMEOUT_MS = 120_000;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${app.ai-report.enabled:true}")
    private boolean enabled;

    @Value("${app.ai-report.base-url:http://127.0.0.1:8002}")
    private String baseUrl;

    public AiReportClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = createRestTemplate();
    }

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }

    public GuardianWeeklyReportLlmService.GeneratedNarrative generateWeeklyNarrative(
            GuardianWeeklyReportLlmService.WeeklyNarrativeInput input,
            String patientName) {
        if (!enabled) {
            return null;
        }
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("period_start", input.periodStart);
            body.put("period_end", input.periodEnd);
            body.put("patient_name", patientName != null ? patientName : "환자");
            body.put("overall_rate", input.overallRate);
            body.put("risk_level", input.riskLevel);
            body.put("risk_flags", input.riskFlags != null ? input.riskFlags : List.of());
            body.put("meal_morning_missing", input.mealMorningMissingCount);
            body.put("meal_lunch_missing", input.mealLunchMissingCount);
            body.put("meal_dinner_missing", input.mealDinnerMissingCount);
            body.put("meal_percent", input.mealPercent);
            body.put("hygiene_percent", input.hygienePercent);
            body.put("condition_percent", input.conditionPercent);
            body.put("elimination_percent", input.eliminationPercent);
            body.put("diagnosis_title", input.diagnosisTitle != null ? input.diagnosisTitle : "");
            body.put("diagnosis_comment", input.diagnosisComment != null ? input.diagnosisComment : "");

            JsonNode response = post("/api/weekly-narrative", body);
            if (response == null) {
                return null;
            }

            String summaryText = response.path("summary_text").asText("").trim();
            String checklistInsight = response.path("checklist_insight").asText("").trim();
            List<String> aiComments = readStringList(response.path("ai_comments"), 4);
            List<String> nextWeekTips = readStringList(response.path("next_week_tips"), 3);
            GuardianWeeklyReportLlmService.ProgramSectionData programSection =
                    parseProgramSection(response.path("program_section"));

            if (summaryText.isBlank() && checklistInsight.isBlank() && aiComments.isEmpty()
                    && nextWeekTips.isEmpty() && programSection == null) {
                return null;
            }

            return new GuardianWeeklyReportLlmService.GeneratedNarrative(
                    summaryText, checklistInsight, aiComments, nextWeekTips, programSection);
        } catch (RestClientException e) {
            log.warn("ai-report weekly-narrative 호출 실패. fallback 사용. reason={}", e.getMessage());
            return null;
        }
    }

    public PrescriptionSummaryResult generatePrescriptionSummary(PrescriptionSummaryInput input) {
        if (!enabled) {
            return null;
        }
        try {
            List<Map<String, Object>> meds = new ArrayList<>();
            if (input.medications() != null) {
                for (PrescriptionMedicationItem item : input.medications()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("medication_id", item.medicationId() != null ? item.medicationId() : 0);
                    row.put("prescription_date", item.prescriptionDate() != null ? item.prescriptionDate() : "");
                    row.put("medicine_summary", item.medicineSummary() != null ? item.medicineSummary() : "");
                    row.put("medicine_name", item.medicineName() != null ? item.medicineName() : "");
                    row.put("effect", item.effect() != null ? item.effect() : "");
                    row.put("use_method", item.useMethod() != null ? item.useMethod() : "");
                    row.put("caution", item.caution() != null ? item.caution() : "");
                    row.put("warning", item.warning() != null ? item.warning() : "");
                    row.put("side_effect", item.sideEffect() != null ? item.sideEffect() : "");
                    meds.add(row);
                }
            }

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("patient_name", input.patientName() != null ? input.patientName() : "환자");
            body.put("period_start", input.periodStart() != null ? input.periodStart() : "");
            body.put("period_end", input.periodEnd() != null ? input.periodEnd() : "");
            body.put("overall_rate", input.overallRate());
            body.put("risk_level", input.riskLevel() != null ? input.riskLevel() : "안정");
            body.put("risk_flags", input.riskFlags() != null ? input.riskFlags() : List.of());
            body.put("diagnosis_title", input.diagnosisTitle() != null ? input.diagnosisTitle() : "");
            body.put("diagnosis_comment", input.diagnosisComment() != null ? input.diagnosisComment() : "");
            body.put("medications", meds);

            JsonNode response = post("/api/prescription-summary", body);
            if (response == null) {
                return null;
            }

            return new PrescriptionSummaryResult(
                    response.path("summary_text").asText("").trim(),
                    readStringList(response.path("medication_highlights"), 5),
                    readStringList(response.path("cautions"), 5),
                    readStringList(response.path("care_tips"), 5));
        } catch (RestClientException e) {
            log.warn("ai-report prescription-summary 호출 실패. fallback 사용. reason={}", e.getMessage());
            return null;
        }
    }

    private JsonNode post(String path, Map<String, Object> body) {
        String endpoint = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) + path : baseUrl + path;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.warn("ai-report {} 비정상 응답 status={}", path, response.getStatusCode());
                return null;
            }
            return objectMapper.readTree(response.getBody());
        } catch (JsonProcessingException e) {
            throw new RestClientException("ai-report 응답 JSON 파싱 실패: " + e.getMessage(), e);
        } catch (RestClientException e) {
            log.warn("ai-report {} 요청 실패: {}", path, e.getMessage());
            throw e;
        }
    }

    private List<String> readStringList(JsonNode arrayNode, int maxItems) {
        List<String> values = new ArrayList<>();
        if (arrayNode == null || !arrayNode.isArray()) {
            return values;
        }
        for (JsonNode n : arrayNode) {
            String v = n.asText("").trim();
            if (!v.isBlank()) {
                values.add(v);
            }
            if (values.size() >= maxItems) {
                break;
            }
        }
        return values;
    }

    public ProgramRecommendationResult generateProgramRecommendation(ProgramRecommendationInput input) {
        if (!enabled) {
            return null;
        }
        try {
            List<Map<String, Object>> programs = new ArrayList<>();
            if (input.availablePrograms() != null) {
                for (AvailableProgramItem p : input.availablePrograms()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("post_id", p.postId() != null ? p.postId() : 0);
                    row.put("title", p.title() != null ? p.title() : "");
                    row.put("description", p.description() != null ? p.description() : "");
                    row.put("category", p.category() != null ? p.category() : "");
                    row.put("program_start_at", p.programStartAt() != null ? p.programStartAt() : "");
                    programs.add(row);
                }
            }

            List<Map<String, Object>> meds = new ArrayList<>();
            if (input.medicationSummaries() != null) {
                for (String summary : input.medicationSummaries()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("summary", summary != null ? summary : "");
                    meds.add(row);
                }
            }

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("patient_name", input.patientName() != null ? input.patientName() : "환자");
            body.put("period_start", input.periodStart() != null ? input.periodStart() : "");
            body.put("period_end", input.periodEnd() != null ? input.periodEnd() : "");
            body.put("next_week_start", input.nextWeekStart() != null ? input.nextWeekStart() : "");
            body.put("overall_rate", input.overallRate());
            body.put("risk_level", input.riskLevel() != null ? input.riskLevel() : "안정");
            body.put("risk_flags", input.riskFlags() != null ? input.riskFlags() : List.of());
            body.put("meal_percent", input.mealPercent());
            body.put("hygiene_percent", input.hygienePercent());
            body.put("condition_percent", input.conditionPercent());
            body.put("elimination_percent", input.eliminationPercent());
            body.put("diagnosis_title", input.diagnosisTitle() != null ? input.diagnosisTitle() : "");
            body.put("diagnosis_comment", input.diagnosisComment() != null ? input.diagnosisComment() : "");
            body.put("medication_summaries", meds);
            body.put("available_programs", programs);

            JsonNode response = post("/api/program-recommendation", body);
            if (response == null) {
                return null;
            }

            return new ProgramRecommendationResult(
                    response.path("activity_title").asText("").trim(),
                    response.path("activity_description").asText("").trim(),
                    readStringList(response.path("effects"), 3),
                    parseCategoryRecommendations(response.path("category_recommendations")));
        } catch (RestClientException e) {
            log.warn("ai-report program-recommendation 호출 실패. fallback 사용. reason={}", e.getMessage());
            return null;
        }
    }

    private List<CategoryRecommendationItem> parseCategoryRecommendations(JsonNode arrayNode) {
        List<CategoryRecommendationItem> items = new ArrayList<>();
        if (arrayNode == null || !arrayNode.isArray()) {
            return items;
        }
        for (JsonNode node : arrayNode) {
            String category = node.path("category").asText("").trim();
            if (category.isBlank()) {
                continue;
            }
            boolean hasProgram = node.path("has_program").asBoolean(false);
            Long postId = node.hasNonNull("post_id") && node.path("post_id").asLong(0) > 0
                    ? node.path("post_id").asLong()
                    : null;
            items.add(
                    new CategoryRecommendationItem(
                            category,
                            node.path("reason").asText("").trim(),
                            hasProgram,
                            postId,
                            node.path("program_title").asText("").trim(),
                            node.path("no_program_message").asText("").trim()));
        }
        return items;
    }

    private GuardianWeeklyReportLlmService.ProgramSectionData parseProgramSection(JsonNode node) {
        if (node == null || !node.isObject()) {
            return null;
        }
        String activityTitle = node.path("activityTitle").asText(node.path("activity_title").asText("")).trim();
        String activityDescription =
                node.path("activityDescription").asText(node.path("activity_description").asText("")).trim();
        List<String> effects = readStringList(node.path("effects"), 2);
        List<String> recommendations = readStringList(node.path("recommendations"), 3);

        if (activityTitle.isBlank() && activityDescription.isBlank() && effects.isEmpty()
                && recommendations.isEmpty()) {
            return null;
        }
        return new GuardianWeeklyReportLlmService.ProgramSectionData(
                activityTitle, activityDescription, effects, recommendations);
    }

    public record PrescriptionMedicationItem(
            Long medicationId,
            String prescriptionDate,
            String medicineSummary,
            String medicineName,
            String effect,
            String useMethod,
            String caution,
            String warning,
            String sideEffect) {
    }

    public record PrescriptionSummaryInput(
            String patientName,
            String periodStart,
            String periodEnd,
            int overallRate,
            String riskLevel,
            List<String> riskFlags,
            String diagnosisTitle,
            String diagnosisComment,
            List<PrescriptionMedicationItem> medications) {
    }

    public record PrescriptionSummaryResult(
            String summaryText,
            List<String> medicationHighlights,
            List<String> cautions,
            List<String> careTips) {
    }

    public record AvailableProgramItem(
            Long postId, String title, String description, String category, String programStartAt) {
    }

    public record ProgramRecommendationInput(
            String patientName,
            String periodStart,
            String periodEnd,
            String nextWeekStart,
            int overallRate,
            String riskLevel,
            List<String> riskFlags,
            int mealPercent,
            int hygienePercent,
            int conditionPercent,
            int eliminationPercent,
            String diagnosisTitle,
            String diagnosisComment,
            List<String> medicationSummaries,
            List<AvailableProgramItem> availablePrograms) {
    }

    public record CategoryRecommendationItem(
            String category,
            String reason,
            boolean hasProgram,
            Long postId,
            String programTitle,
            String noProgramMessage) {
    }

    public record ProgramRecommendationResult(
            String activityTitle,
            String activityDescription,
            List<String> effects,
            List<CategoryRecommendationItem> categoryRecommendations) {
    }
}
