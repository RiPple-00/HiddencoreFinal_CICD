package hiddencore.ddasum.backend.web.dto;

import java.time.LocalDateTime;

import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostStatus;
import hiddencore.ddasum.backend.domain.Post.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PostDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest { // 글 작성할 때 받는 데이터

        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다")
        private String title;

        @NotBlank(message = "내용은 필수입니다")
        private String content;

        @NotNull(message = "게시글 타입은 필수입니다")
        private PostType type; // URGENT | CLINICAL | ADMIN | FACILITY | APPLY | REVIEW | GENERAL

        @NotNull(message = "게시글 상태는 필수입니다")
        private PostStatus status; // ACTIVE | INACTIVE | RESERVE

        private Boolean isPinned; // 상단 고정 여부. null이면 false로 처리
        private String targetRoles; // 공지 게시판 공개 대상. "DOCTOR,CAREGIVER" 형태. null이면 전체 공개

        private Integer capacity; // PROGRAM일 때만 사용
        private LocalDateTime startAt; // PROGRAM일 때만 사용
        private LocalDateTime endAt; // PROGRAM일 때만 사용
        private String attachmentUrls;
        private LocalDateTime reservationAt; // 예약 시간. null이면 즉시 게시, 값이 있으면 RESERVE 상태로 처리

        private LocalDateTime scheduledAt; // 실제 시작일 (SCHEDULE용)
        private LocalDateTime scheduleEndAt; // 실제 종료일 (SCHEDULE용)

    } //

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostResponse { // 단일 게시글 조회

        private Long id;
        private Long facilityId;
        private String authorName;
        private PostType type;
        private Boolean isPinned;
        private String targetRoles; // "DOCTOR,CAREGIVER" 형태 그대로 반환. 프론트에서 split(",")으로 파싱
        private String title;
        private String content;
        private PostStatus status;
        private Integer views;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private Integer capacity;
        private Integer currentEnrolled;
        private String attachmentUrls;
        private LocalDateTime reservationAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static PostResponse from(Post post) { // 단일 게시글 조회

            return PostResponse.builder()
                    .id(post.getPostId())
                    .facilityId(post.getFacilityId().getFacilityId())
                    .authorName(post.getAuthorUserId().getName())
                    .type(post.getType())
                    .isPinned(post.getIsPinned())
                    .targetRoles(post.getTargetRoles())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .status(post.getStatus())
                    .views(post.getViews())
                    .startAt(post.getStartAt())
                    .endAt(post.getEndAt())
                    .capacity(post.getCapacity())
                    .currentEnrolled(post.getCurrentEnrolled())
                    .attachmentUrls(post.getAttachmentUrls())
                    .reservationAt(post.getReservationAt())
                    .createdAt(post.getCreatedAt())
                    .updatedAt(post.getUpdatedAt())
                    .build();
        }//

        // 조회 시점에 startAt, endAt 기준으로 모집 상태 계산
        // DB에 저장하지 않고 DTO 변환 시점에 계산하여 반환
        public String getRecruitStatus() {
            if (startAt == null || endAt == null)
                return null;
            LocalDateTime now = LocalDateTime.now();
            if (now.isBefore(startAt))
                return "모집 예정";
            if (now.isAfter(endAt))
                return "마감";
            return "모집 중";
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostListResponse { // 전체 게시글 조회해서 보내는 데이터

        private Long id;
        private Long facilityId;
        private String authorName;
        private PostType type;
        private Boolean isPinned;
        private String targetRoles; // "DOCTOR,CAREGIVER" 형태 그대로 반환. 프론트에서 split(",")으로 파싱
        private String title;
        private PostStatus status;
        private Integer views;
        private String content;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private Integer capacity;
        private Integer currentEnrolled;
        private LocalDateTime scheduledAt;
        private LocalDateTime scheduleEndAt;
        private LocalDateTime updatedAt;
        private String recruitStatus;

        // 전체 게시글 조회
        public static PostListResponse from(Post post) {
            return from(post, null, null);
        }

        public static PostListResponse from(Post post, LocalDateTime scheduledAt, LocalDateTime scheduleEndAt) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime start = post.getStartAt();
            LocalDateTime end = post.getEndAt();

            String recruitStatus = null;
            if (start != null && end != null) {
                if (now.isBefore(start))
                    recruitStatus = "모집 예정";
                else if (now.isAfter(end))
                    recruitStatus = "마감";
                else
                    recruitStatus = "모집 중";
            }

            return PostListResponse.builder()
                    .id(post.getPostId())
                    .facilityId(post.getFacilityId().getFacilityId())
                    .authorName(post.getAuthorUserId().getName())
                    .type(post.getType()) // 타입으로 필터링 -> 필터링에 따른 게시판 분류는 프론트에서
                    .isPinned(post.getIsPinned())
                    .targetRoles(post.getTargetRoles())
                    .title(post.getTitle())
                    .content(post.getContent())
                    .status(post.getStatus())
                    .views(post.getViews())
                    .startAt(post.getStartAt())
                    .endAt(post.getEndAt())
                    .capacity(post.getCapacity())
                    .currentEnrolled(post.getCurrentEnrolled())
                    .scheduledAt(scheduledAt)
                    .scheduleEndAt(scheduleEndAt)
                    .updatedAt(post.getUpdatedAt())
                    .recruitStatus(recruitStatus)
                    .build();
        }

    }

    // CHECK!!
    // 게시글 수정
    // 공지사항, 프로그램, 일반 게시글 모두 다른 형태의 Update를 가짐.
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {

        @NotBlank(message = "제목은 필수입니다")
        @Size(max = 200, message = "제목은 200자 이하여야 합니다")
        private String title;

        @NotBlank(message = "내용은 필수입니다")
        private String content;

        private Boolean isPinned; // null이면 기존 값 유지
        private String targetRoles; // null이면 기존 값 유지

        // CHECK!! 공지/일반 게시글은 아래 필드 null로 전달 ? 공지 게시글 필수 필드
        // PROGRAM일 때만 사용. null이면 기존 값 유지
        private PostStatus status;
        private LocalDateTime startAt;
        private LocalDateTime endAt;
        private Integer capacity;
        private String attachmentUrls;

        // reservationAt이 now()보다 과거면 변경 불가.
        private LocalDateTime reservationAt;
    }

}
