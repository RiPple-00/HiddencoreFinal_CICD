package hiddencore.ddasum.backend.web;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.security.SecurityContextHelper;
import hiddencore.ddasum.backend.service.ActivityGalleryService;
import hiddencore.ddasum.backend.web.dto.guardian.activephoto.ActivityGalleryUpdateRequest;
import hiddencore.ddasum.backend.web.dto.guardian.activephoto.ActivityGalleryUploadResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caregiver")
@RequiredArgsConstructor
public class CaregiverActivityGalleryController {

    private final SecurityContextHelper securityContextHelper;
    private final ActivityGalleryService activityGalleryService;

    /**
     * 프로그램 활동 사진 업로드 → AI 행동/프로그램 인식 → patient_6(기만경) 보호자 갤러리 GALLERYCARD 저장
     */
    @PostMapping(value = "/activity-photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ActivityGalleryUploadResponse uploadActivityPhoto(@RequestParam("file") MultipartFile file) {
        AuthenticatedUser user = securityContextHelper.requireAuthenticatedUser();
        return activityGalleryService.uploadForCaregiver(user, file);
    }

    @PatchMapping("/activity-photos/{documentId}")
    public ActivityGalleryUploadResponse updateActivityPhoto(
            @PathVariable Long documentId, @RequestBody ActivityGalleryUpdateRequest body) {
        AuthenticatedUser user = securityContextHelper.requireAuthenticatedUser();
        return activityGalleryService.updateForCaregiver(user, documentId, body);
    }
}
