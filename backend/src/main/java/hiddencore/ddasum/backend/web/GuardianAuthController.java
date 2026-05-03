package hiddencore.ddasum.backend.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.GuardianAccountService;
import hiddencore.ddasum.backend.web.dto.auth.GuardianLoginRequest;
import hiddencore.ddasum.backend.web.dto.auth.GuardianLoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Auth — 보호자", description = "보호자 로그인")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class GuardianAuthController {

    private final GuardianAccountService guardianAccountService;

    @Operation(summary = "보호자 로그인")
    @PostMapping("/guardian/login")
    public ResponseEntity<GuardianLoginResponse> login(@Valid @RequestBody GuardianLoginRequest request) {
        return ResponseEntity.ok(guardianAccountService.loginGuardian(request));
    }
}
