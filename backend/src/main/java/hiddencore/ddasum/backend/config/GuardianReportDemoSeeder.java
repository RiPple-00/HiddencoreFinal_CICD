package hiddencore.ddasum.backend.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Document.Status;
import hiddencore.ddasum.backend.domain.Medication;
import hiddencore.ddasum.backend.domain.MedicationDetail;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.repository.MedicationRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.caregiver.CaregiverCareCheckRepository;
import hiddencore.ddasum.backend.web.dto.caregiver.CaregiverCareCheckDto;
import lombok.extern.slf4j.Slf4j;

/**
 * 보호자 주간 보고서 시연용 더미 — 기만경(260401008) 2026-06-01~07 체크리스트 + 처방전.
 */
@Slf4j
@Configuration
public class GuardianReportDemoSeeder {

    private static final long DEMO_PATIENT_ID = DemoPatientConstants.KIM_PATIENT_ID;
    private static final LocalDate WEEK_START = LocalDate.of(2026, 6, 1);
    private static final LocalDate WEEK_END = LocalDate.of(2026, 6, 7);

    @Bean
    @Order(21)
    CommandLineRunner seedGuardianReportDemo(
            PatientRepository patientRepository,
            MemberRepository memberRepository,
            CaregiverCareCheckRepository careCheckRepository,
            MedicationRepository medicationRepository,
            ObjectMapper objectMapper) {
        return args -> {
            try {
                Optional<Patient> patientOpt = patientRepository.findById(DEMO_PATIENT_ID);
                if (patientOpt.isEmpty()) {
                    log.info("[GuardianReportDemoSeeder] patient {} 없음 — 스킵", DEMO_PATIENT_ID);
                    return;
                }
                Patient patient = patientOpt.get();

                seedCareChecksIfMissing(patient, careCheckRepository, objectMapper);
                seedMedicationsIfMissing(patient, memberRepository, medicationRepository);
            } catch (Exception e) {
                log.warn("[GuardianReportDemoSeeder] 시드 실패: {}", e.getMessage());
            }
        };
    }

    private void seedCareChecksIfMissing(
            Patient patient,
            CaregiverCareCheckRepository careCheckRepository,
            ObjectMapper objectMapper) throws JsonProcessingException {
        List<Document> existing =
                careCheckRepository.findAllByPatientAndDateRange(
                        patient.getPatientId(), WEEK_START, WEEK_END);
        if (!existing.isEmpty()) {
            log.info("[GuardianReportDemoSeeder] CARE_CHECK {}건 이미 존재 — 스킵", existing.size());
            return;
        }

        LocalDate cursor = WEEK_START;
        int dayIndex = 0;
        while (!cursor.isAfter(WEEK_END)) {
            CaregiverCareCheckDto.Content content = buildDayContent(dayIndex);
            Status overall = isContentAbnormal(content) ? Status.ABNORMAL : Status.NORMAL;
            String json = objectMapper.writeValueAsString(content);
            LocalDateTime ts = cursor.atTime(18, 0);

            Document doc =
                    Document.builder()
                            .patientId(patient)
                            .facilityId(patient.getFacilityId())
                            .type(DocumentType.CARE_CHECK)
                            .title("기만경 일일 업무 체크 - " + cursor)
                            .content(json)
                            .status(DocumentStatus.PENDING_APPROVAL)
                            .overallStatus(overall)
                            .recordDate(cursor)
                            .requestedAt(ts)
                            .createdAt(ts)
                            .updatedAt(ts)
                            .build();
            careCheckRepository.save(doc);
            cursor = cursor.plusDays(1);
            dayIndex += 1;
        }
        log.info("[GuardianReportDemoSeeder] CARE_CHECK 7건 생성 ({} ~ {})", WEEK_START, WEEK_END);
    }

