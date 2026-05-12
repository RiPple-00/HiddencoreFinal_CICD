package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import hiddencore.ddasum.backend.service.PostApplicationService;
import hiddencore.ddasum.backend.web.dto.admin.PostApplicationDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/facilities/{facilityId}/posts/{postId}/applications")
public class PostApplicationController {
    
    private final PostApplicationService postApplicationService;

    @GetMapping
    public ResponseEntity<PostApplicationDto.ManagementResponse> getApplications(
        @PathVariable Long facilityId,
        @PathVariable Long postId) {
        
        return ResponseEntity.ok(postApplicationService.getApplications(facilityId, postId));   
    }

    @PatchMapping("/{applicationId}")
    public ResponseEntity<PostApplicationDto.ApplicationInfo> updateApplicationStatus(
            @PathVariable Long facilityId,
            @PathVariable Long postId,
            @PathVariable Long applicationId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @RequestBody @Valid PostApplicationDto.UpdateStatusRequest request) {
        return ResponseEntity.ok(
                postApplicationService.updateApplicationStatus(
                        facilityId,
                        postId,
                        applicationId,
                        authenticatedUser.userId(),
                        request));
    }
}