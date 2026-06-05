package hiddencore.ddasum.backend.web.dto.guardian.activephoto;

import java.util.List;

import lombok.Builder;

@Builder
public record ActivityGalleryListResponse(
        int slotCapacity,
        int filledCount,
        List<GalleryModalDto> slots,
        GalleryModalDto hero,
        List<GalleryModalDto> today,
        List<GalleryModalDto> week) {}
