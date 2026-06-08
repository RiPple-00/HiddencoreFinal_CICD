package hiddencore.ddasum.backend.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Location.RoomGenderType;
import hiddencore.ddasum.backend.domain.Location.RoomType;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Patient.BloodType;
import hiddencore.ddasum.backend.domain.Patient.Gender;
import hiddencore.ddasum.backend.domain.Patient.PatientStatus;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.LocationRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * 원무·요양사·보호자 공통 시연 환자 — 기만경(260401008, A동 107호).
 * bootRun 시 없으면 생성·있으면 진단/병상/연동 정보를 맞춥니다.
 */
@Slf4j
@Configuration
public class KimMankyungPatientSeeder {

    public static final long KIM_PATIENT_ID = 260401008L;
    public static final String KIM_PATIENT_NAME = "기만경";

    public static final String DIAGNOSIS_TITLE =
            "알츠하이머형 치매, 경도 단계\nMild Alzheimer's Dementia";

    public static final String DIAGNOSIS_COMMENT =
            "최근 기억력 저하가 주된 양상으로 관찰되며, 특히 최근 대화 내용이나 식사 여부, 약 복용 여부에 대한 회상이 불안정합니다. "
                    + "과거 기억과 기본적인 의사소통 능력은 비교적 유지되고 있으나, 시간 지남력 저하와 반복 질문이 동반됩니다. "
                    + "현재 상태에서는 일상생활 전반의 독립성은 일부 유지되나, 복약 관리 및 일정 확인에는 보호자 또는 요양 인력의 보조가 필요합니다.";

