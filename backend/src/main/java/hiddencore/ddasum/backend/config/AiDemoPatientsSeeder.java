package hiddencore.ddasum.backend.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.LocationRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * 얼굴 AI 시연 환자 6명 + 병실 배정 (Linux MySQL 소문자 테이블명 호환).
 * patient_1~6 ↔ InsightFace DB 키와 동일한 이름·ID.
 */
@Slf4j
@Configuration
public class AiDemoPatientsSeeder {

    record DemoPatient(
            long id,
            String name,
            String gender,
            LocalDate birthDate,
            LocalDate admissionDate,
            String bloodType,
            String status,
            String building,
            int floor,
            String room,
            int bed) {}

    private static final List<DemoPatient> DEMO_PATIENTS =
            List.of(
                    new DemoPatient(
                            260401023L,
                            "나채영",
                            "FEMALE",
                            LocalDate.of(1981, 4, 5),
                            LocalDate.of(2026, 5, 30),
                            "O_POSITIVE",
                            "MONITORING",
                            "A동",
                            1,
                            "102",
                            1),
                    new DemoPatient(
                            260401001L,
                            "김영희",
                            "FEMALE",
                            LocalDate.of(1952, 3, 14),
                            LocalDate.of(2026, 4, 1),
                            "A_POSITIVE",
                            "STABLE",
                            "A동",
                            1,
                            "101",
                            1),
                    new DemoPatient(
                            260402001L,
                            "강나연",
                            "FEMALE",
                            LocalDate.of(1991, 11, 2),
                            LocalDate.of(2026, 6, 4),
                            "AB_NEGATIVE",
                            "STABLE",
                            "A동",
                            1,
                            "103",
                            1),
                    new DemoPatient(
                            260401005L,
                            "김태우",
                            "MALE",
                            LocalDate.of(1968, 4, 30),
                            LocalDate.of(2026, 5, 1),
                            "A_POSITIVE",
                            "STABLE",
                            "A동",
                            1,
                            "104",
                            1),
                    new DemoPatient(
                            260401007L,
                            "장원준",
                            "MALE",
                            LocalDate.of(1965, 10, 20),
                            LocalDate.of(2026, 5, 2),
                            "AB_POSITIVE",
                            "STABLE",
                            "A동",
                            1,
                            "105",
                            1),
                    new DemoPatient(
                            KimMankyungPatientSeeder.KIM_PATIENT_ID,
                            KimMankyungPatientSeeder.KIM_PATIENT_NAME,
                            "MALE",
                            LocalDate.of(1942, 5, 12),
                            LocalDate.of(2026, 4, 10),
                            "A_POSITIVE",
                            "MONITORING",
                            "A동",
                            1,
                            "107",
                            1));

    @Bean
    @Order(2)
    CommandLineRunner seedAiDemoPatients(
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
                    log.info("[AiDemoPatientsSeeder] 시설 12345678 없음 — 스킵");
                    return;
                }

                Users caregiver =
                        memberRepository
                                .findByFacilityId_FacilityIdAndEmployeeLoginId(
                                        facility.getFacilityId(), "3120010101")
                                .orElse(null);
                Long caregiverId = caregiver != null ? caregiver.getUserId() : null;

                for (DemoPatient demo : DEMO_PATIENTS) {
                    // 107호 기만경 배정·중복 침상 정리는 KimMankyungPatientSeeder(@Order 20) 전담
                    if (demo.id() == KimMankyungPatientSeeder.KIM_PATIENT_ID) {
                        continue;
                    }
                    Location bed =
                            ensureBed(
                                    facility,
                                    locationRepository,
                                    demo.building(),
                                    demo.floor(),
                                    demo.room(),
                                    demo.bed());
                    Long locationId = bed != null ? bed.getLocationId() : null;

                    String admissionStatus =
                            demo.id() == KimMankyungPatientSeeder.KIM_PATIENT_ID
                                    ? KimMankyungPatientSeeder.DIAGNOSIS_TITLE
                                    : null;
                    String memo =
                            demo.id() == KimMankyungPatientSeeder.KIM_PATIENT_ID
                                    ? KimMankyungPatientSeeder.DIAGNOSIS_COMMENT
                                    : "AI 시연 환자";

                    jdbcTemplate.update(
                            """
                            INSERT INTO patient (
                              patient_id, facility_id, location_id, primary_caregiver_user_id,
                              name, gender, birth_date, address, admission_date, discharge_date,
                              blood_type, admission_status, status, memo, created_at, updated_at
                            ) VALUES (
                              ?, ?, ?, ?,
                              ?, ?, ?, '서울', ?, NULL,
                              ?, ?, ?, ?, NOW(), NOW()
                            )
                            ON DUPLICATE KEY UPDATE
                              facility_id = VALUES(facility_id),
                              location_id = VALUES(location_id),
                              primary_caregiver_user_id = COALESCE(VALUES(primary_caregiver_user_id), primary_caregiver_user_id),
                              name = VALUES(name),
                              gender = VALUES(gender),
                              birth_date = VALUES(birth_date),
                              admission_date = VALUES(admission_date),
                              blood_type = VALUES(blood_type),
                              admission_status = VALUES(admission_status),
                              status = VALUES(status),
                              memo = VALUES(memo),
                              updated_at = NOW()
                            """,
                            demo.id(),
                            facility.getFacilityId(),
                            locationId,
                            demo.id() == KimMankyungPatientSeeder.KIM_PATIENT_ID
                                    ? caregiverId
                                    : null,
                            demo.name(),
                            demo.gender(),
                            demo.birthDate(),
                            demo.admissionDate(),
                            demo.bloodType(),
                            admissionStatus,
                            demo.status(),
                            memo);

                    Patient patient =
                            patientRepository
                                    .findById(demo.id())
                                    .orElseThrow(
                                            () ->
                                                    new IllegalStateException(
                                                            "patient upsert failed: " + demo.id()));

                    if (bed != null) {
                        bed.setPatientId(patient);
                        bed.setIsOccupied(true);
                        locationRepository.save(bed);
                    }
                }

                linkGuardian001(
                        patientRepository
                                .findById(KimMankyungPatientSeeder.KIM_PATIENT_ID)
                                .orElse(null),
                        memberRepository,
                        guardianPatientRepository);

                log.info(
                        "[AiDemoPatientsSeeder] AI 시연 환자 {}명 병실 배정 완료",
                        DEMO_PATIENTS.size());
            } catch (Exception e) {
                log.warn("[AiDemoPatientsSeeder] 시드 실패: {}", e.getMessage());
            }
        };
    }

    private static Location ensureBed(
            Facility facility,
            LocationRepository locationRepository,
            String building,
            int floor,
            String room,
            int bed) {
        Optional<Location> existing =
                locationRepository.findByFacilityId_FacilityId(facility.getFacilityId()).stream()
                        .filter(
                                loc ->
                                        building.equals(loc.getBuilding())
                                                && Integer.valueOf(floor).equals(loc.getFloor())
                                                && room.equals(loc.getRoom())
                                                && Integer.valueOf(bed).equals(loc.getBed()))
                        .findFirst();
        return existing.orElse(null);
    }

    private static void linkGuardian001(
            Patient patient,
            MemberRepository memberRepository,
            GuardianPatientRepository guardianPatientRepository) {
        if (patient == null) {
            return;
        }
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
