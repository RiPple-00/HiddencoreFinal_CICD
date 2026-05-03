package hiddencore.ddasum.backend.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.security.SecurityContextHelper;
import hiddencore.ddasum.backend.service.UserSelfService;
import hiddencore.ddasum.backend.web.dto.auth.ChangePasswordRequest;
import hiddencore.ddasum.backend.web.dto.auth.EmailConsentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Users — 내 정보", description = "로그인 사용자 본인 설정")
@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserSelfController {

    private final UserSelfService userSelfService;
    private final SecurityContextHelper securityContextHelper;

    @Operation(summary = "비밀번호 변경 (최초 변경 포함)")
    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        AuthenticatedUser current = securityContextHelper.requireAuthenticatedUser();
        userSelfService.changePassword(current, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "이메일 수신 동의 변경")
    @PatchMapping("/email-consent")
    public ResponseEntity<Void> emailConsent(@Valid @RequestBody EmailConsentRequest request) {
        AuthenticatedUser current = securityContextHelper.requireAuthenticatedUser();
        userSelfService.updateEmailConsent(current, request);
        return ResponseEntity.ok().build();
    }
}
