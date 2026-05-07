package hiddencore.ddasum.backend.web.dto.patient;

import java.time.LocalDateTime;
import java.util.List;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class PatientExtrasDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private List<GuardianLink> guardians;
        private List<DocumentSummary> visitRequests;
        private List<DocumentSummary> payments;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuardianLink {
        private Long guardianUserId;
        private String guardianName;
        private String guardianPhone;
        private String relationship;
        private Boolean isPrimary;
        private LocalDateTime createdAt;

        public static GuardianLink from(GuardianPatient link) {
            return GuardianLink.builder()
                    .guardianUserId(link.getGuardianUserId().getUserId())
                    .guardianName(link.getGuardianUserId().getName())
                    .guardianPhone(link.getGuardianUserId().getPhone())
                    .relationship(link.getRelationship())
                    .isPrimary(link.getIsPrimary())
                    .createdAt(link.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentSummary {
        private Long documentId;
        private String type;
        private String title;
        private String status;
        private String content;
        private LocalDateTime requestedAt;
        private LocalDateTime createdAt;

        public static DocumentSummary from(Document d) {
            return DocumentSummary.builder()
                    .documentId(d.getDocumentId())
                    .type(d.getType() != null ? d.getType().name() : null)
                    .title(d.getTitle())
                    .status(d.getStatus() != null ? d.getStatus().name() : null)
                    .content(d.getContent())
                    .requestedAt(d.getRequestedAt())
                    .createdAt(d.getCreatedAt())
                    .build();
        }
    }
}

