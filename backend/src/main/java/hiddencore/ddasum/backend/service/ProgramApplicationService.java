package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.web.dto.guardian.ProgramApplicationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProgramApplicationService {

    private final DocumentRepository documentRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final GuardianPatientRepository guardianPatientRepository;

    @Transactional
    public ProgramApplicationDto.Response applyProgram(Long guardianUserId, Long postId) {
        Users guardian = memberRepository.findByUserId(guardianUserId)
                .orElseThrow(() -> new IllegalArgumentException("보호자 정보를 찾을 수 없습니다."));

        if (guardian.getRole() != UsersRole.GUARDIAN) {
            throw new IllegalArgumentException("보호자만 프로그램을 신청할 수 있습니다.");
        }

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

        if (now.isBefore(program.getStartAt())) {
            throw new IllegalArgumentException("아직 신청 가능한 시간이 아닙니다.");
        }

        if (now.isAfter(program.getEndAt())) {
            throw new IllegalArgumentException("마감된 프로그램입니다.");
        }

        boolean alreadyApplied = documentRepository.existsByRequesterUserId_UserIdAndPostId_PostIdAndType(
                guardianUserId,
                postId,
                DocumentType.PROGRAM_APPLICATION);

        if (alreadyApplied) {
            throw new IllegalArgumentException("이미 신청한 프로그램입니다.");
        }

        int currentEnrolled = program.getCurrentEnrolled() == null ? 0 : program.getCurrentEnrolled();

        if (program.getCapacity() != null && currentEnrolled >= program.getCapacity()) {
            throw new IllegalArgumentException("정원이 마감된 프로그램입니다.");
        }

        GuardianPatient guardianPatient = guardianPatientRepository
                .findByGuardianUserId_UserIdOrderByIsPrimaryDesc(guardianUserId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("보호자와 연결된 환자가 없습니다."));

        program.setCurrentEnrolled(currentEnrolled + 1);

        Document document = Document.builder()
                .patientId(guardianPatient.getPatientId())
                .facilityId(program.getFacilityId())
                .postId(program)
                .type(DocumentType.PROGRAM_APPLICATION)
                .title(program.getTitle())
                .content(makeApplicationContent(program))
                .requesterUserId(guardian)
                .status(DocumentStatus.REQUESTED)
                .requestedAt(now)
                .build();

        Document savedDocument = documentRepository.save(document);

        return toResponse(savedDocument);
    }

    public List<ProgramApplicationDto.Response> getMyApplications(Long guardianUserId) {
        return documentRepository
                .findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
                        guardianUserId,
                        DocumentType.PROGRAM_APPLICATION)
                .stream()
                .map(this::toResponse)
                .toList();
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
                .requestedAt(document.getRequestedAt())
                .build();
    }
}