    private void seedMedicationsIfMissing(
            Patient patient,
            MemberRepository memberRepository,
            MedicationRepository medicationRepository) {
        List<Medication> existing =
                medicationRepository.findByPatientId_PatientIdOrderByPrescriptionDateDesc(patient.getPatientId());
        if (!existing.isEmpty()) {
            log.info("[GuardianReportDemoSeeder] MEDICATION {}건 이미 존재 — 스킵", existing.size());
            return;
        }

        Users guardian =
                memberRepository.findByLoginId("guardian001").orElse(null);
        Users doctor = resolveDoctor(memberRepository, patient);
        if (doctor == null) {
            log.warn("[GuardianReportDemoSeeder] 의사 계정 없음 — 처방전 시드 스킵");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        Medication med1 =
                Medication.builder()
                        .patientId(patient)
                        .guardianId(guardian)
                        .prescriptionDate(LocalDate.of(2026, 5, 28))
                        .medicationName("혈압·당뇨 복합 처방")
                        .startDate(LocalDate.of(2026, 5, 28))
                        .endDate(LocalDate.of(2026, 6, 27))
                        .doctorUserId(doctor)
                        .qrRawData("DEMO-QR-KIM-001")
                        .medicineSummary("암로디핀, 메트포르민")
                        .medicineData("[]")
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
        med1.getDetails()
                .add(
                        MedicationDetail.builder()
                                .medication(med1)
                                .medicineName("암로디핀정 5mg")
                                .effect("고혈압·협심증 치료. 칼슘채널 차단으로 혈관 확장.")
                                .useMethod("1일 1회 아침 식후 1정 복용")
                                .caution("어지러움·부종이 있을 수 있어 기립 시 천천히 일어나 주세요.")
                                .warning("임의 중단 시 혈압 급상승 위험이 있습니다.")
                                .sideEffect("부종, 두통, 어지러움")
                                .createdAt(now)
                                .updatedAt(now)
                                .build());
        med1.getDetails()
                .add(
                        MedicationDetail.builder()
                                .medication(med1)
                                .medicineName("메트포르민정 500mg")
                                .effect("제2형 당뇨병 혈당 조절")
                                .useMethod("1일 2회 식후 1정 복용")
                                .caution("식사와 함께 복용하고, 설사·속쓰림 시 의료진 상담")
                                .sideEffect("위장 장애, 설사")
                                .createdAt(now)
                                .updatedAt(now)
                                .build());

        Medication med2 =
                Medication.builder()
                        .patientId(patient)
                        .guardianId(guardian)
                        .prescriptionDate(LocalDate.of(2026, 6, 3))
                        .medicationName("소화·영양 보조 처방")
                        .startDate(LocalDate.of(2026, 6, 3))
                        .endDate(LocalDate.of(2026, 6, 23))
                        .doctorUserId(doctor)
                        .qrRawData("DEMO-QR-KIM-002")
                        .medicineSummary("판토프라졸, 종합비타민")
                        .medicineData("[]")
                        .createdAt(now)
                        .updatedAt(now)
                        .build();
        med2.getDetails()
                .add(
                        MedicationDetail.builder()
                                .medication(med2)
                                .medicineName("판토프라졸나트륨정 40mg")
                                .effect("위산 분비 억제, 위염·역류성 식도염 증상 완화")
                                .useMethod("1일 1회 아침 공복 1정")
                                .caution("장기 복용 시 정기 검진 권장")
                                .sideEffect("두통, 복부 팽만")
                                .createdAt(now)
                                .updatedAt(now)
                                .build());

        medicationRepository.save(med1);
        medicationRepository.save(med2);
        log.info("[GuardianReportDemoSeeder] MEDICATION 2건 생성 (기만경)");
    }

    private Users resolveDoctor(MemberRepository memberRepository, Patient patient) {
        if (patient.getFacilityId() != null) {
            Optional<Users> doctor =
                    memberRepository.findFirstByFacilityId_FacilityIdAndRole(
                            patient.getFacilityId().getFacilityId(), UsersRole.DOCTOR);
            if (doctor.isPresent()) {
                return doctor.get();
            }
        }
        return memberRepository.findByLoginId("12345678|2120010101").orElse(null);
    }

    private CaregiverCareCheckDto.Content buildDayContent(int dayIndex) {
        boolean lowHydration = dayIndex == 1 || dayIndex == 5;
        boolean appetiteLow = dayIndex == 2 || dayIndex == 3;
        boolean pain = dayIndex == 3;
        boolean fall = dayIndex == 4;
        boolean breathing = dayIndex == 5;
        boolean hasDefecation = dayIndex % 3 != 2;

        return CaregiverCareCheckDto.Content.builder()
                .meal(
                        CaregiverCareCheckDto.MealSection.builder()
                                .morning(
                                        mealSlot(
                                                appetiteLow ? Status.ABNORMAL : Status.NORMAL,
                                                appetiteLow ? "아침 식사량 평소 대비 감소" : "",
                                                lowHydration ? Status.ABNORMAL : Status.NORMAL,
                                                lowHydration ? "수분 섭취량이 적음" : "",
                                                Status.NORMAL,
                                                ""))
                                .lunch(
                                        mealSlot(
                                                appetiteLow ? Status.ABNORMAL : Status.NORMAL,
                                                appetiteLow ? "점심 식욕 저하" : "",
                                                lowHydration ? Status.ABNORMAL : Status.NORMAL,
                                                lowHydration ? "점심 물 섭취 부족" : "",
                                                fall ? Status.ABNORMAL : Status.NORMAL,
                                                fall ? "식사 중 어지럼 호소" : ""))
                                .dinner(
                                        mealSlot(
                                                Status.NORMAL,
                                                "",
                                                lowHydration ? Status.ABNORMAL : Status.NORMAL,
                                                lowHydration ? "저녁 수분 섭취 권고" : "",
                                                Status.NORMAL,
                                                ""))
                                .build())
                .hygiene(
                        CaregiverCareCheckDto.HygieneSection.builder()
                                .bedding(hygieneItem(Status.NORMAL, ""))
                                .patientItems(hygieneItem(fall ? Status.ABNORMAL : Status.NORMAL, fall ? "보행보조기 재정비 필요" : ""))
                                .bathing(hygieneItem(Status.NORMAL, ""))
                                .build())
                .condition(
                        CaregiverCareCheckDto.ConditionSection.builder()
                                .breathing(conditionItem(breathing ? Status.ABNORMAL : Status.NORMAL, breathing ? "호흡 빠름 관찰" : ""))
                                .pain(conditionItem(pain ? Status.ABNORMAL : Status.NORMAL, pain ? "허리 통증 호소" : ""))
                                .fall(conditionItem(fall ? Status.ABNORMAL : Status.NORMAL, fall ? "이동 중 중심 잃음" : ""))
                                .build())
                .elimination(
                        CaregiverCareCheckDto.EliminationSection.builder()
                                .urination(
                                        CaregiverCareCheckDto.EliminationItem.builder()
                                                .count(2)
                                                .logs(
                                                        List.of(
                                                                log("u1", Status.NORMAL, "오전 배뇨"),
                                                                log(
                                                                        "u2",
                                                                        lowHydration ? Status.ABNORMAL : Status.NORMAL,
                                                                        lowHydration ? "소변량 감소" : "오후 배뇨")))
                                                .build())
                                .defecation(
                                        CaregiverCareCheckDto.EliminationItem.builder()
                                                .count(hasDefecation ? 1 : 0)
                                                .logs(
                                                        hasDefecation
                                                                ? List.of(log("d1", Status.NORMAL, "배변 확인"))
                                                                : List.of())
                                                .build())
                                .build())
                .specialNotes(buildSpecialNotes(lowHydration, appetiteLow, pain, breathing, fall))
                .build();
    }

    private String buildSpecialNotes(
            boolean lowHydration,
            boolean appetiteLow,
            boolean pain,
            boolean breathing,
            boolean fall) {
        StringBuilder sb = new StringBuilder();
        if (lowHydration) {
            sb.append("수분 섭취량이 평소보다 적어 수시 권고함. ");
        }
        if (appetiteLow) {
            sb.append("식사량 감소 관찰되어 간식 보충. ");
        }
        if (pain) {
            sb.append("통증 호소로 체위 변경 및 휴식 유도. ");
        }
        if (breathing) {
            sb.append("호흡 패턴 변화 관찰, 추가 모니터링 필요. ");
        }
        if (fall) {
            sb.append("이동 시 낙상 위험 있어 보행 보조 강화. ");
        }
        return sb.isEmpty() ? "특이사항 없음" : sb.toString().trim();
    }

    private boolean isContentAbnormal(CaregiverCareCheckDto.Content content) {
        String notes = content.getSpecialNotes();
        return notes != null && !notes.isBlank() && !"특이사항 없음".equals(notes.trim());
    }

    private CaregiverCareCheckDto.MealSlot mealSlot(
            Status intakeStatus,
            String intakeMemo,
            Status hydrationStatus,
            String hydrationMemo,
            Status incidentStatus,
            String incidentMemo) {
        return CaregiverCareCheckDto.MealSlot.builder()
                .intake(mealItem(intakeStatus, intakeMemo))
                .hydration(mealItem(hydrationStatus, hydrationMemo))
                .incident(mealItem(incidentStatus, incidentMemo))
                .build();
    }

    private CaregiverCareCheckDto.MealItem mealItem(Status status, String memo) {
        return CaregiverCareCheckDto.MealItem.builder().status(status).memo(memo).build();
    }

    private CaregiverCareCheckDto.HygieneItem hygieneItem(Status status, String memo) {
        return CaregiverCareCheckDto.HygieneItem.builder().status(status).memo(memo).build();
    }

    private CaregiverCareCheckDto.ConditionItem conditionItem(Status status, String memo) {
        return CaregiverCareCheckDto.ConditionItem.builder().status(status).memo(memo).build();
    }

    private CaregiverCareCheckDto.EliminationLog log(String id, Status status, String memo) {
        return CaregiverCareCheckDto.EliminationLog.builder()
                .id(id)
                .status(status)
                .memo(memo)
                .createdAt(LocalDateTime.of(2026, 6, 1, 9, 0))
                .build();
    }
}
