package hiddencore.ddasum.backend.web.dto.guardian;

import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ProgramApplicationDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long documentId;

        private Long postId;
        private String programTitle;
        private LocalDateTime programStartAt;
        private LocalDateTime programEndAt;

        private Long patientId;
        private String patientName;

        private DocumentStatus status;
        private LocalDateTime requestedAt;
    }
}