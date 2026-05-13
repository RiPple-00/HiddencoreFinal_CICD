package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.PostApplication;
import hiddencore.ddasum.backend.domain.PostApplication.PostApplicationStatus;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PostApplicationRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.web.dto.guardian.ProgramApplicationDto;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramApplicationService {

    private final DocumentRepository documentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final GuardianPatientRepository guardianPatientRepository;
    private final PostApplicationRepository postApplicationRepository;
    private final PostService postService;

    @Transactional
    public ProgramApplicationDto.Response applyProgram(Long guardianUserId, Long postId) {
        Users guardian = memberRepository.findByUserId(guardianUserId)
                .orElseThrow(() -> new IllegalArgumentException("보호자 정보를 찾을 수 없습니다."));

        Post program = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("프로그램을 찾을 수 없습니다."));

        if (program.getType() != PostType.APPLY) {
            throw new IllegalArgumentException("신청 가능한 프로그램 게시글이 아닙니다.");
        }

        if (program.getStatus() != PostStatus.ACTIVE) {
            throw new IllegalArgumentException("현재 신청할 수 없는 프로그램입니다.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (program.getStartAt() == null || program.getEndAt() == null) {
            throw new IllegalArgumentException("프로그램 일정이 등록되지 않았습니다.");
        }

        if (now.isAfter(program.getEndAt())) {
            throw new IllegalArgumentException("마감된 프로그램입니다.");
        }

        boolean alreadyApplied = documentRepository.existsByRequesterUserId_UserIdAndPostId_PostIdAndTypeAndStatusIn(
                guardianUserId,
                postId,
                DocumentType.PROGRAM_APPLICATION,
                List.of(DocumentStatus.PENDING_APPROVAL, DocumentStatus.APPROVED));

        if (alreadyApplied) {
            throw new IllegalArgumentException("이미 신청한 프로그램입니다.");
        }

        GuardianPatient guardianPatient = guardianPatientRepository
                .findByGuardianUserId_UserIdOrderByIsPrimaryDesc(guardianUserId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("보호자와 연결된 환자가 없습니다."));

        Document document = Document.builder()
                .patientId(guardianPatient.getPatientId())
                .facilityId(program.getFacilityId())
                .postId(program)
                .type(DocumentType.PROGRAM_APPLICATION)
                .title(program.getTitle())
                .content(makeApplicationContent(program))
                .requesterUserId(guardian)
                .status(DocumentStatus.PENDING_APPROVAL)
                .requestedAt(now)
                .build();

        Document savedDocument = documentRepository.save(document);

        PostApplication application = PostApplication.builder()
                .postId(program)
                .guardianUserId(guardian)
                .patientId(guardianPatient.getPatientId())
                .document(savedDocument)
                .status(PostApplicationStatus.WAITING)
                .appliedAt(now)
                .build();
        postApplicationRepository.save(application);

        int confirmed = postApplicationRepository.countByPostId_PostIdAndStatus(
                program.getPostId(), PostApplicationStatus.COMPLETED);
        postService.syncCurrentEnrolled(program, confirmed);

        return toResponse(savedDocument);
    }

    public List<ProgramApplicationDto.Response> getMyApplications(Long guardianUserId) {
        List<Document> docs =
                documentRepository
                        .findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
                                guardianUserId, DocumentType.PROGRAM_APPLICATION)
                        .stream()
                        .filter(d -> d.getStatus() != DocumentStatus.CANCELLED)
                        .toList();

        /*
         * 동일 프로그램(post)에 레거시 REQUESTED 문서와 신규 PENDING_APPROVAL 이 같이 있으면
         * 목록이 두 줄로 보인다. 게시글당 한 건만 노출(상태 우선·동률이면 최근 requestedAt).
         */
        Map<String, Document> bestByKey = new HashMap<>();
        for (Document d : docs) {
            String key =
                    d.getPostId() != null
                            ? "p:" + d.getPostId().getPostId()
                            : "d:" + d.getDocumentId();
            Document prev = bestByKey.get(key);
            if (prev == null || isBetterProgramApplicationRow(d, prev)) {
                bestByKey.put(key, d);
            }
        }

        return bestByKey.values().stream()
                .sorted(
                        Comparator.comparing(
                                        Document::getRequestedAt,
                                        Comparator.nullsLast(Comparator.reverseOrder()))
                                .thenComparing(Document::getDocumentId, Comparator.reverseOrder()))
                .map(this::toResponse)
                .toList();
    }

    /** 동일 post 중 화면에 남길 한 건 고르기 */
    private static boolean isBetterProgramApplicationRow(Document candidate, Document current) {
        int c = programApplicationStatusRank(candidate.getStatus());
        int p = programApplicationStatusRank(current.getStatus());
        if (c != p) {
            return c > p;
        }
        LocalDateTime ct = candidate.getRequestedAt();
        LocalDateTime pt = current.getRequestedAt();
        if (ct == null) {
            return false;
        }
        if (pt == null) {
            return true;
        }
        if (ct.isAfter(pt)) {
            return true;
        }
        if (ct.isBefore(pt)) {
            return false;
        }
        return candidate.getDocumentId() > current.getDocumentId();
    }

    private static int programApplicationStatusRank(DocumentStatus s) {
        if (s == null) {
            return 0;
        }
        return switch (s) {
            case APPROVED -> 50;
            case PENDING_APPROVAL -> 40;
            case REJECTED -> 30;
            case PAYMENT_PENDING, PAID, ISSUED -> 25;
            case REQUESTED -> 10;
            case DRAFT -> 5;
            default -> 15;
        };
    }

    @Transactional
    public void cancelApplication(Long guardianUserId, Long documentId) {
        Document document = documentRepository
                .findByDocumentIdAndRequesterUserId_UserIdAndType(
                        documentId,
                        guardianUserId,
                        DocumentType.PROGRAM_APPLICATION)
                .orElseThrow(() -> new IllegalArgumentException("신청 내역을 찾을 수 없습니다."));

        if (document.getStatus() == DocumentStatus.APPROVED) {
            throw new IllegalArgumentException("승인 완료된 신청은 앱에서 취소할 수 없습니다. 원무과에 문의해 주세요.");
        }
        if (document.getStatus() == DocumentStatus.REJECTED) {
            throw new IllegalArgumentException("이미 반려된 신청입니다.");
        }

        Post program = document.getPostId();
        postApplicationRepository.findByDocument_DocumentId(documentId).ifPresent(postApplicationRepository::delete);

        documentRepository.delete(document);

        if (program != null) {
            int confirmed = postApplicationRepository.countByPostId_PostIdAndStatus(
                    program.getPostId(), PostApplicationStatus.COMPLETED);
            postService.syncCurrentEnrolled(program, confirmed);
        }
    }

    private String makeApplicationContent(Post program) {
        return "프로그램 신청: " + program.getTitle();
    }

    private ProgramApplicationDto.Response toResponse(Document document) {
        Post program = document.getPostId();

        return ProgramApplicationDto.Response.builder()
                .documentId(document.getDocumentId())
                .postId(program != null ? program.getPostId() : null)
                .programTitle(program != null ? program.getTitle() : document.getTitle())
                .programStartAt(program != null ? program.getStartAt() : null)
                .programEndAt(program != null ? program.getEndAt() : null)
                .patientId(document.getPatientId() != null ? document.getPatientId().getPatientId() : null)
                .patientName(document.getPatientId() != null ? document.getPatientId().getName() : null)
                .status(document.getStatus())
                .statusLabel(toGuardianStatusLabel(document.getStatus()))
                .requestedAt(document.getRequestedAt())
                .build();
    }

    private static String toGuardianStatusLabel(DocumentStatus status) {
        if (status == null) {
            return "-";
        }
        return switch (status) {
            case PENDING_APPROVAL -> "승인 대기";
            case APPROVED -> "승인 완료";
            case REJECTED -> "반려";
            case CANCELLED -> "취소됨";
            case REQUESTED -> "접수됨";
            case DRAFT -> "작성 중";
            default -> status.name();
        };
    }
}
