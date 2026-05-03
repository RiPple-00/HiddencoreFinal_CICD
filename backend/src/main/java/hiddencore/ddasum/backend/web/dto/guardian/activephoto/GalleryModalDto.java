package hiddencore.ddasum.backend.web.dto.guardian.activephoto;

import hiddencore.ddasum.backend.domain.Document;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.Arrays;

@Builder
public record GalleryModalDto(
        Long documentId,
        String imageUrl,
        String title,
        String content,
        LocalDateTime uploadedAt
) {
    private static final String DEFAULT_TITLE = "제목 없음";
    private static final String DEFAULT_CONTENT = "내용이 없습니다.";

    public static GalleryModalDto from(Document document) {
        if (document == null) {
            return GalleryModalDto.builder()
                    .documentId(null)
                    .imageUrl(null)
                    .title(DEFAULT_TITLE)
                    .content(DEFAULT_CONTENT)
                    .uploadedAt(null)
                    .build();
        }

        return GalleryModalDto.builder()
                .documentId(document.getDocumentId())
                .imageUrl(firstFileUrl(document.getFileUrls()))
                .title(safeText(document.getTitle(), DEFAULT_TITLE))
                .content(safeText(document.getContent(), DEFAULT_CONTENT))
                .uploadedAt(document.getCreatedAt())
                .build();
    }

    private static String safeText(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private static String firstFileUrl(String fileUrls) {
        if (fileUrls == null || fileUrls.isBlank()) {
            return null;
        }

        return Arrays.stream(fileUrls.split(","))
                .map(String::trim)
                .filter(url -> !url.isBlank())
                .findFirst()
                .orElse(null);
    }
}
