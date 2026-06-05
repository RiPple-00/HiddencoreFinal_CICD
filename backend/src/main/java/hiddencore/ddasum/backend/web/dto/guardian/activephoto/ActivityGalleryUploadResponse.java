package hiddencore.ddasum.backend.web.dto.guardian.activephoto;

import lombok.Builder;

@Builder
public record ActivityGalleryUploadResponse(
        Long documentId,
        Long patientId,
        String aiPatientKey,
        String patientName,
        java.util.List<String> detectedPatients,
        java.util.List<String> detectedPatientNames,
        GalleryModalDto card,
        String action,
        String actionKo,
        Double confidence,
        String message) {}
