package hiddencore.ddasum.backend.config;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.PageRequest;

import hiddencore.ddasum.backend.config.GuardianProgramDemoGuard;
import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.PostApplication;
import hiddencore.ddasum.backend.domain.PostApplication.PostApplicationStatus;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.PostApplicationRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.service.PostService;

/**
 * 프로그램 신청 관리 화면용 더미 — POST_APPLICATION·DOCUMENT 보강.
 * 게시판 모집 현황(current_enrolled) 규모에 맞춰 확정/대기/반려 명단을 채웁니다.
 */
@Configuration
public class ProgramApplicationSeeder {

    private static final String DEMO_FACILITY_CODE = "12345678";
    private static final int MIN_APPLICANTS_PER_POST = 5;

    @Bean
    @Order(5)
    CommandLineRunner seedProgramApplications(
            FacilityRepository facilityRepository,
            MemberRepository memberRepository,
            PatientRepository patientRepository,
            GuardianPatientRepository guardianPatientRepository,
            PostRepository postRepository,
            PostApplicationRepository postApplicationRepository,
            DocumentRepository documentRepository,
            PostService postService) {
        return args -> {
            Facility facility = facilityRepository.findByFacilityCode(DEMO_FACILITY_CODE)
                    .orElse(null);
            if (facility == null) {
                facility = facilityRepository.findAll().stream().findFirst().orElse(null);
            }
            if (facility == null) {
                return;
            }

            Long facilityId = facility.getFacilityId();
            List<Patient> patients = patientRepository.findByFacilityId_FacilityId(facilityId);
            if (patients.isEmpty()) {
                return;
            }

            Users fallbackRequester = memberRepository.findAll().stream()
                    .filter(u -> u.getRole() == UsersRole.GUARDIAN)
                    .findFirst()
                    .orElseGet(() -> memberRepository.findAll().stream().findFirst().orElse(null));

            List<Post> applyPosts = postRepository.findAllByFacilityAndType(
                    facilityId, PostType.APPLY, PageRequest.of(0, 500));

            for (Post post : applyPosts) {
                List<PostApplication> existing = postApplicationRepository.findManagementApplications(
                        facilityId, post.getPostId());
                int targetTotal = resolveTargetApplicantCount(post, existing.size());
                if (existing.size() >= targetTotal) {
                    continue;
                }

                int confirmedTarget = Math.max(1, (int) Math.round(targetTotal * 0.55));
                int waitingTarget = Math.max(1, (int) Math.round(targetTotal * 0.30));
                int rejectedTarget = Math.max(0, targetTotal - confirmedTarget - waitingTarget);

                int confirmedHave = countByStatus(existing, PostApplicationStatus.COMPLETED);
                int waitingHave = countByStatus(existing, PostApplicationStatus.WAITING);
                int rejectedHave = countByStatus(existing, PostApplicationStatus.REJECTED);

                Set<Long> usedPatientIds = new HashSet<>();
                existing.forEach(a -> usedPatientIds.add(a.getPatientId().getPatientId()));

                int patientIdx = 0;
                LocalDateTime now = LocalDateTime.now();

                confirmedHave = seedBucket(
                        post, facility, patients, guardianPatientRepository, memberRepository,
                        fallbackRequester,
                        documentRepository, postApplicationRepository, usedPatientIds,
                        confirmedHave, confirmedTarget, PostApplicationStatus.COMPLETED,
                        DocumentStatus.APPROVED, patientIdx, now);
                patientIdx += confirmedTarget;

                waitingHave = seedBucket(
                        post, facility, patients, guardianPatientRepository, memberRepository,
                        fallbackRequester,
                        documentRepository, postApplicationRepository, usedPatientIds,
                        waitingHave, waitingTarget, PostApplicationStatus.WAITING,
                        DocumentStatus.PENDING_APPROVAL, patientIdx, now);
                patientIdx += waitingTarget;

                seedBucket(
                        post, facility, patients, guardianPatientRepository, memberRepository,
                        fallbackRequester,
                        documentRepository, postApplicationRepository, usedPatientIds,
                        rejectedHave, rejectedTarget, PostApplicationStatus.REJECTED,
                        DocumentStatus.REJECTED, patientIdx, now);

                int confirmedCount = postApplicationRepository.countByPostId_PostIdAndStatus(
                        post.getPostId(), PostApplicationStatus.COMPLETED);
                postService.syncCurrentEnrolled(post, confirmedCount);

                Integer enrolledDisplay = post.getCurrentEnrolled();
                if (enrolledDisplay != null && enrolledDisplay > confirmedCount) {
                    post.setCurrentEnrolled(enrolledDisplay);
                    postRepository.save(post);
                }
            }
        };
    }

