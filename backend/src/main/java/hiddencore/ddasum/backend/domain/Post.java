package hiddencore.ddasum.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "POST")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id", nullable = false)
    private Long postId; // 게시글 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facilityId; // 시설 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_user_id", nullable = false)
    private Users authorUserId; // 작성자 ID

    @Enumerated(EnumType.STRING)
    @Column(name = "post_type", nullable = false, length = 30)
    private PostType type; // NOTICE | PROGRAM | BOARD

    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private Boolean isPinned = false; // 상단 고정 = TRUE / 일반 = FALSE

    @Column(name = "title", nullable = false, length = 200)
    private String title; // 제목

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content; // 본문

    @Column(name = "target_roles", length = 200)
    private String targetRoles; // "DOCTOR,CAREGIVER" 형태로 저장. PARSING: split(",")

    @Column(name = "views")
    private Integer views; // 조회수

    @Enumerated(EnumType.STRING)
    @Column(name = "post_status", nullable = false, length = 50)
    private PostStatus status; // ACTIVE | INACTIVE | RESERVE

    @Column(name = "start_at")
    private LocalDateTime startAt; // 시작 일시

    @Column(name = "end_at")
    private LocalDateTime endAt; // 종료 일시

    @Column(name = "reservation_at")
    private LocalDateTime reservationAt; // 예약 일시 | 예약X = 게시 일시

    @Column(name = "capacity")
    private Integer capacity; // 정원

    @Column(name = "current_enrolled")
    private Integer currentEnrolled; // 현재 신청자 수

    @Column(name = "attachment_urls", columnDefinition = "TEXT")
    private String attachmentUrls; // 첨부파일 목록

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // 생성 일시

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // 수정 일시

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum PostType {
        // 공지 게시판
        URGENT, // 긴급
        CLINICAL, // 임상
        ADMIN, // 행정
        FACILITY, // 시설
        
        // 프로그램 게시판
        APPLY, // 참여 신청
        REVIEW, // 활동 후기
        
        // 자유 게시판
        GENERAL,
    }
    
    public enum PostStatus {
        ACTIVE, 
        INACTIVE,
        RESERVE
    }
    
    public void incrementViews() {
        this.views = (this.views == null ? 0 : this.views) + 1;
    }
}
