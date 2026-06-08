package hiddencore.ddasum.backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PostApplicationRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * 시연 보호자(guardian001)·기만경에는 프로그램 데모 신청을 자동 생성하지 않도록
 * 기존 데모 신청 건을 제거합니다.
 */
@Slf4j
@Configuration
public class GuardianProgramDemoGuard {

    public static final String DEMO_GUARDIAN_LOGIN = "guardian001";
    public static final long DEMO_GUARDIAN_PATIENT_ID = KimMankyungPatientSeeder.KIM_PATIENT_ID;

    @Bean
    CommandLineRunner purgeGuardianDemoProgramApplications(
            MemberRepository memberRepository,
            DocumentRepository documentRepository,
            PostApplicationRepository postApplicationRepository) {
        return args -> {
            Users guardian = memberRepository.findByLoginId(DEMO_GUARDIAN_LOGIN).orElse(null);
            if (guardian == null) {
                return;
            }

            List<Document> docs =
                    documentRepository.findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
                            guardian.getUserId(), DocumentType.PROGRAM_APPLICATION);

            int removed = 0;
            for (Document doc : docs) {
                boolean demoContent =
                        doc.getContent() != null && doc.getContent().contains("데모 데이터");
                if (!demoContent) {
                    continue;
                }
                postApplicationRepository
                        .findByDocument_DocumentId(doc.getDocumentId())
                        .ifPresent(postApplicationRepository::delete);
                documentRepository.delete(doc);
                removed++;
            }
            if (removed > 0) {
                log.info("[GuardianProgramDemoGuard] guardian001 데모 프로그램 신청 {}건 제거", removed);
            }
        };
    }

    public static boolean isDemoGuardianPatient(Long patientId) {
        return patientId != null && patientId == DEMO_GUARDIAN_PATIENT_ID;
    }

    public static boolean isDemoGuardian(Users user) {
        return user != null && DEMO_GUARDIAN_LOGIN.equals(user.getLoginId());
    }
}
