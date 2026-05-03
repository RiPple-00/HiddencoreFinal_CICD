package hiddencore.ddasum.backend.web.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

public class VisitRequestDto {

    /**
     * 예약 가능 시간 조회 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AvailableTimeResponse {
        private LocalDate date;
        private List<LocalTime> availableTimes;
    }

    /**
     * 보호자 면회 신청 요청
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotNull(message = "환자 ID는 필수입니다.")
        private Long patientId;

        @NotNull(message = "면회 날짜는 필수입니다.")
        private LocalDate visitDate;

        @NotNull(message = "면회 시간은 필수입니다.")
        private LocalTime visitTime;

        @NotBlank(message = "신청자 성함은 필수입니다.")
        @Size(max = 30, message = "신청자 성함은 30자 이하여야 합니다.")
        private String visitorName;

        @NotBlank(message = "연락처는 필수입니다.")
        @Pattern(
            regexp = "^01[0-9]-?\\d{3,4}-?\\d{4}$",
            message = "연락처 형식이 올바르지 않습니다."
        )
        private String visitorPhone;

        @NotBlank(message = "환자와의 관계는 필수입니다.")
        @Size(max = 20, message = "관계는 20자 이하여야 합니다.")
        private String relationship;

        @NotBlank(message = "면회 유형은 필수입니다.")
        @Size(max = 30, message = "면회 유형은 30자 이하여야 합니다.")
        private String visitType;

        /**
         * DOCUMENT.requester_user_id 에 매핑. 비우면 해당 환자의 {@code GUARDIAN_PATIENT}에서
         * 주보호자(isPrimary) 우선으로 연결된 {@link hiddencore.ddasum.backend.domain.Users} 를 사용합니다.
         */
        private Long requesterUserId;
    }

    /**
     * 보호자 면회 신청 완료 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateResponse {
        private Long visitRequestId;
        private LocalDate visitDate;
        private LocalTime visitTime;

        private Long patientId;
        private String patientName;
        private String patientRoom;

        private String visitorName;
        private String visitorPhone;
        private String relationship;
        private String visitType;

        private String status;          // PENDING / APPROVED / REJECTED
        private LocalDateTime requestedAt;
    }

    /**
     * 보호자 내 신청 목록 / 원무과 목록에서 공통으로 쓸 수 있는 요약 DTO
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        private Long visitRequestId;

        private Long patientId;
        private String patientName;
        private String patientRoom;

        private Long guardianId;

        private LocalDate visitDate;
        private LocalTime visitTime;

        private String visitorName;
        private String relationship;
        private String visitType;

        private String status;
        private LocalDateTime requestedAt;
    }

    /**
     * 보호자 내 신청 목록
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MyListResponse {
        private Long visitRequestId;

        private String patientName;
        private String patientRoom;

        private LocalDate visitDate;
        private LocalTime visitTime;

        private String relationship;
        private String visitType;

        private String status;
        private LocalDateTime requestedAt;
    }

    /**
     * 상세 조회
     * 보호자 상세 / 원무과 상세 둘 다 커버 가능
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DetailResponse {
        private Long visitRequestId;

        private Long patientId;
        private String patientName;
        private String patientRoom;

        private Long guardianId;

        private LocalDate visitDate;
        private LocalTime visitTime;

        private String visitorName;
        private String visitorPhone;
        private String relationship;
        private String visitType;

        private String status;
        private String rejectReason;

        private LocalDateTime requestedAt;
        private LocalDateTime processedAt;
        private Long processedBy;
    }

    /**
     * 원무과 목록 조회 응답
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminListResponse {
        private Long visitRequestId;

        private String patientName;
        private String patientRoom;

        private String visitorName;
        private String visitorPhone;
        private String relationship;

        private LocalDate visitDate;
        private LocalTime visitTime;
        private String visitType;

        private String status;
        private LocalDateTime requestedAt;
    }

    /**
     * 원무과 승인 처리 요청
     * 지금은 본문 없이도 가능하지만,
     * 나중에 메모나 승인 코멘트 필요하면 확장 가능
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApproveRequest {
        @Size(max = 200, message = "승인 메모는 200자 이하여야 합니다.")
        private String memo;
    }

    /**
     * 원무과 반려 처리 요청
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RejectRequest {

        @NotBlank(message = "반려 사유는 필수입니다.")
        @Size(max = 200, message = "반려 사유는 200자 이하여야 합니다.")
        private String reason;
    }
}