    @Bean
    CommandLineRunner seedKimMankyungPatient(
            FacilityRepository facilityRepository,
            LocationRepository locationRepository,
            PatientRepository patientRepository,
            MemberRepository memberRepository,
            GuardianPatientRepository guardianPatientRepository,
            JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");

                Facility facility =
                        facilityRepository.findByFacilityCode("12345678").orElse(null);
                if (facility == null) {
                    log.info("[KimMankyungPatientSeeder] 시설 12345678 없음 — 스킵");
                    return;
                }

                Location bed107 = ensureRoom107(facility, locationRepository);
                Users caregiver = resolveCaregiver(facility, memberRepository);

                upsertPatient(jdbcTemplate, facility, bed107, caregiver);
                Patient patient =
                        patientRepository
                                .findById(KIM_PATIENT_ID)
                                .orElseGet(
                                        () ->
                                                patientRepository
                                                        .findByFacilityId_FacilityId(
                                                                facility.getFacilityId())
                                                        .stream()
                                                        .filter(
                                                                p ->
                                                                        KIM_PATIENT_NAME.equals(
                                                                                p.getName()))
                                                        .findFirst()
                                                        .orElse(null));

                if (patient == null) {
                    log.warn("[KimMankyungPatientSeeder] 기만경 환자 생성 실패");
                    return;
                }

                applyPatientFields(patient, facility, bed107, caregiver);
                patientRepository.save(patient);

                if (bed107 != null) {
                    bed107.setPatientId(patient);
                    bed107.setIsOccupied(true);
                    locationRepository.save(bed107);
                }

                linkGuardian001(patient, memberRepository, guardianPatientRepository);
                log.info(
                        "[KimMankyungPatientSeeder] 기만경 patient_id={} 원무·요양사·보호자 연동 완료",
                        patient.getPatientId());
            } catch (Exception e) {
                log.warn("[KimMankyungPatientSeeder] 시드 실패: {}", e.getMessage());
            }
        };
    }

    private static Location ensureRoom107(Facility facility, LocationRepository locationRepository) {
        Long facilityId = facility.getFacilityId();
        Optional<Location> existing =
                locationRepository.findByFacilityId_FacilityId(facilityId).stream()
                        .filter(
                                loc ->
                                        "A동".equals(loc.getBuilding())
                                                && Integer.valueOf(1).equals(loc.getFloor())
                                                && "107".equals(loc.getRoom())
                                                && Integer.valueOf(1).equals(loc.getBed()))
                        .findFirst();

        if (existing.isPresent()) {
            return existing.get();
        }

        return locationRepository.save(
                Location.builder()
                        .facilityId(facility)
                        .building("A동")
                        .floor(1)
                        .room("107")
                        .bed(1)
                        .roomType(RoomType.GENERAL)
                        .roomGenderType(RoomGenderType.MALE)
                        .roomCapacity(4)
                        .isOccupied(false)
                        .build());
    }

    private static Users resolveCaregiver(Facility facility, MemberRepository memberRepository) {
        return memberRepository
                .findFirstByFacilityId_FacilityIdAndRole(facility.getFacilityId(), UsersRole.CAREGIVER)
                .orElse(
                        memberRepository
                                .findByFacilityId_FacilityIdAndEmployeeLoginId(
                                        facility.getFacilityId(), "3120010101")
                                .orElse(null));
    }

    private static void upsertPatient(
            JdbcTemplate jdbc,
            Facility facility,
            Location bed107,
            Users caregiver) {
        Long facilityId = facility.getFacilityId();
        Long locationId = bed107 != null ? bed107.getLocationId() : null;
        Long caregiverId = caregiver != null ? caregiver.getUserId() : null;

        jdbc.update(
                """
                INSERT INTO PATIENT (
                  patient_id, facility_id, location_id, primary_caregiver_user_id,
                  name, gender, birth_date, address, admission_date, discharge_date,
                  blood_type, admission_status, status, memo, created_at, updated_at
                ) VALUES (
                  ?, ?, ?, ?,
                  ?, 'MALE', '1942-05-12', '서울특별시 종로구', '2026-04-10', NULL,
                  'A_POSITIVE', ?, 'MONITORING', ?, NOW(), NOW()
                )
                ON DUPLICATE KEY UPDATE
                  facility_id = VALUES(facility_id),
                  location_id = VALUES(location_id),
                  primary_caregiver_user_id = VALUES(primary_caregiver_user_id),
                  name = VALUES(name),
                  gender = VALUES(gender),
                  birth_date = VALUES(birth_date),
                  address = VALUES(address),
                  admission_date = VALUES(admission_date),
                  discharge_date = NULL,
                  blood_type = VALUES(blood_type),
                  admission_status = VALUES(admission_status),
                  status = VALUES(status),
                  memo = VALUES(memo),
                  updated_at = NOW()
                """,
                KIM_PATIENT_ID,
                facilityId,
                locationId,
                caregiverId,
                KIM_PATIENT_NAME,
                DIAGNOSIS_TITLE,
                DIAGNOSIS_COMMENT);
    }

    private static void applyPatientFields(
            Patient patient, Facility facility, Location bed107, Users caregiver) {
        patient.setFacilityId(facility);
        patient.setLocationId(bed107);
        patient.setName(KIM_PATIENT_NAME);
        patient.setGender(Gender.MALE);
        patient.setBirthDate(LocalDate.of(1942, 5, 12));
        patient.setAddress("서울특별시 종로구");
        patient.setAdmissionDate(LocalDate.of(2026, 4, 10));
        patient.setDischargeDate(null);
        patient.setType(BloodType.A_POSITIVE);
        patient.setAdmissionStatus(DIAGNOSIS_TITLE);
        patient.setStatus(PatientStatus.MONITORING);
        patient.setMemo(DIAGNOSIS_COMMENT);
        patient.setUpdatedAt(LocalDateTime.now());
        if (caregiver != null) {
            patient.setPrimaryCaregiver(caregiver);
        }
    }

    private static void linkGuardian001(
            Patient patient,
            MemberRepository memberRepository,
            GuardianPatientRepository guardianPatientRepository) {
        Users guardian = memberRepository.findByLoginId("guardian001").orElse(null);
        if (guardian == null) {
            return;
        }

        for (GuardianPatient gp :
                guardianPatientRepository.findByGuardianUserId_UserId(guardian.getUserId())) {
            if (!Objects.equals(gp.getPatientId().getPatientId(), patient.getPatientId())) {
                guardianPatientRepository.delete(gp);
            }
        }

        GuardianPatient link =
                guardianPatientRepository
                        .findByGuardianUserId_UserIdAndPatientId_PatientId(
                                guardian.getUserId(), patient.getPatientId())
                        .orElse(
                                GuardianPatient.builder()
                                        .guardianUserId(guardian)
                                        .patientId(patient)
                                        .build());
        link.setRelationship("가족");
        link.setIsPrimary(true);
        guardianPatientRepository.save(link);
    }
}
