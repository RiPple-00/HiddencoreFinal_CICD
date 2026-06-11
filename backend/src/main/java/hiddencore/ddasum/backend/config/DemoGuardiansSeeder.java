package hiddencore.ddasum.backend.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.domain.Users.UsersStatus;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * 프로그램·면회 시연용 추가 보호자 — guardian001(기만경) 외 AI 환자 5명에 1:1 연결.
 */
@Slf4j
@Configuration
public class DemoGuardiansSeeder {

    private record DemoGuardianLink(String loginId, String name, long patientId, String relationship) {}

    private static final List<DemoGuardianLink> LINKS =
            List.of(
                    new DemoGuardianLink("guardian002", "나보호", 260401023L, "자녀"),
                    new DemoGuardianLink("guardian003", "김보호", 260401001L, "배우자"),
                    new DemoGuardianLink("guardian004", "강보호", 260402001L, "자녀"),
                    new DemoGuardianLink("guardian005", "태보호", 260401005L, "자녀"),
                    new DemoGuardianLink("guardian006", "장보호", 260401007L, "형제"));

    @Bean
    @Order(3)
    CommandLineRunner seedDemoGuardians(
            MemberRepository memberRepository,
            PatientRepository patientRepository,
            GuardianPatientRepository guardianPatientRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            int linked = 0;
            for (DemoGuardianLink link : LINKS) {
                Patient patient = patientRepository.findById(link.patientId()).orElse(null);
                if (patient == null) {
                    continue;
                }

                Users guardian =
                        memberRepository
                                .findByLoginId(link.loginId())
                                .orElse(Users.builder().loginId(link.loginId()).build());
                guardian.setFacilityId(null);
                guardian.setEmployeeLoginId(null);
                guardian.setHireDate(null);
                guardian.setPassword(passwordEncoder.encode("1234"));
                guardian.setName(link.name());
                guardian.setPhone("0107777" + String.format("%04d", linked + 2));
                guardian.setEmail(link.loginId() + "@ddasum.local");
                guardian.setRole(UsersRole.GUARDIAN);
                guardian.setStatus(UsersStatus.ACTIVE);
                guardian.setMustChangePassword(false);
                guardian.setEmailAgreed(true);
                guardian.setEmailAgreedAt(LocalDateTime.now());
                guardian = memberRepository.save(guardian);

                Users savedGuardian = guardian;
                GuardianPatient gp =
                        guardianPatientRepository
                                .findByGuardianUserId_UserIdAndPatientId_PatientId(
                                        savedGuardian.getUserId(), link.patientId())
                                .orElse(
                                        GuardianPatient.builder()
                                                .guardianUserId(savedGuardian)
                                                .patientId(patient)
                                                .build());
                gp.setRelationship(link.relationship());
                gp.setIsPrimary(true);
                guardianPatientRepository.save(gp);
                linked++;
            }
            if (linked > 0) {
                log.info("[DemoGuardiansSeeder] 추가 보호자 {}명·환자 연결 완료", linked);
            }
        };
    }
}
