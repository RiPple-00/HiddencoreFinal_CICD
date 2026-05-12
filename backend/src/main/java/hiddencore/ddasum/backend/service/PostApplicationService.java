package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Post;
import org.springframework.stereotype.Service;
import hiddencore.ddasum.backend.domain.PostApplication;
import hiddencore.ddasum.backend.domain.PostApplication.PostApplicationStatus;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PostApplicationRepository;
import hiddencore.ddasum.backend.repository.PostRepository;
import hiddencore.ddasum.backend.web.dto.admin.PostApplicationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostApplicationService {
    
    private final PostApplicationRepository postApplicationRepository;
    private final PostRepository postRepository;
    private final MemberRepository memberRepository;
    private final PostService postService;

    public PostApplicationDto.ManagementResponse getApplications(Long facilityId, Long postId) {
        Post post = postRepository.findByPostIdAndFacilityId(postId, facilityId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        List<PostApplication> applications = postApplicationRepository.findManagementApplications(facilityId, postId);
        List<PostApplicationDto.ApplicationInfo> confirmedApplicants = applications.stream()
                .filter(application -> application.getStatus() == PostApplicationStatus.COMPLETED)
                .map(this::toApplicationInfo)
                .toList();
        List<PostApplicationDto.ApplicationInfo> waitingApplicants = applications.stream()
                .filter(application -> application.getStatus() == PostApplicationStatus.WAITING)
                .map(this::toApplicationInfo)
                .toList();

        return PostApplicationDto.ManagementResponse.builder()
                .programInfo(PostApplicationDto.ProgramInfo.builder()
                        .postId(post.getPostId())
                        .title(post.getTitle())
                        .description("프로그램의 신청 현황과 대기자 명단을 관리합니다.")
                        .totalQuota(post.getCapacity() != null ? post.getCapacity() : 0)
                        .confirmedCount(confirmedApplicants.size())
                        .waitingCount(waitingApplicants.size())
                        .remainingDays(calculateRemainingDays(post.getEndAt()))
                        .recruitStatus(resolveRecruitStatus(post))
                        .build())
                .confirmedApplicants(confirmedApplicants)
                .waitingApplicants(waitingApplicants)
                .build();
    }

    @Transactional
    public PostApplicationDto.ApplicationInfo updateApplicationStatus(
            Long facilityId,
            Long postId,
            Long applicationId,
            Long userId,
            PostApplicationDto.UpdateStatusRequest request) {
        PostApplication application = postApplicationRepository.findManagementApplication(facilityId, postId, applicationId)
                .orElseThrow(() -> new IllegalArgumentException("신청 내역을 찾을 수 없습니다."));
        Users processor = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        application.setStatus(request.getStatus());
        application.setMemo(request.getMemo());
        application.setProcessedBy(processor);
        application.setProcessedAt(LocalDateTime.now());

        int confirmedCount = postApplicationRepository.countByPostId_PostIdAndStatus(postId, PostApplicationStatus.COMPLETED);
        postService.syncCurrentEnrolled(application.getPostId(), confirmedCount);

        return toApplicationInfo(application);
    }

    private PostApplicationDto.ApplicationInfo toApplicationInfo(PostApplication application) {
        return PostApplicationDto.ApplicationInfo.builder()
                .applicationId(application.getApplicationId())
                .patientId(application.getPatientId().getPatientId())
                .patientName(application.getPatientId().getName())
                .genderAge(buildGenderAge(application.getPatientId()))
                .guardianPhone(application.getGuardianUserId() != null ? application.getGuardianUserId().getPhone() : "-")
                .status(application.getStatus().name())
                .statusLabel(resolveStatusLabel(application.getStatus()))
                .appliedAt(application.getAppliedAt() != null ? application.getAppliedAt().toString() : null)
                .build();
    }

    private String buildGenderAge(Patient patient) {
        String gender = patient.getGender() == null
                ? "-"
                : switch (patient.getGender()) {
                    case MALE -> "남";
                    case FEMALE -> "여";
                    default -> "기타";
                };

        if (patient.getBirthDate() == null) {
            return gender;
        }

        int age = Math.max(0, LocalDate.now().getYear() - patient.getBirthDate().getYear());
        return gender + " / " + age + "세";
    }

    private Integer calculateRemainingDays(LocalDateTime endAt) {
        if (endAt == null) {
            return null;
        }
        long diff = ChronoUnit.DAYS.between(LocalDate.now(), endAt.toLocalDate());
        return (int) diff;
    }

    private String resolveRecruitStatus(Post post) {
        if (post.getStartAt() == null || post.getEndAt() == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(post.getStartAt())) {
            return "모집 예정";
        }
        if (now.isAfter(post.getEndAt())) {
            return "마감";
        }
        return "모집 중";
    }

    private String resolveStatusLabel(PostApplicationStatus status) {
        return switch (status) {
            case WAITING -> "대기중";
            case COMPLETED -> "참여 확정";
            case CANCELLED -> "신청 취소";
            case FULL -> "정원 마감";
        };
    }
}
