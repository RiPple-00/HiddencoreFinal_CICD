package hiddencore.ddasum.backend.service.caregiver;

import java.util.List;

import org.springframework.stereotype.Service;

/**
 * 주간 보고서 LLM 연동 — ai/ai-report FastAPI 서비스에 위임.
 */
@Service
public class GuardianWeeklyReportLlmService {

    private final AiReportClient aiReportClient;

    public GuardianWeeklyReportLlmService(AiReportClient aiReportClient) {
        this.aiReportClient = aiReportClient;
    }

    public GeneratedNarrative generateWeeklyNarrative(WeeklyNarrativeInput input, String patientName) {
        return aiReportClient.generateWeeklyNarrative(input, patientName);
    }

    public AiReportClient.PrescriptionSummaryResult generatePrescriptionSummary(
            AiReportClient.PrescriptionSummaryInput input) {
        return aiReportClient.generatePrescriptionSummary(input);
    }

    public AiReportClient.ProgramRecommendationResult generateProgramRecommendation(
            AiReportClient.ProgramRecommendationInput input) {
        return aiReportClient.generateProgramRecommendation(input);
    }

    public static class WeeklyNarrativeInput {
        public final String periodStart;
        public final String periodEnd;
        public final int overallRate;
        public final String riskLevel;
        public final List<String> riskFlags;
        public final int mealMorningMissingCount;
        public final int mealLunchMissingCount;
        public final int mealDinnerMissingCount;
        public final int mealPercent;
        public final int hygienePercent;
        public final int conditionPercent;
        public final int eliminationPercent;
        public final String diagnosisTitle;
        public final String diagnosisComment;

        public WeeklyNarrativeInput(
                String periodStart,
                String periodEnd,
                int overallRate,
                String riskLevel,
                List<String> riskFlags,
                int mealMorningMissingCount,
                int mealLunchMissingCount,
                int mealDinnerMissingCount,
                int mealPercent,
                int hygienePercent,
                int conditionPercent,
                int eliminationPercent,
                String diagnosisTitle,
                String diagnosisComment
        ) {
            this.periodStart = periodStart;
            this.periodEnd = periodEnd;
            this.overallRate = overallRate;
            this.riskLevel = riskLevel;
            this.riskFlags = riskFlags;
            this.mealMorningMissingCount = mealMorningMissingCount;
            this.mealLunchMissingCount = mealLunchMissingCount;
            this.mealDinnerMissingCount = mealDinnerMissingCount;
            this.mealPercent = mealPercent;
            this.hygienePercent = hygienePercent;
            this.conditionPercent = conditionPercent;
            this.eliminationPercent = eliminationPercent;
            this.diagnosisTitle = diagnosisTitle;
            this.diagnosisComment = diagnosisComment;
        }
    }

    public record ProgramSectionData(String activityTitle, String activityDescription, List<String> effects, List<String> recommendations) {
    }

    public record GeneratedNarrative(String summaryText,
                                     String checklistInsight,
                                     List<String> aiComments,
                                     List<String> nextWeekTips,
                                     ProgramSectionData programSection) {
    }
}
