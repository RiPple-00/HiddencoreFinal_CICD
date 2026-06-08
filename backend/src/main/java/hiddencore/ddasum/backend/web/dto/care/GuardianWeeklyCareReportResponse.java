package hiddencore.ddasum.backend.web.dto.care;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianWeeklyCareReportResponse {

    private Long patientId;
    private String patientName;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    /** 전체 수행률(%) */
    private Integer overallRate;

    /** 안정 | 주의 | 위험 */
    private String riskLevel;

    private String summaryText;
    private String checklistInsight;
    private List<String> riskFlags;
    private List<String> aiComments;
    private List<String> nextWeekTips;
    private MealMissingCount mealMissingCount;
    private ProgramSection programSection;
    private DiagnosisSection diagnosisSection;
    private LocalDate nextWeekStart;

    private List<DailyRate> dailyRates;
    private List<ChecklistRow> checklistRows;
    private PrescriptionSection prescriptionSection;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRate {
        private LocalDate date;
        private String day;
        private Integer rate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChecklistRow {
        private String label;
        private Integer percent;
        /** success | warn | danger */
        private String percentStyle;
        private List<String> dailyComments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealMissingCount {
        private Integer morning;
        private Integer lunch;
        private Integer dinner;
        private Integer total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramSection {
        private String activityTitle;
        private String activityDescription;
        private List<String> effects;
        /** 하위 호환: 텍스트 추천 목록 */
        private List<String> recommendations;
        /** AI가 환자 상태·모집 중 프로그램을 매칭한 분야별 추천 */
        private List<ProgramRecommendation> categoryRecommendations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiagnosisSection {
        private String diagnosisTitle;
        private String diagnosisComment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplyEligibleProgram {
        private Long postId;
        private String title;
        private String description;
        private String category;
        private String recruitStatus;
        private Integer capacity;
        private Integer currentEnrolled;
        private LocalDateTime programStartAt;
        private LocalDateTime recruitEndAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramRecommendation {
        private String category;
        private String reason;
        private Boolean hasProgram;
        private Long postId;
        private String programTitle;
        private LocalDateTime programStartAt;
        private String noProgramMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrescriptionSection {
        private String summaryText;
        private List<String> medicationHighlights;
        private List<String> cautions;
        private List<String> careTips;
        private List<RegisteredMedication> medications;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class RegisteredMedication {
            private Long medicationId;
            private LocalDate prescriptionDate;
            private String medicineSummary;
        }
    }
}
