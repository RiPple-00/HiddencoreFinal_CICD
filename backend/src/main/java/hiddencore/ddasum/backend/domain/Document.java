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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "DOCUMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post postId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private DocumentType type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_user_id")
    private Users requesterUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_user_id")
    private Users approverUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_status", nullable = false, length = 50)
    private DocumentStatus status;

    /**
     * 정상/이상 종합 상태(간호 체크리스트 등에서 활용).
     * 일반 문서에는 null 일 수 있으며, CARE_CHECK 등 정상/이상 판정이 필요한 문서에서만 사용한다.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", length = 20)
    private Status overallStatus;

    // CARE_CHECK 등 일자별 문서가 동일 (환자, 일자) 키로 식별될 수 있도록 보조 컬럼 추가
    @Column(name = "record_date")
    private LocalDate recordDate;

    // 문서에 첨부된 파일 URL 목록(쉼표 구분 문자열)
    @Column(name = "file_urls", columnDefinition = "TEXT")
    private String fileUrls;

    // 문서 요청 시각(요청 워크플로우 시작 시점)
    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    // 문서 승인 시각(결재/승인 완료 시점)
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    // 문서 발급 시각(최종 산출물 발급 완료 시점)
    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    // 문서 레코드 생성 시각(최초 저장 시 자동 설정)
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 문서 레코드 수정 시각(갱신 시 자동 업데이트)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

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

    public enum DocumentType {
        REPORT, // 보고서
        CONSENT_FORM, // 동의서
        PAYMENT, // 결제/수납 문서
        VISIT_REQUEST, // 면회 신청
        CERTIFICATE, // 증명서
        GALLERYCARD, // 프로그램 게시물 카드
        CARE_CHECK, // 간병인 일일 업무 체크리스트(식사/위생/상태/배뇨배변/특이사항)
        PROGRAM_APPLICATION, // 프로그램 신청
        ETC
    }

    public enum DocumentStatus {
        DRAFT, // 임시저장
        REQUESTED, // 요청됨
        PENDING_APPROVAL, // 승인 대기
        APPROVED, // 승인 완료
        REJECTED, // 반려
        PAYMENT_PENDING, // 결제 대기
        PAID, // 결제 완료
        ISSUED, // 발급 완료
        CANCELLED // 취소
    }

    public enum Status {
        NORMAL,
        ABNORMAL
    }

}
