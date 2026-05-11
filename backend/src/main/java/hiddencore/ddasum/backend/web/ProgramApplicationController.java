package hiddencore.ddasum.backend.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.service.ProgramApplicationService;
import hiddencore.ddasum.backend.web.dto.guardian.ProgramApplicationDto;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/guardian/programs")
public class ProgramApplicationController {

    private final ProgramApplicationService programApplicationService;

    // 프로그램 신청
    // POST /api/guardian/programs/{postId}/apply
    @PostMapping("/{postId}/apply")
    public ResponseEntity<ProgramApplicationDto.Response> applyProgram(
            @PathVariable Long postId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(
                programApplicationService.applyProgram(authenticatedUser.userId(), postId));
    }

    @DeleteMapping("/applications/{documentId}")
    public ResponseEntity<Void> cancelApplication(
            @PathVariable Long documentId,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        programApplicationService.cancelApplication(authenticatedUser.userId(), documentId);

        return ResponseEntity.noContent().build();
    }

    // 내 프로그램 신청내역 조회
    // GET /api/guardian/programs/applications
    @GetMapping("/applications")
    public ResponseEntity<List<ProgramApplicationDto.Response>> getMyApplications(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        if (authenticatedUser == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return ResponseEntity.ok(
                programApplicationService.getMyApplications(authenticatedUser.userId()));
    }
}