    private static int resolveTargetApplicantCount(Post post, int existingCount) {
        Integer enrolled = post.getCurrentEnrolled();
        int fromPost = enrolled != null && enrolled > 0 ? enrolled : MIN_APPLICANTS_PER_POST;
        return Math.max(MIN_APPLICANTS_PER_POST, Math.max(fromPost, existingCount));
    }

    private static int countByStatus(List<PostApplication> apps, PostApplicationStatus status) {
        return (int) apps.stream().filter(a -> a.getStatus() == status).count();
    }

    private static int seedBucket(
            Post post,
            Facility facility,
            List<Patient> patients,
            GuardianPatientRepository guardianPatientRepository,
            MemberRepository memberRepository,
            Users fallbackRequester,
            DocumentRepository documentRepository,
            PostApplicationRepository postApplicationRepository,
            Set<Long> usedPatientIds,
            int have,
            int target,
            PostApplicationStatus appStatus,
            DocumentStatus docStatus,
            int patientStartIdx,
            LocalDateTime now) {
        int added = 0;
        int idx = patientStartIdx;
        while (have + added < target) {
            Patient patient = patients.get(idx % patients.size());
            idx++;
            if (GuardianProgramDemoGuard.isDemoGuardianPatient(patient.getPatientId())) {
                if (idx - patientStartIdx > patients.size() * 2) {
                    break;
                }
                continue;
            }
            if (!usedPatientIds.add(patient.getPatientId())) {
                if (idx - patientStartIdx > patients.size() * 2) {
                    break;
                }
                continue;
            }

            Users guardian = resolveGuardian(
                    guardianPatientRepository, memberRepository, patient, fallbackRequester);
            if (GuardianProgramDemoGuard.isDemoGuardian(guardian)) {
                if (idx - patientStartIdx > patients.size() * 2) {
                    break;
                }
                continue;
            }
            Users requester = guardian != null ? guardian : fallbackRequester;
            if (requester == null) {
                break;
            }

            LocalDateTime appliedAt = now.minusDays(added + 1).minusHours(added);

            Document document = documentRepository.save(Document.builder()
                    .patientId(patient)
                    .facilityId(facility)
                    .postId(post)
                    .type(DocumentType.PROGRAM_APPLICATION)
                    .title(post.getTitle())
                    .content("프로그램 참여 신청 (데모 데이터)")
                    .requesterUserId(requester)
                    .status(docStatus)
                    .requestedAt(appliedAt)
                    .approvedAt(docStatus == DocumentStatus.APPROVED ? appliedAt.plusHours(2) : null)
                    .build());

            postApplicationRepository.save(PostApplication.builder()
                    .postId(post)
                    .guardianUserId(guardian)
                    .patientId(patient)
                    .document(document)
                    .status(appStatus)
                    .appliedAt(appliedAt)
                    .build());

            added++;
        }
        return have + added;
    }

    private static Users resolveGuardian(
            GuardianPatientRepository guardianPatientRepository,
            MemberRepository memberRepository,
            Patient patient,
            Users fallbackRequester) {
        List<GuardianPatient> links = guardianPatientRepository
                .findByPatientId_PatientIdOrderByIsPrimaryDesc(patient.getPatientId());
        if (!links.isEmpty()) {
            Users linked = links.get(0).getGuardianUserId();
            if (linked != null && linked.getUserId() != null) {
                return memberRepository.findById(linked.getUserId()).orElse(null);
            }
        }
        return fallbackRequester != null && fallbackRequester.getRole() == UsersRole.GUARDIAN
                ? fallbackRequester
                : null;
    }
}
