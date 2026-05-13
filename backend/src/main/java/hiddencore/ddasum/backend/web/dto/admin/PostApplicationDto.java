package hiddencore.ddasum.backend.web.dto.admin;

import hiddencore.ddasum.backend.domain.PostApplication.PostApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PostApplicationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgramInfo {
        private Long postId;
        private String title;
        private String description;
        private Integer totalQuota;
        private Integer confirmedCount;
        private Integer waitingCount;
        private Integer remainingDays;
        private String recruitStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationInfo {
        private Long applicationId;
        private Long patientId;
        private String patientName;
        private String genderAge;
        private String guardianPhone;
        private String status;
        private String statusLabel;
        private String appliedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagementResponse {
        private ProgramInfo programInfo;
        private java.util.List<ApplicationInfo> confirmedApplicants;
        private java.util.List<ApplicationInfo> waitingApplicants;
        private java.util.List<ApplicationInfo> rejectedApplicants;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotNull(message = "변경할 상태는 필수입니다.")
        private PostApplicationStatus status;

        private String memo;
    }

}
