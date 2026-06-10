package hiddencore.ddasum.backend.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import lombok.extern.slf4j.Slf4j;

/** 수납·결제 문서 더미 — 원무 입소자 상세·보호자 수납 화면용 */
@Slf4j
@Configuration
public class PaymentDemoSeeder {

    @Bean
    @Order(22)
    CommandLineRunner seedPaymentDemo(
            FacilityRepository facilityRepository,
            PatientRepository patientRepository,
            MemberRepository memberRepository,
            DocumentRepository documentRepository) {
        return args -> {
            try {
                Facility facility =
                        facilityRepository.findByFacilityCode("12345678").orElse(null);
                if (facility == null) {
                    return;
                }

                Patient patient =
                        patientRepository
                                .findById(DemoPatientConstants.KIM_PATIENT_ID)
                                .orElse(null);
                if (patient == null) {
                    log.info("[PaymentDemoSeeder] 기만경 없음 — 스킵");
                    return;
                }

                Users office =
                        memberRepository
                                .findByFacilityId_FacilityIdAndEmployeeLoginId(
                                        facility.getFacilityId(), "1120010101")
                                .orElseGet(
                                        () ->
                                                memberRepository.findAll().stream()
                                                        .filter(
                                                                u ->
                                                                        u.getRole()
                                                                                == Users.UsersRole
                                                                                        .OFFICE)
                                                        .findFirst()
                                                        .orElse(null));

                ensurePaymentDoc(
                        documentRepository,
                        patient,
                        facility,
                        office,
                        "2026.06 입원·식대 청구서",
                        "입원료 420,000원 / 식대 180,000원 / 비급여 검사 290,000원",
                        DocumentStatus.PAYMENT_PENDING);
                ensurePaymentDoc(
                        documentRepository,
                        patient,
                        facility,
                        office,
                        "2026.05 진료·약제비 수납 완료",
                        "진료비 300,000원 / 약제비 220,000원 — 2026-05-28 완납",
                        DocumentStatus.PAID);
                ensurePaymentDoc(
                        documentRepository,
                        patient,
                        facility,
                        office,
                        "2026.04 부분 수납 (잔액 미납)",
                        "총 890,000원 중 300,000원 수납, 잔액 590,000원",
                        DocumentStatus.PAYMENT_PENDING);

                log.info("[PaymentDemoSeeder] 기만경 수납 문서 3건 보강 완료");
            } catch (Exception e) {
                log.warn("[PaymentDemoSeeder] 시드 실패: {}", e.getMessage());
            }
        };
    }

    private static void ensurePaymentDoc(
            DocumentRepository documentRepository,
            Patient patient,
            Facility facility,
            Users office,
            String title,
            String content,
            DocumentStatus status) {
        Document existing =
                documentRepository
                        .findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(
                                patient.getPatientId(), DocumentType.PAYMENT)
                        .stream()
                        .filter(d -> title.equals(d.getTitle()))
                        .findFirst()
                        .orElse(null);

        LocalDateTime now = LocalDateTime.now();
        if (existing != null) {
            existing.setContent(content);
            existing.setStatus(status);
            existing.setRequesterUserId(office);
            if (existing.getIssuedAt() == null) {
                existing.setIssuedAt(now);
            }
            documentRepository.save(existing);
            return;
        }

        documentRepository.save(
                Document.builder()
                        .patientId(patient)
                        .facilityId(facility)
                        .type(DocumentType.PAYMENT)
                        .title(title)
                        .content(content)
                        .requesterUserId(office)
                        .status(status)
                        .issuedAt(now)
                        .requestedAt(now)
                        .build());
    }
}
