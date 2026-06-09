package hiddencore.ddasum.backend.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    private static final long JANG_WONJUN_PATIENT_ID = 260401007L;
    private static final String ROOM_107_BUILDING = "A동";
    private static final int ROOM_107_FLOOR = 1;
    private static final String ROOM_107 = "107";
    private static final int ROOM_107_CAPACITY = 4;

    @Bean
    @Order(20)
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

                Location bed107 =
                        reconcileRoom107Beds(
                                facility, locationRepository, patientRepository, jdbcTemplate);
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

                assignKimToRoom107Bed1(
                        facility,
                        bed107,
                        patient,
                        locationRepository,
                        patientRepository,
                        jdbcTemplate);

                linkGuardian001(patient, memberRepository, guardianPatientRepository);
                log.info(
                        "[KimMankyungPatientSeeder] 기만경 patient_id={} 원무·요양사·보호자 연동 완료",
                        patient.getPatientId());
            } catch (Exception e) {
                log.warn("[KimMankyungPatientSeeder] 시드 실패: {}", e.getMessage());
            }
        };
    }

    /**
     * A동 107호 4인실(침상 1~4) 정리 후 기만경을 1번 침상에 배정.
     * 중복 LOCATION·잘못된 환자(장원준 등) 배정을 원무과 기준으로 맞춘다.
     */
    private static Location reconcileRoom107Beds(
            Facility facility,
            LocationRepository locationRepository,
            PatientRepository patientRepository,
            JdbcTemplate jdbcTemplate) {
        Long facilityId = facility.getFacilityId();
        List<Location> inRoom =
                locationRepository.findByFacilityId_FacilityId(facilityId).stream()
                        .filter(KimMankyungPatientSeeder::isRoom107)
                        .toList();

        Map<Integer, Location> canonicalByBed = pickCanonicalBeds(inRoom, jdbcTemplate);
        for (int bed = 1; bed <= ROOM_107_CAPACITY; bed++) {
            canonicalByBed.computeIfAbsent(
                    bed,
                    b ->
                            locationRepository.save(
                                    Location.builder()
                                            .facilityId(facility)
                                            .building(ROOM_107_BUILDING)
                                            .floor(ROOM_107_FLOOR)
                                            .room(ROOM_107)
                                            .bed(b)
                                            .roomType(RoomType.GENERAL)
                                            .roomGenderType(RoomGenderType.MALE)
                                            .roomCapacity(ROOM_107_CAPACITY)
                                            .isOccupied(false)
                                            .build()));
        }

        for (Location duplicate : inRoom) {
            if (duplicate.getBed() == null) {
                continue;
            }
            Location keep = canonicalByBed.get(duplicate.getBed());
            if (keep != null
                    && !Objects.equals(keep.getLocationId(), duplicate.getLocationId())) {
                clearBed(duplicate, patientRepository, jdbcTemplate);
                locationRepository.save(duplicate);
            }
        }

        for (Location bed : canonicalByBed.values()) {
            bed.setRoomCapacity(ROOM_107_CAPACITY);
            bed.setBuilding(ROOM_107_BUILDING);
            bed.setFloor(ROOM_107_FLOOR);
            bed.setRoom(ROOM_107);
            locationRepository.save(bed);
        }

        Location bed1 = canonicalByBed.get(1);

        for (Location loc : inRoom) {
            Long onBedId = lookupPatientIdOnLocation(jdbcTemplate, loc.getLocationId());
            if (onBedId != null && !Objects.equals(onBedId, KIM_PATIENT_ID)) {
                clearBed(loc, patientRepository, jdbcTemplate);
                locationRepository.save(loc);
            }
        }

        for (int bed = 2; bed <= ROOM_107_CAPACITY; bed++) {
            Location loc = canonicalByBed.get(bed);
            if (loc != null) {
                clearBed(loc, patientRepository, jdbcTemplate);
                locationRepository.save(loc);
            }
        }

        patientRepository
                .findByFacilityId_FacilityId(facilityId)
                .forEach(
                        p -> {
                            if (p.getPatientId() == null
                                    || Objects.equals(p.getPatientId(), KIM_PATIENT_ID)) {
                                return;
                            }
                            Location loc = p.getLocationId();
                            if (loc != null && isRoom107(loc)) {
                                loc.setPatientId(null);
                                loc.setIsOccupied(false);
                                locationRepository.save(loc);
                                p.setLocationId(null);
                                patientRepository.save(p);
                            }
                        });

        restoreJangWonjunToRoom105(
                facility, locationRepository, patientRepository, jdbcTemplate);

        if (bed1 != null) {
            clearBed(bed1, patientRepository, jdbcTemplate);
            locationRepository.save(bed1);
        }

        return bed1;
    }

    /** 107호 전체를 비운 뒤 기만경만 1번 침상에 양방향 배정 */
    private static void assignKimToRoom107Bed1(
            Facility facility,
            Location bed1,
            Patient kim,
            LocationRepository locationRepository,
            PatientRepository patientRepository,
            JdbcTemplate jdbcTemplate) {
        if (kim == null || bed1 == null) {
            return;
        }
        Long facilityId = facility.getFacilityId();
        List<Location> inRoom =
                locationRepository.findByFacilityId_FacilityId(facilityId).stream()
                        .filter(KimMankyungPatientSeeder::isRoom107)
                        .toList();
        for (Location loc : inRoom) {
            clearBed(loc, patientRepository, jdbcTemplate);
            locationRepository.save(loc);
        }
        bed1.setPatientId(kim);
        bed1.setIsOccupied(true);
        bed1.setRoomCapacity(ROOM_107_CAPACITY);
        locationRepository.save(bed1);
        kim.setLocationId(bed1);
        patientRepository.save(kim);
    }

    private static boolean isRoom107(Location loc) {
        return loc != null
                && ROOM_107_BUILDING.equals(loc.getBuilding())
                && Integer.valueOf(ROOM_107_FLOOR).equals(loc.getFloor())
                && ROOM_107.equals(normalizeRoomNumber(loc.getRoom()));
    }

    private static String normalizeRoomNumber(String room) {
        if (room == null) {
            return "";
        }
        return room.replaceAll("호$", "").trim();
    }

    private static Map<Integer, Location> pickCanonicalBeds(
            List<Location> inRoom, JdbcTemplate jdbcTemplate) {
        Map<Integer, Location> best = new LinkedHashMap<>();
        for (Location loc : inRoom) {
            if (loc.getBed() == null) {
                continue;
            }
            Location prev = best.get(loc.getBed());
            if (prev == null || preferCanonical(loc, prev, jdbcTemplate)) {
                best.put(loc.getBed(), loc);
            }
        }
        return best;
    }

    private static boolean preferCanonical(
            Location candidate, Location current, JdbcTemplate jdbcTemplate) {
        int cScore = locationTrustScore(candidate, jdbcTemplate);
        int pScore = locationTrustScore(current, jdbcTemplate);
        if (cScore != pScore) {
            return cScore > pScore;
        }
        return candidate.getLocationId() < current.getLocationId();
    }

    private static int locationTrustScore(Location loc, JdbcTemplate jdbcTemplate) {
        if (loc == null) {
            return 0;
        }
        Long patientId = lookupPatientIdOnLocation(jdbcTemplate, loc.getLocationId());
        if (patientId == null) {
            return Boolean.TRUE.equals(loc.getIsOccupied()) ? 1 : 0;
        }
        if (Objects.equals(patientId, KIM_PATIENT_ID)) {
            return 100;
        }
        return 10;
    }

    private static Long lookupPatientIdOnLocation(JdbcTemplate jdbc, Long locationId) {
        if (locationId == null) {
            return null;
        }
        return jdbc.query(
                "SELECT patient_id FROM location WHERE location_id = ?",
                rs -> {
                    if (!rs.next()) {
                        return null;
                    }
                    long value = rs.getLong("patient_id");
                    return rs.wasNull() ? null : value;
                },
                locationId);
    }

    private static void clearBed(
            Location loc, PatientRepository patientRepository, JdbcTemplate jdbcTemplate) {
        Long onBedId = lookupPatientIdOnLocation(jdbcTemplate, loc.getLocationId());
        if (onBedId != null) {
            Patient onBed = patientRepository.findById(onBedId).orElse(null);
            if (onBed != null
                    && onBed.getLocationId() != null
                    && Objects.equals(
                            onBed.getLocationId().getLocationId(), loc.getLocationId())) {
                onBed.setLocationId(null);
                patientRepository.save(onBed);
            }
            loc.setPatientId(null);
        }
        loc.setIsOccupied(false);
    }

    private static void restoreJangWonjunToRoom105(
            Facility facility,
            LocationRepository locationRepository,
            PatientRepository patientRepository,
            JdbcTemplate jdbcTemplate) {
        Patient jang = patientRepository.findById(JANG_WONJUN_PATIENT_ID).orElse(null);
        if (jang == null) {
            return;
        }
        if (jang.getLocationId() != null && isRoom107(jang.getLocationId())) {
            jang.setLocationId(null);
        }
        if (jang.getLocationId() != null) {
            patientRepository.save(jang);
            return;
        }
        Location bed105 =
                locationRepository.findByFacilityId_FacilityId(facility.getFacilityId()).stream()
                        .filter(
                                loc ->
                                        ROOM_107_BUILDING.equals(loc.getBuilding())
                                                && Integer.valueOf(ROOM_107_FLOOR)
                                                        .equals(loc.getFloor())
                                                && "105".equals(normalizeRoomNumber(loc.getRoom()))
                                                && Integer.valueOf(1).equals(loc.getBed()))
                        .findFirst()
                        .orElse(null);
        if (bed105 == null) {
            patientRepository.save(jang);
            return;
        }
        if (lookupPatientIdOnLocation(jdbcTemplate, bed105.getLocationId()) == null) {
            bed105.setPatientId(jang);
            bed105.setIsOccupied(true);
            locationRepository.save(bed105);
            jang.setLocationId(bed105);
        }
        patientRepository.save(jang);
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
                INSERT INTO patient (
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
