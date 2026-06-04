package hiddencore.ddasum.backend.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.PostApplicationRepository;
import hiddencore.ddasum.backend.repository.PostRepository;

/**
 * 신청 관리 화면용 샘플 신청자 — DB에 신청 건이 없을 때 보강.
 */
@Service
public class ProgramApplicationBootstrapService {

    private static final int MIN_APPLICANTS = 5;

    private final PostApplicationRepository postApplicationRepository;
    private final DocumentRepository documentRepository;
    private final PatientRepository patientRepository;
    private final GuardianPatientRepository guardianPatientRepository;
    private final MemberRepository memberRepository;
    private final PostRepository postRepository;
    private final PostService postService;

    public ProgramApplicationBootstrapService(
            PostApplicationRepository postApplicationRepository,
            DocumentRepository documentRepository,
            PatientRepository patientRepository,
            GuardianPatientRepository guardianPatientRepository,
            MemberRepository memberRepository,
            PostRepository postRepository,
            PostService postService) {
        this.postApplicationRepository = postApplicationRepository;
        this.documentRepository = documentRepository;
        this.patientRepository = patientRepository;
        this.guardianPatientRepository = guardianPatientRepository;
        this.memberRepository = memberRepository;
        this.postRepository = postRepository;
        this.postService = postService;
    }

    @Transactional
    public void ensureDemoApplicantsIfEmpty(Post post) {
        if (post == null || post.getType() != PostType.APPLY) {
            return;
        }

        Long facilityId = post.getFacilityId().getFacilityId();
        int existing = postApplicationRepository.findManagementApplications(facilityId, post.getPostId()).size();
        int target = resolveTargetCount(post, existing);
        if (existing >= target) {
            return;
        }

        List<Patient> patients = patientRepository.findByFacilityId_FacilityId(facilityId);
        if (patients.isEmpty()) {
            return;
        }

        Users fallbackGuardian = memberRepository.findAll().stream()
                .filter(u -> u.getRole() == UsersRole.GUARDIAN)
                .findFirst()
                .orElse(null);

        int confirmedTarget = Math.max(1, (int) Math.round(target * 0.55));
        int waitingTarget = Math.max(1, (int) Math.round(target * 0.30));
        int rejectedTarget = Math.max(0, target - confirmedTarget - waitingTarget);

        Set<Long> usedPatientIds = new HashSet<>();
        postApplicationRepository.findManagementApplications(facilityId, post.getPostId())
                .forEach(a -> usedPatientIds.add(a.getPatientId().getPatientId()));

        Facility facility = post.getFacilityId();
        LocalDateTime now = LocalDateTime.now();
        int patientIdx = 0;
        int day = 1;

        patientIdx = seedBucket(post, facility, patients, fallbackGuardian, usedPatientIds, patientIdx,
                confirmedTarget, PostApplicationStatus.COMPLETED, DocumentStatus.APPROVED, day, now);
        day += confirmedTarget;
        patientIdx = seedBucket(post, facility, patients, fallbackGuardian, usedPatientIds, patientIdx,
                waitingTarget, PostApplicationStatus.WAITING, DocumentStatus.PENDING_APPROVAL, day, now);
        day += waitingTarget;
        seedBucket(post, facility, patients, fallbackGuardian, usedPatientIds, patientIdx,
                rejectedTarget, PostApplicationStatus.REJECTED, DocumentStatus.REJECTED, day, now);

        int confirmedCount = postApplicationRepository.countByPostId_PostIdAndStatus(
                post.getPostId(), PostApplicationStatus.COMPLETED);
        postService.syncCurrentEnrolled(post, confirmedCount);

        Integer display = post.getCurrentEnrolled();
        if (display != null && display > confirmedCount) {
            post.setCurrentEnrolled(display);
            postRepository.save(post);
        }
    }

    private static int resolveTargetCount(Post post, int existing) {
        Integer enrolled = post.getCurrentEnrolled();
        int fromPost = enrolled != null && enrolled > 0 ? enrolled : MIN_APPLICANTS;
        return Math.max(MIN_APPLICANTS, Math.max(fromPost, existing));
    }

    private int seedBucket(
            Post post,
            Facility facility,
            List<Patient> patients,
            Users fallbackGuardian,
            Set<Long> usedPatientIds,
            int patientStartIdx,
            int target,
            PostApplicationStatus appStatus,
            DocumentStatus docStatus,
            int dayStart,
            LocalDateTime now) {
        int added = 0;
        int idx = patientStartIdx;
        int day = dayStart;
        while (added < target) {
            if (idx >= patients.size() * 3) {
                break;
            }
            Patient patient = patients.get(idx % patients.size());
            idx++;
            if (!usedPatientIds.add(patient.getPatientId())) {
                continue;
            }

            Users guardian = resolveGuardian(patient, fallbackGuardian);
            Users requester = guardian != null ? guardian : fallbackGuardian;
            if (requester == null) {
                break;
            }

            LocalDateTime appliedAt = now.minusDays(day).minusHours(added);
            day++;

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
        return idx;
    }

    private Users resolveGuardian(Patient patient, Users fallbackGuardian) {
        List<GuardianPatient> links = guardianPatientRepository
                .findByPatientId_PatientIdOrderByIsPrimaryDesc(patient.getPatientId());
        if (!links.isEmpty()) {
            return links.get(0).getGuardianUserId();
        }
        return fallbackGuardian != null && fallbackGuardian.getRole() == UsersRole.GUARDIAN
                ? fallbackGuardian
                : null;
    }
}
