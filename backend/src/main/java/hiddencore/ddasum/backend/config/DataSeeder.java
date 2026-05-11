package hiddencore.ddasum.backend.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Location.RoomGenderType;
import hiddencore.ddasum.backend.domain.Location.RoomType;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.Schedule;
import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.domain.Users.UsersStatus;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.LocationRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.repository.ScheduleRepository;
import hiddencore.ddasum.backend.security.StaffLoginIdCodec;

/*
 * ════════════════════════════════════════
 *  데모 계정 목록 (시설코드: 12345678)
 * ════════════════════════════════════════
 *
 *  [원무과]
 *  시설코드 : 12345678
 *  직원ID   : 1120010101
 *  비밀번호 : office123!
 *
 *  [의사]
 *  시설코드 : 12345678
 *  직원ID   : 2120010101
 *  비밀번호 : office123!
 *
 *  [요양사]
 *  시설코드 : 12345678
 *  직원ID   : 3120010101
 *  비밀번호 : office123!
 *
 *  [보호자]
 *  로그인ID : guardian001
 *  비밀번호 : 1234
 * ════════════════════════════════════════
 */

@Configuration
public class DataSeeder {

        @Bean
        CommandLineRunner seedAuthDemo(
                        FacilityRepository facilityRepository,
                        MemberRepository memberRepository,
                        PasswordEncoder passwordEncoder,
                        LocationRepository locationRepository,
                        PostRepository postRepository,
                        ScheduleRepository scheduleRepository,
                        PatientRepository patientRepository,
                        GuardianPatientRepository guardianPatientRepository) {
                return args -> {

                        /* ── 시설 ── */
                        for (Facility f : facilityRepository.findAll()) {
                                if (f.getFacilityCode() == null || f.getFacilityCode().isBlank()) {
                                        String code = String.format("%08d",
                                                        Math.min(99_999_999, f.getFacilityId().intValue()));
                                        f.setFacilityCode(code);
                                        facilityRepository.save(f);
                                }
                        }

                        Facility facility = facilityRepository
                                        .findByFacilityCode("12345678")
                                        .orElseGet(() -> facilityRepository.save(
                                                        Facility.builder()
                                                                        .name("데모 요양병원")
                                                                        .address("서울특별시")
                                                                        .phone("02-0000-0000")
                                                                        .facilityCode("12345678")
                                                                        .build()));

                        if (facility.getFacilityCode() == null || facility.getFacilityCode().isBlank()) {
                                facility.setFacilityCode("12345678");
                                facility = facilityRepository.save(facility);
                        }

                        /* ── 직원 ── */
                        String demoEmployeeId = "1120010101";
                        String loginId = StaffLoginIdCodec.encode(facility.getFacilityCode(), demoEmployeeId);
                        Users office = memberRepository.findByLoginId(loginId)
                                        .orElse(Users.builder().loginId(loginId).employeeLoginId(demoEmployeeId)
                                                        .build());
                        office.setFacilityId(facility);
                        office.setEmployeeLoginId(demoEmployeeId);
                        office.setHireDate(LocalDate.of(2020, 1, 1));
                        office.setPassword(passwordEncoder.encode("office123!"));
                        office.setName("데모 원무");
                        office.setPhone("01010000001");
                        office.setEmail("office-demo@ddasum.local");
                        office.setRole(UsersRole.OFFICE);
                        office.setStatus(UsersStatus.ACTIVE);
                        office.setMustChangePassword(false);
                        office.setEmailAgreed(true);
                        office.setEmailAgreedAt(LocalDateTime.now());
                        office = memberRepository.save(office);

                        String demoDoctorEmployeeId = "2120010101";
                        String doctorLoginId = StaffLoginIdCodec.encode(facility.getFacilityCode(),
                                        demoDoctorEmployeeId);
                        Users doctor = memberRepository.findByLoginId(doctorLoginId)
                                        .orElse(Users.builder().loginId(doctorLoginId)
                                                        .employeeLoginId(demoDoctorEmployeeId).build());
                        doctor.setFacilityId(facility);
                        doctor.setEmployeeLoginId(demoDoctorEmployeeId);
                        doctor.setHireDate(LocalDate.of(2020, 1, 1));
                        doctor.setPassword(passwordEncoder.encode("office123!"));
                        doctor.setName("데모 의사");
                        doctor.setPhone("01020000001");
                        doctor.setEmail("doctor-demo@ddasum.local");
                        doctor.setRole(UsersRole.DOCTOR);
                        doctor.setStatus(UsersStatus.ACTIVE);
                        doctor.setMustChangePassword(false);
                        doctor.setEmailAgreed(true);
                        doctor.setEmailAgreedAt(LocalDateTime.now());
                        doctor = memberRepository.save(doctor);

                        String demoCaregiverEmployeeId = "3120010101";
                        String caregiverLoginId = StaffLoginIdCodec.encode(facility.getFacilityCode(),
                                        demoCaregiverEmployeeId);
                        Users caregiver = memberRepository.findByLoginId(caregiverLoginId)
                                        .orElse(Users.builder().loginId(caregiverLoginId)
                                                        .employeeLoginId(demoCaregiverEmployeeId).build());
                        caregiver.setFacilityId(facility);
                        caregiver.setEmployeeLoginId(demoCaregiverEmployeeId);
                        caregiver.setHireDate(LocalDate.of(2020, 1, 1));
                        caregiver.setPassword(passwordEncoder.encode("office123!"));
                        caregiver.setName("데모 요양사");
                        caregiver.setPhone("01030000001");
                        caregiver.setEmail("caregiver-demo@ddasum.local");
                        caregiver.setRole(UsersRole.CAREGIVER);
                        caregiver.setStatus(UsersStatus.ACTIVE);
                        caregiver.setMustChangePassword(false);
                        caregiver.setEmailAgreed(true);
                        caregiver.setEmailAgreedAt(LocalDateTime.now());
                        memberRepository.save(caregiver);

                        Users guardian = memberRepository.findByLoginId("guardian001")
                                        .orElse(Users.builder().loginId("guardian001").build());
                        guardian.setFacilityId(null);
                        guardian.setEmployeeLoginId(null);
                        guardian.setHireDate(null);
                        guardian.setPassword(passwordEncoder.encode("1234"));
                        guardian.setName("데모 보호자");
                        guardian.setPhone("01099998888");
                        guardian.setEmail("guardian-demo@ddasum.local");
                        guardian.setRole(UsersRole.GUARDIAN);
                        guardian.setStatus(UsersStatus.ACTIVE);
                        guardian.setMustChangePassword(false);
                        guardian.setEmailAgreed(true);
                        guardian.setEmailAgreedAt(LocalDateTime.now());
                        memberRepository.save(guardian);

                        /* ── Location 더미 ── */
                        if (locationRepository.findByFacilityId_FacilityId(facility.getFacilityId()).isEmpty()) {

                                // A동 1~5층, 층당 5개 병실(4인실)
                                String[] genders = { "MALE", "FEMALE", "CONCOCTION", "MALE", "FEMALE" };
                                for (int floor = 1; floor <= 5; floor++) {
                                        for (int roomNum = 1; roomNum <= 5; roomNum++) {
                                                String room = floor + "0" + roomNum;
                                                RoomGenderType gender = RoomGenderType.valueOf(genders[roomNum - 1]);
                                                for (int bed = 1; bed <= 4; bed++) {
                                                        locationRepository.save(Location.builder()
                                                                        .facilityId(facility).building("A동")
                                                                        .floor(floor)
                                                                        .room(room).bed(bed).roomType(RoomType.GENERAL)
                                                                        .roomGenderType(gender).roomCapacity(4)
                                                                        .isOccupied(false).build());
                                                }
                                        }
                                }

                                // B동 1층: 일반실 3개 + 중환자실 2개
                                for (int roomNum = 1; roomNum <= 3; roomNum++) {
                                        for (int bed = 1; bed <= 4; bed++) {
                                                locationRepository.save(Location.builder()
                                                                .facilityId(facility).building("B동").floor(1)
                                                                .room("10" + roomNum).bed(bed)
                                                                .roomType(RoomType.GENERAL)
                                                                .roomGenderType(RoomGenderType.CONCOCTION)
                                                                .roomCapacity(4).isOccupied(false).build());
                                        }
                                }
                                for (int roomNum = 4; roomNum <= 5; roomNum++) {
                                        for (int bed = 1; bed <= 2; bed++) {
                                                locationRepository.save(Location.builder()
                                                                .facilityId(facility).building("B동").floor(1)
                                                                .room("10" + roomNum).bed(bed).roomType(RoomType.ICU)
                                                                .roomGenderType(RoomGenderType.CONCOCTION)
                                                                .roomCapacity(2).isOccupied(false).build());
                                        }
                                }

                                // B동 2층: 일반실 3개 + 격리실 2개
                                for (int roomNum = 1; roomNum <= 3; roomNum++) {
                                        for (int bed = 1; bed <= 4; bed++) {
                                                locationRepository.save(Location.builder()
                                                                .facilityId(facility).building("B동").floor(2)
                                                                .room("20" + roomNum).bed(bed)
                                                                .roomType(RoomType.GENERAL)
                                                                .roomGenderType(RoomGenderType.CONCOCTION)
                                                                .roomCapacity(4).isOccupied(false).build());
                                        }
                                }
                                for (int roomNum = 4; roomNum <= 5; roomNum++) {
                                        for (int bed = 1; bed <= 2; bed++) {
                                                locationRepository.save(Location.builder()
                                                                .facilityId(facility).building("B동").floor(2)
                                                                .room("20" + roomNum).bed(bed)
                                                                .roomType(RoomType.ISOLATION)
                                                                .roomGenderType(RoomGenderType.CONCOCTION)
                                                                .roomCapacity(2).isOccupied(false).build());
                                        }
                                }

                                // B동 3층: 일반실 3개 + 중환자실 1개 + 격리실 1개
                                for (int roomNum = 1; roomNum <= 3; roomNum++) {
                                        for (int bed = 1; bed <= 4; bed++) {
                                                locationRepository.save(Location.builder()
                                                                .facilityId(facility).building("B동").floor(3)
                                                                .room("30" + roomNum).bed(bed)
                                                                .roomType(RoomType.GENERAL)
                                                                .roomGenderType(RoomGenderType.CONCOCTION)
                                                                .roomCapacity(4).isOccupied(false).build());
                                        }
                                }
                                for (int bed = 1; bed <= 2; bed++) {
                                        locationRepository.save(Location.builder()
                                                        .facilityId(facility).building("B동").floor(3)
                                                        .room("304").bed(bed).roomType(RoomType.ICU)
                                                        .roomGenderType(RoomGenderType.CONCOCTION).roomCapacity(2)
                                                        .isOccupied(false).build());
                                }
                                for (int bed = 1; bed <= 2; bed++) {
                                        locationRepository.save(Location.builder()
                                                        .facilityId(facility).building("B동").floor(3)
                                                        .room("305").bed(bed).roomType(RoomType.ISOLATION)
                                                        .roomGenderType(RoomGenderType.CONCOCTION).roomCapacity(2)
                                                        .isOccupied(false).build());
                                }
                        }

                        /* ── 데모: 보호자 ↔ 환자 연결 (요양사 체크리스트 조회용) ── */
                        if (guardianPatientRepository.findByGuardianUserId_UserId(guardian.getUserId()).isEmpty()) {
                                List<Patient> inFacility =
                                                patientRepository.findByFacilityId_FacilityId(facility.getFacilityId());
                                Patient demoPatient;
                                if (inFacility.isEmpty()) {
                                        Location freeBed =
                                                        locationRepository
                                                                        .findByFacilityId_FacilityId(
                                                                                        facility.getFacilityId())
                                                                        .stream()
                                                                        .filter(loc -> loc.getPatientId() == null)
                                                                        .findFirst()
                                                                        .orElse(null);
                                        demoPatient =
                                                        patientRepository.save(
                                                                        Patient.builder()
                                                                                        .facilityId(facility)
                                                                                        .locationId(freeBed)
                                                                                        .primaryCaregiver(caregiver)
                                                                                        .name("데모 환자(보호자연결)")
                                                                                        .gender(Patient.Gender.MALE)
                                                                                        .birthDate(LocalDate.of(1942, 5, 12))
                                                                                        .admissionDate(
                                                                                                        LocalDate.now()
                                                                                                                        .minusMonths(
                                                                                                                                        1))
                                                                                        .type(Patient.BloodType.A_POSITIVE)
                                                                                        .status(Patient.PatientStatus.STABLE)
                                                                                        .build());
                                        if (freeBed != null) {
                                                freeBed.setPatientId(demoPatient);
                                                freeBed.setIsOccupied(true);
                                                locationRepository.save(freeBed);
                                        }
                                } else {
                                        demoPatient = inFacility.get(0);
                                }
                                guardianPatientRepository.save(
                                                GuardianPatient.builder()
                                                                .guardianUserId(guardian)
                                                                .patientId(demoPatient)
                                                                .relationship("가족")
                                                                .isPrimary(true)
                                                                .build());
                        }

                        /* ── Post 더미 ── */
                        if (postRepository.findAllByFacility(facility.getFacilityId(), PageRequest.of(0, 1))
                                        .isEmpty()) {
                                postRepository.saveAll(List.of(
                                                Post.builder().facilityId(facility).authorUserId(office)
                                                                .type(PostType.URGENT).title("긴급 서버 점검 안내")
                                                                .content("오늘 오후 11시부터 새벽 2시까지 시스템 점검이 있습니다.")
                                                                .status(PostStatus.ACTIVE).isPinned(true)
                                                                .targetRoles("DOCTOR,CAREGIVER,OFFICE").views(42)
                                                                .build(),
                                                Post.builder().facilityId(facility).authorUserId(office)
                                                                .type(PostType.ADMIN).title("추석 연휴 면회 예약 시스템 오픈")
                                                                .content("추석 연휴 기간 면회 예약을 시스템을 통해 진행해 주세요.")
                                                                .status(PostStatus.ACTIVE).isPinned(false)
                                                                .targetRoles("DOCTOR,CAREGIVER,OFFICE").views(15)
                                                                .build(),
                                                Post.builder().facilityId(facility).authorUserId(office)
                                                                .type(PostType.FACILITY).title("3층 엘리베이터 점검 안내")
                                                                .content("3층 엘리베이터가 5월 5일 오전 10시부터 12시까지 점검 예정입니다.")
                                                                .status(PostStatus.ACTIVE).isPinned(false)
                                                                .targetRoles("DOCTOR,CAREGIVER,OFFICE").views(8)
                                                                .build(),
                                                Post.builder().facilityId(facility).authorUserId(doctor)
                                                                .type(PostType.CLINICAL).title("당뇨 환자 식이 가이드라인 업데이트")
                                                                .content("최신 당뇨 환자 식이 가이드라인이 업데이트되었습니다.")
                                                                .status(PostStatus.ACTIVE).isPinned(false)
                                                                .targetRoles("DOCTOR,CAREGIVER").views(23).build(),
                                                Post.builder().facilityId(facility).authorUserId(office)
                                                                .type(PostType.APPLY).title("5월 종이접기 프로그램 참여 신청")
                                                                .content("5월 종이접기 프로그램을 진행합니다. 정원 20명이니 빠른 신청 바랍니다.")
                                                                .status(PostStatus.ACTIVE).isPinned(false)
                                                                .startAt(LocalDateTime.now().plusDays(3))
                                                                .endAt(LocalDateTime.now().plusDays(10))
                                                                .capacity(20).currentEnrolled(0).views(31).build(),
                                                Post.builder().facilityId(facility).authorUserId(office)
                                                                .type(PostType.APPLY).title("원예 치료 프로그램 모집")
                                                                .content("봄 원예 치료 프로그램 참여자를 모집합니다.")
                                                                .status(PostStatus.ACTIVE).isPinned(false)
                                                                .startAt(LocalDateTime.now().plusDays(7))
                                                                .endAt(LocalDateTime.now().plusDays(14))
                                                                .capacity(15).currentEnrolled(0).views(18).build(),
                                                Post.builder().facilityId(facility).authorUserId(office)
                                                                .type(PostType.GENERAL).title("4월 생신잔치 후기")
                                                                .content("4월 생신잔치가 성황리에 마무리되었습니다. 참여해 주신 모든 분께 감사드립니다.")
                                                                .status(PostStatus.ACTIVE).isPinned(false).views(55)
                                                                .build()));
                        }

                        if (scheduleRepository.findByFacilityId_FacilityIdAndTypeOrderByCreatedAtDesc(
                                        facility.getFacilityId(),
                                        ScheduleType.PROGRAM).isEmpty()) {
                                scheduleRepository.saveAll(List.of(
                                                Schedule.builder()
                                                                .facilityId(facility)
                                                                .createdUserId(office)
                                                                .title("5월 종이접기 프로그램 참여 신청")
                                                                .content("5월 종이접기 프로그램을 진행합니다. 정원 20명이니 빠른 신청 바랍니다.")
                                                                .type(ScheduleType.PROGRAM)
                                                                .scheduledAt(LocalDateTime.now().plusDays(12)
                                                                                .withHour(14).withMinute(0)
                                                                                .withSecond(0).withNano(0))
                                                                .endAt(LocalDateTime.now().plusDays(12)
                                                                                .withHour(15).withMinute(30)
                                                                                .withSecond(0).withNano(0))
                                                                .build(),
                                                Schedule.builder()
                                                                .facilityId(facility)
                                                                .createdUserId(office)
                                                                .title("원예 치료 프로그램 모집")
                                                                .content("봄 원예 치료 프로그램 참여자를 모집합니다.")
                                                                .type(ScheduleType.PROGRAM)
                                                                .scheduledAt(LocalDateTime.now().plusDays(18)
                                                                                .withHour(10).withMinute(30)
                                                                                .withSecond(0).withNano(0))
                                                                .endAt(LocalDateTime.now().plusDays(18)
                                                                                .withHour(12).withMinute(0)
                                                                                .withSecond(0).withNano(0))
                                                                .build()));
                        }
                };
        }
}