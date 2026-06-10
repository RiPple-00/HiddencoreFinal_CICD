package hiddencore.ddasum.backend.service.caregiver;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Medication;
import hiddencore.ddasum.backend.domain.MedicationDetail;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.MedicationDetailRepository;
import hiddencore.ddasum.backend.repository.MedicationRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.caregiver.CaregiverCareCheckRepository;
import hiddencore.ddasum.backend.web.dto.care.GuardianWeeklyCareReportResponse;
import hiddencore.ddasum.backend.web.dto.caregiver.CaregiverCareCheckDto;

/**
 * 간병인 일일 업무 체크리스트(CARE_CHECK) 도메인 서비스.
 *
 * <ul>
 *   <li>자동 저장(임시저장) - 동일 (환자, 날짜) 문서가 있으면 갱신, 없으면 생성한다.</li>
 *   <li>제출 - 자동 저장 본문을 그대로 PENDING_APPROVAL 로 승격한다.</li>
 *   <li>조회 - 저장된 JSON content 를 다시 객체로 풀어서 반환한다.</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
public class CaregiverCareCheckService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Seoul");
    private static final String DEMO_PATIENT_DISPLAY_NAME = "\uAE30\uB9CC\uACBD";

    private final CaregiverCareCheckRepository careCheckRepository;
    private final PatientRepository patientRepository;
    private final FacilityRepository facilityRepository;
    private final ObjectMapper objectMapper;
    private final GuardianWeeklyReportLlmService weeklyReportLlmService;
    private final MedicationRepository medicationRepository;
    private final MedicationDetailRepository medicationDetailRepository;
    private final GuardianWeeklyReportProgramService weeklyReportProgramService;

    public CaregiverCareCheckService(
            CaregiverCareCheckRepository careCheckRepository,
            PatientRepository patientRepository,
            FacilityRepository facilityRepository,
            ObjectMapper objectMapper,
            GuardianWeeklyReportLlmService weeklyReportLlmService,
            MedicationRepository medicationRepository,
            MedicationDetailRepository medicationDetailRepository,
            GuardianWeeklyReportProgramService weeklyReportProgramService) {
        this.careCheckRepository = careCheckRepository;
        this.patientRepository = patientRepository;
        this.facilityRepository = facilityRepository;
        this.objectMapper = objectMapper;
        this.weeklyReportLlmService = weeklyReportLlmService;
        this.medicationRepository = medicationRepository;
        this.medicationDetailRepository = medicationDetailRepository;
        this.weeklyReportProgramService = weeklyReportProgramService;
    }

  // 자동 저장(임시저장)
   
    /**
     * 자동 저장. 동일 (환자, 날짜) 문서가 있으면 갱신, 없으면 새로 생성한다.
     * 화면 입력이 멈추면 프론트에서 디바운스해 호출한다.
     */
    @Transactional
    public CaregiverCareCheckDto.Response autoSave(CaregiverCareCheckDto.SaveRequest request) {
        validate(request);

        Long patientId = Objects.requireNonNull(request.getPatientId(), "patientId");
        LocalDate date = request.getRecordDate() != null ? request.getRecordDate() : today();
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("환자가 없습니다. id=" + patientId));

        Document document = careCheckRepository
            .findLatestCareCheck(patientId, date)
                .orElseGet(() -> newCareCheckDocument(patient, date));

        applyContent(document, request.getContent(), date, patient, Document.DocumentStatus.DRAFT);

        Document saved = careCheckRepository.save(Objects.requireNonNull(document, "document"));
        return toResponse(saved);
    }

    // ============================================================
    // 제출
    // ============================================================

    /** 사용자가 "제출하기" 버튼을 눌렀을 때 호출된다. 본문은 마지막 자동 저장 결과 그대로 사용 가능. */
    @Transactional
    public CaregiverCareCheckDto.Response submit(CaregiverCareCheckDto.SaveRequest request) {
        validate(request);
        Long patientId = Objects.requireNonNull(request.getPatientId(), "patientId");
        LocalDate date = request.getRecordDate() != null ? request.getRecordDate() : today();
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("환자가 없습니다. id=" + patientId));

        Document document = careCheckRepository
            .findLatestCareCheck(patientId, date)
                .orElseGet(() -> newCareCheckDocument(patient, date));

        applyContent(document, request.getContent(), date, patient, Document.DocumentStatus.PENDING_APPROVAL);
        document.setRequestedAt(java.time.LocalDateTime.now());

        Document saved = careCheckRepository.save(Objects.requireNonNull(document, "document"));
        return toResponse(saved);
    }

    // ============================================================
    // 조회
    // ============================================================

    /** 단건 조회 - 환자, 날짜 기준. 없으면 null content 응답. */
    public CaregiverCareCheckDto.Response getOne(Long patientId, LocalDate recordDate) {
        Objects.requireNonNull(patientId, "patientId");
        LocalDate date = recordDate != null ? recordDate : today();

        return careCheckRepository.findLatestCareCheck(patientId, date)
                .map(this::toResponse)
                .orElse(CaregiverCareCheckDto.Response.builder()
                        .patientId(patientId)
                        .recordDate(date)
                        .build());
    }

    /** 환자별 이력 목록 - 최신순 */
    public List<CaregiverCareCheckDto.Response> getHistory(Long patientId) {
        return careCheckRepository.findAllByPatient(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    public GuardianWeeklyCareReportResponse getWeeklyReport(
            Long guardianUserId, Long patientId, LocalDate startDate, LocalDate endDate, String language) {
        Long safePatientId = Objects.requireNonNull(patientId, "patientId");

        LocalDate today = today();
        LocalDate end = endDate != null ? endDate : today;
        LocalDate start = startDate != null ? startDate : end.minusDays(6);
        if (start.isAfter(end)) {
            LocalDate t = start;
            start = end;
            end = t;
        }

        LocalDate thisWeekMonday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate latestReportableMonday = thisWeekMonday.minusWeeks(1);
        if (start.isAfter(latestReportableMonday)) {
            throw new IllegalArgumentException(
                    "아직 조회할 수 없는 보고서 기간입니다. 가장 최근 완료된 주간 보고서만 확인할 수 있습니다.");
        }

        Patient patient = patientRepository.findById(safePatientId)
                .orElseThrow(() -> new IllegalArgumentException("환자가 없습니다. id=" + safePatientId));

        List<Document> docs = careCheckRepository.findAllByPatientAndDateRange(safePatientId, start, end);
        Map<LocalDate, Document> latestByDate = new HashMap<>();
        for (Document d : docs) {
            if (d.getRecordDate() == null) continue;
            Document current = latestByDate.get(d.getRecordDate());
            if (current == null || d.getUpdatedAt().isAfter(current.getUpdatedAt())) {
                latestByDate.put(d.getRecordDate(), d);
            }
        }

        int overallTotal = 0;
        int overallAbnormal = 0;

        int mealTotal = 0;
        int mealAbnormal = 0;
        int hygieneTotal = 0;
        int hygieneAbnormal = 0;
        int conditionTotal = 0;
        int conditionAbnormal = 0;
        int eliminationTotal = 0;
        int eliminationAbnormal = 0;

        int lowHydrationDays = 0;
        int appetiteDeclineDays = 0;
        int fallCount = 0;
        int breathingAbnormalDays = 0;
        int painAbnormalDays = 0;
        int mealIncidentDays = 0;
        int mealMorningMissingCount = 0;
        int mealLunchMissingCount = 0;
        int mealDinnerMissingCount = 0;

        List<GuardianWeeklyCareReportResponse.DailyRate> dailyRates = new ArrayList<>();
        List<String> mealComments = new ArrayList<>();
        List<String> hygieneComments = new ArrayList<>();
        List<String> conditionComments = new ArrayList<>();
        List<String> eliminationComments = new ArrayList<>();

        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            Document dayDoc = latestByDate.get(cursor);
            CaregiverCareCheckDto.Content c = parseContent(dayDoc);

            DayComputation dayComp = computeDay(c, language);

            overallTotal += dayComp.overallTotal;
            overallAbnormal += dayComp.overallAbnormal;
            mealTotal += dayComp.mealTotal;
            mealAbnormal += dayComp.mealAbnormal;
            hygieneTotal += dayComp.hygieneTotal;
            hygieneAbnormal += dayComp.hygieneAbnormal;
            conditionTotal += dayComp.conditionTotal;
            conditionAbnormal += dayComp.conditionAbnormal;
            eliminationTotal += dayComp.eliminationTotal;
            eliminationAbnormal += dayComp.eliminationAbnormal;

            if (dayComp.lowHydration) lowHydrationDays += 1;
            if (dayComp.appetiteDecline) appetiteDeclineDays += 1;
            if (dayComp.fallAlert) fallCount += 1;
            if (dayComp.breathingAbnormal) breathingAbnormalDays += 1;
            if (dayComp.painAbnormal) painAbnormalDays += 1;
            if (dayComp.mealIncident) mealIncidentDays += 1;
            if (dayComp.mealMorningMissing) mealMorningMissingCount += 1;
            if (dayComp.mealLunchMissing) mealLunchMissingCount += 1;
            if (dayComp.mealDinnerMissing) mealDinnerMissingCount += 1;

            dailyRates.add(GuardianWeeklyCareReportResponse.DailyRate.builder()
                    .date(cursor)
                    .day(dayLabel(cursor))
                    .rate(rate(dayComp.overallTotal, dayComp.overallAbnormal))
                    .build());

            mealComments.add(dayComp.mealComment);
            hygieneComments.add(dayComp.hygieneComment);
            conditionComments.add(dayComp.conditionComment);
            eliminationComments.add(dayComp.eliminationComment);
            cursor = cursor.plusDays(1);
        }

        List<String> riskFlags = new ArrayList<>();
        if (lowHydrationDays >= 3) riskFlags.add("LOW_HYDRATION");
        if (fallCount > 0) riskFlags.add("FALL_ALERT");
        if (appetiteDeclineDays >= 2) riskFlags.add("APPETITE_DECLINE");
        if (breathingAbnormalDays > 0) riskFlags.add("BREATHING_ALERT");
        if (painAbnormalDays >= 2) riskFlags.add("PAIN_PERSISTENCE");

        int overallRate = rate(overallTotal, overallAbnormal);
        String riskLevel = overallRate >= 90 ? "안정" : overallRate >= 75 ? "주의" : "위험";

        List<String> aiComments = buildAiComments(
            riskFlags, lowHydrationDays, breathingAbnormalDays,
            painAbnormalDays, fallCount, mealIncidentDays, language
        );
        List<String> nextWeekTips = buildNextWeekTips(riskFlags, language);
        String checklistInsight = buildChecklistInsight(overallRate, riskFlags, language);
        String summaryText = switch (riskLevel) {
            case "위험" -> ls(language,
                "이번 주 기록에서 즉시 관찰이 필요한 징후가 확인되었습니다. 보호자와 시설이 함께 모니터링을 강화해 주세요.",
                "Signs requiring immediate observation were detected this week. Increased monitoring by the guardian and facility is recommended.",
                "今週の記録に即座の観察が必要な兆候が確認されました。保護者と施設が連携してモニタリングを強化してください。");
            case "주의" -> ls(language,
                "이번 주 기록에서 추적 관찰이 필요한 변화가 확인되었습니다. 수분, 식사, 통증 관련 관리를 권장드립니다.",
                "Changes requiring follow-up observation were detected this week. Managing hydration, meals, and pain is recommended.",
                "今週の記録に経過観察が必要な変化が確認されました。水分・食事・痛みの管理を推奨します。");
            default -> ls(language,
                "이번 주 기록 기준으로 전반적인 상태는 안정적으로 유지되고 있습니다.",
                "Based on this week's records, the overall condition is being maintained stably.",
                "今週の記録を基準として、全体的な状態は安定して維持されています。");
        };

        List<GuardianWeeklyCareReportResponse.ChecklistRow> rows = List.of(
                checklistRow(ls(language, "식사 도움", "Meal Assistance", "食事介助"), mealTotal, mealAbnormal, mealComments),
                checklistRow(ls(language, "개인 위생 관리", "Personal Hygiene", "個人衛生管理"), hygieneTotal, hygieneAbnormal, hygieneComments),
                checklistRow(ls(language, "상태 안정화", "Condition", "状態安定化"), conditionTotal, conditionAbnormal, conditionComments),
                checklistRow(ls(language, "배변 관리", "Elimination", "排泄管理"), eliminationTotal, eliminationAbnormal, eliminationComments)
        );

        String patientDisplayName = resolvePatientDisplayName(patient);
        String diagnosisTitle = patient.getAdmissionStatus();
        String diagnosisComment = patient.getMemo();
        LocalDate nextWeekStart = GuardianWeeklyReportProgramService.resolveNextWeekStart(end);
        Long facilityId =
                patient.getFacilityId() != null ? patient.getFacilityId().getFacilityId() : null;
        List<GuardianWeeklyCareReportResponse.ApplyEligibleProgram> eligiblePrograms =
                weeklyReportProgramService.listApplyEligiblePrograms(facilityId, guardianUserId, end);

        GuardianWeeklyCareReportResponse.ProgramSection programSection =
                buildProgramSectionWithRecommendation(
                        patientDisplayName,
                        start,
                        end,
                        nextWeekStart,
                        overallRate,
                        riskLevel,
                        riskFlags,
                        rate(mealTotal, mealAbnormal),
                        rate(hygieneTotal, hygieneAbnormal),
                        rate(conditionTotal, conditionAbnormal),
                        rate(eliminationTotal, eliminationAbnormal),
                        diagnosisTitle,
                        diagnosisComment,
                        patient,
                        eligiblePrograms,
                        language);

        GuardianWeeklyReportLlmService.WeeklyNarrativeInput narrativeInput =
                new GuardianWeeklyReportLlmService.WeeklyNarrativeInput(
                        String.valueOf(start),
                        String.valueOf(end),
                        overallRate,
                        riskLevel,
                        riskFlags,
                        mealMorningMissingCount,
                        mealLunchMissingCount,
                        mealDinnerMissingCount,
                        rate(mealTotal, mealAbnormal),
                        rate(hygieneTotal, hygieneAbnormal),
                        rate(conditionTotal, conditionAbnormal),
                        rate(eliminationTotal, eliminationAbnormal),
                        diagnosisTitle,
                        diagnosisComment,
                        language);
        GuardianWeeklyReportLlmService.GeneratedNarrative generatedNarrative =
                weeklyReportLlmService.generateWeeklyNarrative(narrativeInput, patientDisplayName);

        if (generatedNarrative != null) {
            if (hasText(generatedNarrative.summaryText())) {
                summaryText = generatedNarrative.summaryText();
            }
            if (hasText(generatedNarrative.checklistInsight())) {
                checklistInsight = generatedNarrative.checklistInsight();
            }
            if (generatedNarrative.aiComments() != null && !generatedNarrative.aiComments().isEmpty()) {
                aiComments = generatedNarrative.aiComments();
            }
            if (generatedNarrative.nextWeekTips() != null && !generatedNarrative.nextWeekTips().isEmpty()) {
                nextWeekTips = generatedNarrative.nextWeekTips();
            }
        }

        GuardianWeeklyCareReportResponse.PrescriptionSection prescriptionSection =
                buildPrescriptionSection(
                        patient,
                        patientDisplayName,
                        start,
                        end,
                        overallRate,
                        riskLevel,
                        riskFlags,
                        diagnosisTitle,
                        diagnosisComment,
                        language);

        GuardianWeeklyCareReportResponse.DiagnosisSection diagnosisSection = null;
        if (hasText(diagnosisTitle) || hasText(diagnosisComment)) {
            diagnosisSection =
                    GuardianWeeklyCareReportResponse.DiagnosisSection.builder()
                            .diagnosisTitle(diagnosisTitle)
                            .diagnosisComment(diagnosisComment)
                            .build();
        }

        return GuardianWeeklyCareReportResponse.builder()
                .patientId(patientId)
                .patientName(patientDisplayName)
                .periodStart(start)
                .periodEnd(end)
                .nextWeekStart(nextWeekStart)
                .overallRate(overallRate)
                .riskLevel(riskLevel)
                .summaryText(summaryText)
                .checklistInsight(checklistInsight)
                .riskFlags(riskFlags)
                .aiComments(aiComments)
                .nextWeekTips(nextWeekTips)
                .programSection(programSection)
                .diagnosisSection(diagnosisSection)
                .prescriptionSection(prescriptionSection)
                .mealMissingCount(GuardianWeeklyCareReportResponse.MealMissingCount.builder()
                    .morning(mealMorningMissingCount)
                    .lunch(mealLunchMissingCount)
                    .dinner(mealDinnerMissingCount)
                    .total(mealMorningMissingCount + mealLunchMissingCount + mealDinnerMissingCount)
                    .build())
                .dailyRates(dailyRates.stream().sorted(Comparator.comparing(GuardianWeeklyCareReportResponse.DailyRate::getDate)).toList())
                .checklistRows(rows)
                .build();
    }

    private String resolvePatientDisplayName(Patient patient) {
        if (patient.getPatientId() != null && patient.getPatientId() == 260401008L) {
            return DEMO_PATIENT_DISPLAY_NAME;
        }
        String name = patient.getName();
        if (name == null || name.isBlank() || name.chars().allMatch(ch -> ch == '?' || ch == '\uFFFD')) {
            return "환자";
        }
        return name;
    }

    private GuardianWeeklyCareReportResponse.ProgramSection buildProgramSectionWithRecommendation(
            String patientDisplayName,
            LocalDate start,
            LocalDate end,
            LocalDate nextWeekStart,
            int overallRate,
            String riskLevel,
            List<String> riskFlags,
            int mealPercent,
            int hygienePercent,
            int conditionPercent,
            int eliminationPercent,
            String diagnosisTitle,
            String diagnosisComment,
            Patient patient,
            List<GuardianWeeklyCareReportResponse.ApplyEligibleProgram> eligiblePrograms,
            String language) {
        List<String> medicationSummaries =
                medicationRepository
                        .findByPatientId_PatientIdOrderByPrescriptionDateDesc(patient.getPatientId())
                        .stream()
                        .map(Medication::getMedicineSummary)
                        .filter(this::hasText)
                        .limit(6)
                        .toList();

        List<AiReportClient.AvailableProgramItem> llmPrograms =
                eligiblePrograms.stream()
                        .map(
                                p ->
                                        new AiReportClient.AvailableProgramItem(
                                                p.getPostId(),
                                                p.getTitle(),
                                                p.getDescription(),
                                                p.getCategory(),
                                                p.getProgramStartAt() != null
                                                        ? String.valueOf(p.getProgramStartAt())
                                                        : ""))
                        .toList();

        AiReportClient.ProgramRecommendationResult generated =
                weeklyReportLlmService.generateProgramRecommendation(
                        new AiReportClient.ProgramRecommendationInput(
                                patientDisplayName,
                                String.valueOf(start),
                                String.valueOf(end),
                                String.valueOf(nextWeekStart),
                                overallRate,
                                riskLevel,
                                riskFlags,
                                mealPercent,
                                hygienePercent,
                                conditionPercent,
                                eliminationPercent,
                                diagnosisTitle,
                                diagnosisComment,
                                medicationSummaries,
                                llmPrograms,
                                language));

        GuardianWeeklyCareReportResponse.ProgramSection section;
        if (generated != null) {
            section =
                    GuardianWeeklyCareReportResponse.ProgramSection.builder()
                            .activityTitle(generated.activityTitle())
                            .activityDescription(generated.activityDescription())
                            .effects(generated.effects())
                            .categoryRecommendations(
                                    sanitizeCategoryRecommendations(
                                            generated.categoryRecommendations(), eligiblePrograms))
                            .recommendations(
                                    toLegacyRecommendationTexts(
                                            sanitizeCategoryRecommendations(
                                                    generated.categoryRecommendations(),
                                                    eligiblePrograms)))
                            .build();
        } else {
            section = buildProgramRecommendationFallback(
                    riskLevel, riskFlags, diagnosisTitle, diagnosisComment, eligiblePrograms, nextWeekStart, language);
        }

        if (!hasText(section.getActivityTitle()) || !hasText(section.getActivityDescription())) {
            GuardianWeeklyCareReportResponse.ProgramSection fallback =
                    buildProgramSectionFallback(riskLevel, riskFlags, language);
            section.setActivityTitle(fallback.getActivityTitle());
            section.setActivityDescription(fallback.getActivityDescription());
            if (section.getEffects() == null || section.getEffects().isEmpty()) {
                section.setEffects(fallback.getEffects());
            }
        }
        if (section.getCategoryRecommendations() == null || section.getCategoryRecommendations().isEmpty()) {
            section.setCategoryRecommendations(
                    buildProgramRecommendationFallback(
                                    riskLevel,
                                    riskFlags,
                                    diagnosisTitle,
                                    diagnosisComment,
                                    eligiblePrograms,
                                    nextWeekStart,
                                    language)
                            .getCategoryRecommendations());
            section.setRecommendations(toLegacyRecommendationTexts(section.getCategoryRecommendations()));
        }
        return section;
    }

    private List<GuardianWeeklyCareReportResponse.ProgramRecommendation> sanitizeCategoryRecommendations(
            List<AiReportClient.CategoryRecommendationItem> raw,
            List<GuardianWeeklyCareReportResponse.ApplyEligibleProgram> eligiblePrograms) {
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        Map<Long, GuardianWeeklyCareReportResponse.ApplyEligibleProgram> byId =
                eligiblePrograms.stream()
                        .filter(p -> p.getPostId() != null)
                        .collect(
                                Collectors.toMap(
                                        GuardianWeeklyCareReportResponse.ApplyEligibleProgram::getPostId,
                                        p -> p,
                                        (a, b) -> a,
                                        LinkedHashMap::new));
        Map<String, GuardianWeeklyCareReportResponse.ApplyEligibleProgram> byCategory =
                eligiblePrograms.stream()
                        .collect(
                                Collectors.toMap(
                                        GuardianWeeklyCareReportResponse.ApplyEligibleProgram::getCategory,
                                        p -> p,
                                        (a, b) -> a,
                                        LinkedHashMap::new));

        List<GuardianWeeklyCareReportResponse.ProgramRecommendation> sanitized = new ArrayList<>();
        Set<String> seenCategories = new HashSet<>();
        for (AiReportClient.CategoryRecommendationItem item : raw) {
            if (item == null || !hasText(item.category()) || seenCategories.contains(item.category())) {
                continue;
            }
            seenCategories.add(item.category());

            GuardianWeeklyCareReportResponse.ApplyEligibleProgram matched = null;
            if (item.hasProgram() && item.postId() != null) {
                matched = byId.get(item.postId());
            }
            if (matched == null && item.hasProgram()) {
                matched = byCategory.get(item.category());
            }

            if (matched != null) {
                sanitized.add(
                        GuardianWeeklyCareReportResponse.ProgramRecommendation.builder()
                                .category(item.category())
                                .reason(item.reason())
                                .hasProgram(true)
                                .postId(matched.getPostId())
                                .programTitle(matched.getTitle())
                                .programStartAt(matched.getProgramStartAt())
                                .build());
            } else {
                sanitized.add(
                        GuardianWeeklyCareReportResponse.ProgramRecommendation.builder()
                                .category(item.category())
                                .reason(item.reason())
                                .hasProgram(false)
                                .noProgramMessage(
                                        hasText(item.noProgramMessage())
                                                ? item.noProgramMessage()
                                                : "현재 모집 중인 해당 분야 프로그램이 없습니다.")
                                .build());
            }
        }
        return sanitized;
    }

    private List<String> toLegacyRecommendationTexts(
            List<GuardianWeeklyCareReportResponse.ProgramRecommendation> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }
        List<String> texts = new ArrayList<>();
        for (GuardianWeeklyCareReportResponse.ProgramRecommendation item : items) {
            if (Boolean.TRUE.equals(item.getHasProgram()) && hasText(item.getProgramTitle())) {
                texts.add(
                        String.format(
                                "[%s] %s — %s",
                                item.getCategory(),
                                item.getProgramTitle(),
                                hasText(item.getReason()) ? item.getReason() : "환자 상태에 적합한 프로그램입니다."));
            } else if (Boolean.FALSE.equals(item.getHasProgram())) {
                texts.add(
                        String.format(
                                "[%s] %s",
                                item.getCategory(),
                                hasText(item.getNoProgramMessage())
                                        ? item.getNoProgramMessage()
                                        : "현재 모집 중인 해당 분야 프로그램이 없습니다."));
            }
        }
        return texts;
    }

    private GuardianWeeklyCareReportResponse.ProgramSection buildProgramRecommendationFallback(
            String riskLevel,
            List<String> riskFlags,
            String diagnosisTitle,
            String diagnosisComment,
            List<GuardianWeeklyCareReportResponse.ApplyEligibleProgram> eligiblePrograms,
            LocalDate nextWeekStart,
            String language) {
        GuardianWeeklyCareReportResponse.ProgramSection base = buildProgramSectionFallback(riskLevel, riskFlags, language);
        List<String> targetCategories = inferTargetCategories(diagnosisTitle, diagnosisComment, riskFlags);
        if (targetCategories.isEmpty()) {
            return GuardianWeeklyCareReportResponse.ProgramSection.builder()
                    .activityTitle(base.getActivityTitle())
                    .activityDescription(base.getActivityDescription())
                    .effects(base.getEffects())
                    .categoryRecommendations(List.of())
                    .recommendations(List.of())
                    .build();
        }

        Map<String, GuardianWeeklyCareReportResponse.ApplyEligibleProgram> byCategory =
                eligiblePrograms.stream()
                        .collect(
                                Collectors.toMap(
                                        GuardianWeeklyCareReportResponse.ApplyEligibleProgram::getCategory,
                                        p -> p,
                                        (a, b) -> a,
                                        LinkedHashMap::new));

        List<GuardianWeeklyCareReportResponse.ProgramRecommendation> recommendations = new ArrayList<>();
        List<String> dementiaPriorityTitles =
                List.of("나만의 추억 앨범 만들기", "숫자 카드 순서 맞추기");
        boolean dementiaContext =
                hasText(diagnosisTitle)
                        && (diagnosisTitle.contains("치매") || diagnosisTitle.contains("알츠하이머"));
        if (dementiaContext) {
            for (String title : dementiaPriorityTitles) {
                eligiblePrograms.stream()
                        .filter(p -> title.equals(p.getTitle()))
                        .findFirst()
                        .ifPresent(
                                matched ->
                                        recommendations.add(
                                                GuardianWeeklyCareReportResponse.ProgramRecommendation.builder()
                                                        .category(matched.getCategory())
                                                        .reason(
                                                                "알츠하이머형 치매 환자의 기억·인지 자극에 도움이 되는 모집 중 프로그램입니다.")
                                                        .hasProgram(true)
                                                        .postId(matched.getPostId())
                                                        .programTitle(matched.getTitle())
                                                        .programStartAt(matched.getProgramStartAt())
                                                        .build()));
            }
            if (!recommendations.isEmpty()) {
                return GuardianWeeklyCareReportResponse.ProgramSection.builder()
                        .activityTitle("인지·추억 자극 프로그램 권장")
                        .activityDescription(
                                "등록된 치매 진단과 주간 돌봄 기록을 바탕으로, 기억 회상·순서 인지 훈련에 적합한 모집 중 프로그램을 추천합니다.")
                        .effects(
                                List.of(
                                        "추억 자극 활동은 정서 안정과 자기 표현에 도움이 될 수 있습니다.",
                                        "숫자·순서 맞추기는 가벼운 인지 자극을 제공합니다."))
                        .categoryRecommendations(recommendations)
                        .recommendations(toLegacyRecommendationTexts(recommendations))
                        .build();
            }
        }

        for (String category : targetCategories) {
            GuardianWeeklyCareReportResponse.ApplyEligibleProgram matched = byCategory.get(category);
            if (matched != null) {
                recommendations.add(
                        GuardianWeeklyCareReportResponse.ProgramRecommendation.builder()
                                .category(category)
                                .reason(
                                        String.format(
                                                "%s부터 신청 가능한 모집 중 프로그램으로, 등록된 진단·주간 돌봄 상태를 고려해 추천합니다.",
                                                nextWeekStart))
                                .hasProgram(true)
                                .postId(matched.getPostId())
                                .programTitle(matched.getTitle())
                                .programStartAt(matched.getProgramStartAt())
                                .build());
            } else {
                recommendations.add(
                        GuardianWeeklyCareReportResponse.ProgramRecommendation.builder()
                                .category(category)
                                .reason("환자 상태 기준으로 도움이 될 수 있는 분야입니다.")
                                .hasProgram(false)
                                .noProgramMessage("현재 모집 중인 해당 분야 프로그램이 없습니다.")
                                .build());
            }
        }

        return GuardianWeeklyCareReportResponse.ProgramSection.builder()
                .activityTitle(base.getActivityTitle())
                .activityDescription(base.getActivityDescription())
                .effects(base.getEffects())
                .categoryRecommendations(recommendations)
                .recommendations(toLegacyRecommendationTexts(recommendations))
                .build();
    }

    private List<String> inferTargetCategories(
            String diagnosisTitle, String diagnosisComment, List<String> riskFlags) {
        String text =
                ((diagnosisTitle != null ? diagnosisTitle : "")
                                + " "
                                + (diagnosisComment != null ? diagnosisComment : ""))
                        .toLowerCase();
        List<String> categories = new ArrayList<>();
        if (text.contains("치매") || text.contains("알츠하이머") || text.contains("인지")) {
            categories.add("인지 강화");
        }
        if (riskFlags != null && riskFlags.contains("FALL_ALERT")) {
            categories.add("신체 활동");
        }
        if (riskFlags != null
                && (riskFlags.contains("LOW_HYDRATION") || riskFlags.contains("APPETITE_DECLINE"))) {
            categories.add("식생활·요리");
        }
        if (riskFlags != null
                && (riskFlags.contains("BREATHING_ALERT") || riskFlags.contains("PAIN_PERSISTENCE"))) {
            categories.add("음악 치료");
        }
        if (categories.isEmpty() && (text.contains("치매") || text.contains("기억"))) {
            categories.add("인지 강화");
        }
        return categories.stream().distinct().limit(3).toList();
    }

    private GuardianWeeklyCareReportResponse.PrescriptionSection buildPrescriptionSection(
            Patient patient,
            String patientDisplayName,
            LocalDate start,
            LocalDate end,
            int overallRate,
            String riskLevel,
            List<String> riskFlags,
            String diagnosisTitle,
            String diagnosisComment,
            String language) {
        List<Medication> medications =
                medicationRepository.findByPatientId_PatientIdOrderByPrescriptionDateDesc(patient.getPatientId());

        List<GuardianWeeklyCareReportResponse.PrescriptionSection.RegisteredMedication> registered =
                medications.stream()
                        .map(m -> GuardianWeeklyCareReportResponse.PrescriptionSection.RegisteredMedication.builder()
                                .medicationId(m.getMedicationId())
                                .prescriptionDate(m.getPrescriptionDate())
                                .medicineSummary(m.getMedicineSummary())
                                .build())
                        .toList();

        if (medications.isEmpty()) {
            return GuardianWeeklyCareReportResponse.PrescriptionSection.builder()
                    .summaryText("등록된 처방전이 없어 복약 분석을 제공할 수 없습니다.")
                    .medicationHighlights(List.of())
                    .cautions(List.of("보호자 앱에서 처방전 QR을 스캔해 등록해 주세요."))
                    .careTips(List.of())
                    .medications(List.of())
                    .build();
        }

        List<AiReportClient.PrescriptionMedicationItem> llmItems = new ArrayList<>();
        for (Medication medication : medications) {
            List<MedicationDetail> details = medicationDetailRepository
                    .findByMedication_MedicationIdOrderByMedicationDetailIdAsc(medication.getMedicationId());
            if (details.isEmpty()) {
                llmItems.add(new AiReportClient.PrescriptionMedicationItem(
                        medication.getMedicationId(),
                        String.valueOf(medication.getPrescriptionDate()),
                        medication.getMedicineSummary(),
                        medication.getMedicationName(),
                        null, null, null, null, null));
                continue;
            }
            for (MedicationDetail detail : details) {
                llmItems.add(new AiReportClient.PrescriptionMedicationItem(
                        medication.getMedicationId(),
                        String.valueOf(medication.getPrescriptionDate()),
                        medication.getMedicineSummary(),
                        firstNonBlank(detail.getMedicineName(), detail.getItemName(), medication.getMedicationName()),
                        firstNonBlank(detail.getEffect(), detail.getPermitEffect()),
                        firstNonBlank(detail.getUseMethod(), detail.getPermitUseMethod()),
                        firstNonBlank(detail.getCaution(), detail.getPermitCaution()),
                        detail.getWarning(),
                        detail.getSideEffect()));
            }
        }

        AiReportClient.PrescriptionSummaryResult generated = weeklyReportLlmService.generatePrescriptionSummary(
                new AiReportClient.PrescriptionSummaryInput(
                        patientDisplayName,
                        String.valueOf(start),
                        String.valueOf(end),
                        overallRate,
                        riskLevel,
                        riskFlags,
                        diagnosisTitle,
                        diagnosisComment,
                        llmItems,
                        language));

        if (generated != null && hasText(generated.summaryText())) {
            return GuardianWeeklyCareReportResponse.PrescriptionSection.builder()
                    .summaryText(generated.summaryText())
                    .medicationHighlights(generated.medicationHighlights())
                    .cautions(generated.cautions())
                    .careTips(generated.careTips())
                    .medications(registered)
                    .build();
        }

        return GuardianWeeklyCareReportResponse.PrescriptionSection.builder()
                .summaryText("등록된 처방전 "
                        + medications.size()
                        + "건을 확인했습니다. AI 분석 서비스(ai-report) 연결 후 상세 분석이 제공됩니다.")
                .medicationHighlights(
                        medications.stream()
                                .map(Medication::getMedicineSummary)
                                .filter(this::hasText)
                                .limit(4)
                                .toList())
                .cautions(List.of("복용 중 불편 증상이 있으면 담당 의료진과 상담해 주세요."))
                .careTips(List.of("처방전 등록 후 정기 보고서에서 복약·돌봄 연계 분석을 확인할 수 있습니다."))
                .medications(registered)
                .build();
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private LocalDate today() {
        return LocalDate.now(APP_ZONE);
    }

    // ============================================================
    // 내부 헬퍼
    // ============================================================

    private void validate(CaregiverCareCheckDto.SaveRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("요청 본문이 비어있습니다.");
        }
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException("patientId 는 필수입니다.");
        }
    }

    private Document newCareCheckDocument(Patient patient, LocalDate date) {
        Facility facility = patient.getFacilityId() != null
                ? patient.getFacilityId()
                : facilityRepository.findById(1L)
                    .orElseThrow(() -> new IllegalArgumentException("기본 시설(id=1) 이 없습니다."));

        return Document.builder()
                .patientId(patient)
                .facilityId(facility)
                .type(Document.DocumentType.CARE_CHECK)
                .title(buildTitle(patient, date))
                .status(Document.DocumentStatus.DRAFT)
                .recordDate(date)
                .build();
    }

    private String buildTitle(Patient patient, LocalDate date) {
        String name = patient.getName() != null ? patient.getName() : "환자";
        return String.format("%s 일일 업무 체크 - %s", name, date);
    }

    /**
     * 요청 Content 를 Document 본문에 반영한다.
     * <ul>
     *   <li>{@link Document#setContent(String)} 에 JSON 직렬화 결과를 그대로 저장</li>
     *   <li>{@link Document#setOverallStatus(Document.Status)} 는 항목 중 하나라도 ABNORMAL 이면 ABNORMAL</li>
     * </ul>
     */
    private void applyContent(Document document,
                              CaregiverCareCheckDto.Content content,
                              LocalDate date,
                              Patient patient,
                              Document.DocumentStatus newStatus) {
        document.setRecordDate(date);
        document.setPatientId(patient);
        document.setStatus(newStatus);
        document.setTitle(buildTitle(patient, date));

        if (content == null) {
            document.setContent(null);
            document.setOverallStatus(null);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(content);
            document.setContent(json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("체크리스트 JSON 직렬화 실패", e);
        }
        document.setOverallStatus(computeOverallStatus(content));
    }

    /** 항목 중 하나라도 ABNORMAL 이면 ABNORMAL, 그 외에는 NORMAL. 모두 미선택이면 null. */
    private Document.Status computeOverallStatus(CaregiverCareCheckDto.Content content) {
        boolean anySelected = false;
        boolean anyAbnormal = false;

        if (content.getMeal() != null) {
            anyAbnormal |= isAbnormal(content.getMeal().getMorning());
            anyAbnormal |= isAbnormal(content.getMeal().getLunch());
            anyAbnormal |= isAbnormal(content.getMeal().getDinner());
            anySelected |= hasAnyMealStatus(content.getMeal());
        }
        if (content.getHygiene() != null) {
            anyAbnormal |= isAbnormal(content.getHygiene().getBedding());
            anyAbnormal |= isAbnormal(content.getHygiene().getPatientItems());
            anyAbnormal |= isAbnormal(content.getHygiene().getBathing());
            anySelected |= statusOf(content.getHygiene().getBedding()) != null
                    || statusOf(content.getHygiene().getPatientItems()) != null
                    || statusOf(content.getHygiene().getBathing()) != null;
        }
        if (content.getCondition() != null) {
            anyAbnormal |= isAbnormal(content.getCondition().getBreathing());
            anyAbnormal |= isAbnormal(content.getCondition().getPain());
            anyAbnormal |= isAbnormal(content.getCondition().getFall());
            anySelected |= statusOf(content.getCondition().getBreathing()) != null
                    || statusOf(content.getCondition().getPain()) != null
                    || statusOf(content.getCondition().getFall()) != null;
        }
        if (content.getElimination() != null) {
            anyAbnormal |= hasAbnormalLog(content.getElimination().getUrination());
            anyAbnormal |= hasAbnormalLog(content.getElimination().getDefecation());
            anySelected |= hasAnyLog(content.getElimination().getUrination())
                    || hasAnyLog(content.getElimination().getDefecation());
        }

        if (!anySelected) {
            return null;
        }
        return anyAbnormal ? Document.Status.ABNORMAL : Document.Status.NORMAL;
    }

    private boolean hasAnyMealStatus(CaregiverCareCheckDto.MealSection meal) {
        return slotHasStatus(meal.getMorning())
                || slotHasStatus(meal.getLunch())
                || slotHasStatus(meal.getDinner());
    }

    private boolean slotHasStatus(CaregiverCareCheckDto.MealSlot slot) {
        if (slot == null) return false;
        return statusOf(slot.getIntake()) != null
                || statusOf(slot.getHydration()) != null
                || statusOf(slot.getIncident()) != null;
    }

    private boolean isAbnormal(CaregiverCareCheckDto.MealSlot slot) {
        if (slot == null) return false;
        return isAbnormal(slot.getIntake())
                || isAbnormal(slot.getHydration())
                || isAbnormal(slot.getIncident());
    }

    private boolean isAbnormal(CaregiverCareCheckDto.MealItem item) {
        return item != null && item.getStatus() == Document.Status.ABNORMAL;
    }

    private boolean isAbnormal(CaregiverCareCheckDto.HygieneItem item) {
        return item != null && item.getStatus() == Document.Status.ABNORMAL;
    }

    private boolean isAbnormal(CaregiverCareCheckDto.ConditionItem item) {
        return item != null && item.getStatus() == Document.Status.ABNORMAL;
    }

    /** EliminationItem 의 logs 중 하나라도 ABNORMAL 이면 true. */
    private boolean hasAbnormalLog(CaregiverCareCheckDto.EliminationItem item) {
        if (item == null || item.getLogs() == null) return false;
        return item.getLogs().stream()
                .anyMatch(l -> l != null && l.getStatus() == Document.Status.ABNORMAL);
    }

    /** EliminationItem 에 로그가 한 건이라도 있으면 true. */
    private boolean hasAnyLog(CaregiverCareCheckDto.EliminationItem item) {
        return item != null && item.getLogs() != null && !item.getLogs().isEmpty();
    }

    private Document.Status statusOf(CaregiverCareCheckDto.MealItem item) {
        return item == null ? null : item.getStatus();
    }

    private Document.Status statusOf(CaregiverCareCheckDto.HygieneItem item) {
        return item == null ? null : item.getStatus();
    }

    private Document.Status statusOf(CaregiverCareCheckDto.ConditionItem item) {
        return item == null ? null : item.getStatus();
    }

    /** 저장된 Document 를 응답 DTO 로 매핑(JSON content 를 다시 객체로 풀어서 채움). */
    private CaregiverCareCheckDto.Response toResponse(Document document) {
        CaregiverCareCheckDto.Content content = null;
        String raw = document.getContent();
        if (raw != null && !raw.isBlank()) {
            try {
                content = objectMapper.readValue(raw, CaregiverCareCheckDto.Content.class);
            } catch (JsonProcessingException ignored) {
                // 손상된 JSON 이라도 메타데이터는 살려서 응답한다.
                content = null;
            }
        }

        Patient patient = document.getPatientId();
        return CaregiverCareCheckDto.Response.builder()
                .documentId(document.getDocumentId())
                .patientId(patient != null ? patient.getPatientId() : null)
                .patientName(patient != null ? patient.getName() : null)
                .recordDate(document.getRecordDate())
                .status(document.getStatus())
                .overallStatus(document.getOverallStatus())
                .content(content)
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    private CaregiverCareCheckDto.Content parseContent(Document dayDoc) {
        if (dayDoc == null || dayDoc.getContent() == null || dayDoc.getContent().isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(dayDoc.getContent(), CaregiverCareCheckDto.Content.class);
        } catch (JsonProcessingException ignored) {
            return null;
        }
    }

    private GuardianWeeklyCareReportResponse.ChecklistRow checklistRow(String label,
                                                                        int total,
                                                                        int abnormal,
                                                                        List<String> dailyComments) {
        int p = rate(total, abnormal);
        String style = p >= 90 ? "success" : p >= 75 ? "warn" : "danger";
        return GuardianWeeklyCareReportResponse.ChecklistRow.builder()
                .label(label)
                .percent(p)
                .percentStyle(style)
                .dailyComments(dailyComments)
                .build();
    }

    private int rate(int total, int abnormal) {
        if (total <= 0) return 0;
        return Math.max(0, Math.min(100, (int) Math.round((double) (total - abnormal) * 100.0 / (double) total)));
    }

    private String dayLabel(LocalDate d) {
        DayOfWeek w = d.getDayOfWeek();
        return switch (w) {
            case MONDAY -> "월";
            case TUESDAY -> "화";
            case WEDNESDAY -> "수";
            case THURSDAY -> "목";
            case FRIDAY -> "금";
            case SATURDAY -> "토";
            case SUNDAY -> "일";
        };
    }

    private List<String> buildAiComments(List<String> riskFlags,
                                         int lowHydrationDays,
                                         int breathingAbnormalDays,
                                         int painAbnormalDays,
                                         int fallCount,
                                         int mealIncidentDays,
                                         String language) {
        List<String> comments = new ArrayList<>();

        if (riskFlags == null || riskFlags.isEmpty()) {
            comments.add(ls(language,
                "이번 주 기록에서는 급격한 악화 징후가 확인되지 않았습니다. 현재 돌봄 루틴을 유지해 주세요.",
                "No signs of sudden deterioration were found this week. Please maintain the current care routine.",
                "今週の記録では急激な悪化の兆候は確認されませんでした。現在のケアルーティンを維持してください。"));
            return comments;
        }

        if (riskFlags.contains("LOW_HYDRATION")) {
            comments.add(ls(language,
                "수분 섭취 저하 패턴이 반복되어 식사 사이 수분 보충 루틴 점검이 필요합니다.",
                "A recurring pattern of low hydration was observed. Checking the hydration routine between meals is recommended.",
                "水分摂取低下のパターンが繰り返されています。食事の間の水分補給ルーティンの確認が必要です。"));
        }
        if (riskFlags.contains("APPETITE_DECLINE")) {
            comments.add(ls(language,
                "식사량 감소일이 확인되어 선호 식단 중심의 섭취 유도가 권장됩니다.",
                "Days with reduced meal intake were observed. Encouraging preferred food choices is recommended.",
                "食事量が減少した日が確認されました。好みの食事を中心とした摂取誘導が推奨されます。"));
        }
        if (riskFlags.contains("FALL_ALERT")) {
            comments.add(ls(language,
                "낙상 관련 이상이 기록되어 이동 보조 및 환경 안전 확인을 강화해 주세요.",
                "Fall-related incidents were recorded. Please reinforce mobility assistance and environmental safety checks.",
                "転倒関連の異常が記録されました。移動補助と環境安全の確認を強化してください。"));
        }
        if (riskFlags.contains("BREATHING_ALERT")) {
            comments.add(ls(language,
                "호흡 이상이 관찰되어 컨디션 변화를 우선 모니터링해 주세요.",
                "Breathing abnormalities were observed. Please prioritize monitoring for condition changes.",
                "呼吸異常が観察されました。状態変化のモニタリングを優先してください。"));
        }
        if (riskFlags.contains("PAIN_PERSISTENCE")) {
            comments.add(ls(language,
                "통증 호소가 반복되어 통증 변화 추이를 의료진과 공유하는 것이 좋습니다.",
                "Repeated pain complaints were noted. Sharing pain trends with medical staff is advisable.",
                "痛みの訴えが繰り返されています。痛みの変化の推移を医療スタッフと共有することをお勧めします。"));
        }
        return comments;
    }

    private String formatObservedSentence(String prefix, List<String> signals) {
        if (signals == null || signals.isEmpty()) {
            return prefix + " 변화가 확인되지 않았습니다.";
        }
        if (signals.size() == 1) {
            return String.format("%s %s 확인되었습니다.", prefix, withSubjectParticle(signals.get(0)));
        }
        if (signals.size() == 2) {
            return String.format("%s %s와 %s 확인되었습니다.", prefix, signals.get(0), withSubjectParticle(signals.get(1)));
        }
        return String.format("%s %s, %s 및 %s 확인되었습니다.", prefix, signals.get(0), signals.get(1), withSubjectParticle(signals.get(2)));
    }

    private String withSubjectParticle(String word) {
        if (word == null || word.isBlank()) {
            return "";
        }
        char lastChar = word.charAt(word.length() - 1);
        if (lastChar < 0xAC00 || lastChar > 0xD7A3) {
            return word + "가";
        }
        int jongseong = (lastChar - 0xAC00) % 28;
        return word + (jongseong == 0 ? "가" : "이");
    }

    private List<String> buildNextWeekTips(List<String> riskFlags, String language) {
        List<String> tips = new ArrayList<>();
        if (riskFlags.contains("LOW_HYDRATION")) {
            tips.add(ls(language,
                "활동 전후 수분 섭취 체크 루틴을 고정해 주세요.",
                "Please establish a fixed hydration check routine before and after activities.",
                "活動の前後に水分摂取チェックルーティンを固定してください。"));
        }
        if (riskFlags.contains("APPETITE_DECLINE")) {
            tips.add(ls(language,
                "소량 다회 식사와 가벼운 스트레칭을 함께 적용해 주세요.",
                "Please apply small, frequent meals along with light stretching.",
                "少量多回食と軽いストレッチを併用してください。"));
        }
        if (riskFlags.contains("FALL_ALERT")) {
            tips.add(ls(language,
                "이동 동선 안전 점검과 보행 보조를 우선 적용해 주세요.",
                "Please prioritize safety checks of movement paths and walking assistance.",
                "移動経路の安全確認と歩行補助を優先的に実施してください。"));
        }
        if (riskFlags.contains("BREATHING_ALERT")) {
            tips.add(ls(language,
                "호흡 부담이 적은 저강도 활동으로 시간을 짧게 운영해 주세요.",
                "Please conduct low-intensity activities with less breathing burden in shorter sessions.",
                "呼吸負担の少ない低強度活動を短い時間で実施してください。"));
        }
        if (riskFlags.contains("PAIN_PERSISTENCE")) {
            tips.add(ls(language,
                "통증 관찰 시간을 고정하고 강도 변화를 기록해 주세요.",
                "Please fix a pain observation schedule and record intensity changes.",
                "痛みの観察時間を固定し、強度の変化を記録してください。"));
        }
        if (tips.isEmpty()) {
            tips.add(ls(language,
                "현재 활동 루틴을 유지하며 주 2회 인지 자극 활동을 병행해 주세요.",
                "Please maintain the current activity routine and add cognitive stimulation twice a week.",
                "現在の活動ルーティンを維持しながら、週2回の認知刺激活動を行ってください。"));
            tips.add(ls(language,
                "활동 전후 컨디션 변화를 짧게 기록해 다음 주 비교에 활용해 주세요.",
                "Please briefly record condition changes before and after activities for next week's comparison.",
                "活動前後の状態変化を簡単に記録し、来週の比較に活用してください。"));
        }
        if (tips.size() > 3) {
            return new ArrayList<>(tips.subList(0, 3));
        }
        return tips;
    }

    private String buildChecklistInsight(int overallRate, List<String> riskFlags, String language) {
        if (overallRate >= 90 && (riskFlags == null || riskFlags.isEmpty())) {
            return ls(language,
                "이번 주 체크리스트는 전반적으로 안정적으로 이행되었습니다.",
                "This week's checklist was overall completed stably.",
                "今週のチェックリストは全体的に安定して実施されました。");
        }
        if (riskFlags != null && riskFlags.contains("FALL_ALERT")) {
            return ls(language,
                "낙상 관련 관찰 항목의 변동이 있어 이동 보조 루틴을 우선 점검할 필요가 있습니다.",
                "Variations in fall-related items were found. Checking mobility assistance routines should be prioritized.",
                "転倒関連の観察項目に変動があり、移動補助ルーティンの優先確認が必要です。");
        }
        if (riskFlags != null && riskFlags.contains("LOW_HYDRATION")) {
            return ls(language,
                "수분 섭취 관련 항목의 변동이 있어 식사 간 수분 보충 관리가 필요합니다.",
                "Variations in hydration-related items were found. Managing hydration between meals is necessary.",
                "水分摂取関連項目に変動があり、食事間の水分補給管理が必要です。");
        }
        return ls(language,
            "일부 항목에서 변동이 확인되어 다음 주에는 주요 리스크 항목 중심의 관찰이 권장됩니다.",
            "Variations were detected in some items. Observation focusing on key risk items is recommended for next week.",
            "一部の項目で変動が確認されました。来週は主要リスク項目を中心とした観察が推奨されます。");
    }

    private GuardianWeeklyCareReportResponse.ProgramSection buildProgramSectionFallback(String riskLevel, List<String> riskFlags, String language) {
        String title;
        String description;
        List<String> effects = new ArrayList<>();

        switch (riskLevel) {
            case "위험" -> {
                title = ls(language, "저강도 컨디션 안정 활동", "Low-Intensity Stabilization Activity", "低強度コンディション安定活動");
                description = ls(language,
                        "호흡과 통증 부담을 낮추는 저강도 활동을 중심으로 구성했습니다.",
                        "Composed of low-intensity activities to reduce breathing difficulty and pain burden.",
                        "呼吸や痛みの負担を軽減する低強度活動を中心に構成しました。");
                effects.add(ls(language, "활동 중 피로 누적을 줄이고 안정적인 참여를 돕습니다.", "Reduces fatigue buildup and supports stable participation.", "活動中の疲労蓄積を減らし、安定した参加をサポートします。"));
                effects.add(ls(language, "컨디션 변화를 빠르게 파악해 돌봄 대응을 용이하게 합니다.", "Enables quick detection of condition changes for better care response.", "状態変化を素早く把握し、ケア対応を容易にします。"));
            }
            case "주의" -> {
                title = ls(language, "회복 중심 균형 활동", "Recovery-Focused Balanced Activity", "回復中心バランス活動");
                description = ls(language,
                        "신체 부담을 조절하면서 기능 유지와 회복을 함께 목표로 구성했습니다.",
                        "Designed to maintain function and promote recovery while managing physical burden.",
                        "身体負担を調整しながら、機能維持と回復を目標に構成しました。");
                effects.add(ls(language, "일상 기능 유지와 집중력 저하 방지에 도움이 됩니다.", "Helps maintain daily function and prevent decline in concentration.", "日常機能の維持と集中力低下防止に役立ちます。"));
                effects.add(ls(language, "활동 참여 리듬을 안정화해 주간 편차를 줄일 수 있습니다.", "Stabilizes activity participation rhythm and reduces weekly variation.", "活動参加のリズムを安定させ、週間のばらつきを減らします。"));
            }
            default -> {
                title = ls(language, "유지·증진 복합 활동", "Maintenance & Enhancement Activity", "維持・増進複合活動");
                description = ls(language,
                        "현재 안정 상태를 유지하면서 신체·인지 기능 증진을 목표로 구성했습니다.",
                        "Aimed at enhancing physical and cognitive function while maintaining current stability.",
                        "現在の安定状態を維持しながら、身体・認知機能の向上を目指して構成しました。");
                effects.add(ls(language, "소근육 및 인지 자극을 균형 있게 제공할 수 있습니다.", "Provides balanced fine motor and cognitive stimulation.", "微細運動と認知刺激をバランスよく提供できます。"));
                effects.add(ls(language, "정서 안정과 사회적 상호작용 유지에 도움이 됩니다.", "Supports emotional stability and maintains social interaction.", "感情の安定と社会的交流の維持に役立ちます。"));
            }
        }

        return GuardianWeeklyCareReportResponse.ProgramSection.builder()
                .activityTitle(title)
                .activityDescription(description)
                .effects(effects)
                .recommendations(buildNextWeekTips(riskFlags, language))
                .build();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private DayComputation computeDay(CaregiverCareCheckDto.Content c, String language) {
        DayComputation d = new DayComputation();
        if (c == null) {
            d.mealMorningMissing = true;
            d.mealLunchMissing = true;
            d.mealDinnerMissing = true;
            d.mealComment = ls(language, "아침/점심/저녁 미기입", "Morning/Lunch/Dinner not recorded", "朝食/昼食/夕食 未記入");
            d.hygieneComment = "-";
            d.conditionComment = "-";
            d.eliminationComment = "-";
            return d;
        }

        CaregiverCareCheckDto.MealSection meal = c.getMeal();
        CaregiverCareCheckDto.MealSlot morningSlot = meal != null ? meal.getMorning() : null;
        CaregiverCareCheckDto.MealSlot lunchSlot = meal != null ? meal.getLunch() : null;
        CaregiverCareCheckDto.MealSlot dinnerSlot = meal != null ? meal.getDinner() : null;

        d.mealMorningMissing = !slotFullyChecked(morningSlot);
        d.mealLunchMissing = !slotFullyChecked(lunchSlot);
        d.mealDinnerMissing = !slotFullyChecked(dinnerSlot);

        List<String> uncheckedSlots = new ArrayList<>();
        if (d.mealMorningMissing) uncheckedSlots.add(ls(language, "아침", "Morning", "朝食"));
        if (d.mealLunchMissing) uncheckedSlots.add(ls(language, "점심", "Lunch", "昼食"));
        if (d.mealDinnerMissing) uncheckedSlots.add(ls(language, "저녁", "Dinner", "夕食"));

        List<CaregiverCareCheckDto.MealItem> mealItems = Arrays.asList(
            morningSlot != null ? morningSlot.getIntake() : null,
            morningSlot != null ? morningSlot.getHydration() : null,
            morningSlot != null ? morningSlot.getIncident() : null,
            lunchSlot != null ? lunchSlot.getIntake() : null,
            lunchSlot != null ? lunchSlot.getHydration() : null,
            lunchSlot != null ? lunchSlot.getIncident() : null,
            dinnerSlot != null ? dinnerSlot.getIntake() : null,
            dinnerSlot != null ? dinnerSlot.getHydration() : null,
            dinnerSlot != null ? dinnerSlot.getIncident() : null
        );
        d.mealTotal = 9;
        int uncheckedMealItems = (int) mealItems.stream().filter(item -> statusOf(item) == null).count();
        d.mealAbnormal = (int) mealItems.stream().filter(this::isAbnormal).count() + uncheckedMealItems;

        d.lowHydration = isAbnormal(morningSlot != null ? morningSlot.getHydration() : null)
            || isAbnormal(lunchSlot != null ? lunchSlot.getHydration() : null)
            || isAbnormal(dinnerSlot != null ? dinnerSlot.getHydration() : null);
        d.appetiteDecline = isAbnormal(morningSlot != null ? morningSlot.getIntake() : null)
            || isAbnormal(lunchSlot != null ? lunchSlot.getIntake() : null)
            || isAbnormal(dinnerSlot != null ? dinnerSlot.getIntake() : null);
        d.mealIncident = isAbnormal(morningSlot != null ? morningSlot.getIncident() : null)
            || isAbnormal(lunchSlot != null ? lunchSlot.getIncident() : null)
            || isAbnormal(dinnerSlot != null ? dinnerSlot.getIncident() : null);

        if (!uncheckedSlots.isEmpty()) {
            d.mealComment = String.join("/", uncheckedSlots) + ls(language, " 미기입", " not recorded", " 未記入");
        } else {
            d.mealComment = d.lowHydration
                ? ls(language, "수분 섭취 저하", "Low hydration", "水分摂取低下")
                : d.appetiteDecline
                    ? ls(language, "식사량 감소", "Reduced appetite", "食事量減少")
                    : ls(language, "정상", "Normal", "正常");
        }

        CaregiverCareCheckDto.HygieneSection hygiene = c.getHygiene();
        List<CaregiverCareCheckDto.HygieneItem> hygieneItems = Arrays.asList(
                hygiene != null ? hygiene.getBedding() : null,
                hygiene != null ? hygiene.getPatientItems() : null,
                hygiene != null ? hygiene.getBathing() : null
        );
        d.hygieneTotal = 3;
        d.hygieneAbnormal = (int) hygieneItems.stream().filter(this::isAbnormal).count();
        d.hygieneComment = d.hygieneAbnormal > 0
            ? ls(language, "위생 항목 점검 필요", "Hygiene check needed", "衛生項目確認必要")
            : ls(language, "정상", "Normal", "正常");

        CaregiverCareCheckDto.ConditionSection condition = c.getCondition();
        d.breathingAbnormal = isAbnormal(condition != null ? condition.getBreathing() : null);
        d.painAbnormal = isAbnormal(condition != null ? condition.getPain() : null);
        d.fallAlert = isAbnormal(condition != null ? condition.getFall() : null);

        d.conditionTotal = 3;
        int conditionAbnormal = 0;
        if (d.breathingAbnormal) conditionAbnormal += 1;
        if (d.painAbnormal) conditionAbnormal += 1;
        if (d.fallAlert) conditionAbnormal += 1;
        d.conditionAbnormal = conditionAbnormal;
        d.conditionComment = conditionAbnormal > 0
            ? ls(language, "컨디션 이상 징후", "Condition abnormal", "状態異常の兆候")
            : ls(language, "정상", "Normal", "正常");

        d.eliminationTotal = 2;
        CaregiverCareCheckDto.EliminationSection elimination = c.getElimination();
        boolean urinationAbnormal = hasAbnormalLog(elimination != null ? elimination.getUrination() : null);
        boolean defecationAbnormal = hasAbnormalLog(elimination != null ? elimination.getDefecation() : null);
        d.eliminationAbnormal = (urinationAbnormal ? 1 : 0) + (defecationAbnormal ? 1 : 0);
        d.eliminationComment = defecationAbnormal
            ? ls(language, "배변 이상 기록", "Abnormal defecation", "排便異常記録")
            : urinationAbnormal
                ? ls(language, "배뇨 이상 기록", "Abnormal urination", "排尿異常記録")
                : ls(language, "정상", "Normal", "正常");

        d.overallTotal = d.mealTotal + d.hygieneTotal + 3 + d.eliminationTotal;
        d.overallAbnormal = d.mealAbnormal + d.hygieneAbnormal + conditionAbnormal + d.eliminationAbnormal;
        return d;
    }

    /** Returns the string for the given language (ko/en/ja). Falls back to ko. */
    private static String ls(String lang, String ko, String en, String ja) {
        if ("en".equals(lang)) return en;
        if ("ja".equals(lang)) return ja;
        return ko;
    }

    private static class DayComputation {
        int overallTotal;
        int overallAbnormal;
        int mealTotal;
        int mealAbnormal;
        int hygieneTotal;
        int hygieneAbnormal;
        int conditionTotal;
        int conditionAbnormal;
        int eliminationTotal;
        int eliminationAbnormal;
        boolean lowHydration;
        boolean appetiteDecline;
        boolean mealMorningMissing;
        boolean mealLunchMissing;
        boolean mealDinnerMissing;
        boolean fallAlert;
        boolean breathingAbnormal;
        boolean painAbnormal;
        boolean mealIncident;
        String mealComment;
        String hygieneComment;
        String conditionComment;
        String eliminationComment;
    }

    private boolean slotFullyChecked(CaregiverCareCheckDto.MealSlot slot) {
        if (slot == null) return false;
        return statusOf(slot.getIntake()) != null
            && statusOf(slot.getHydration()) != null
            && statusOf(slot.getIncident()) != null;
    }
}
