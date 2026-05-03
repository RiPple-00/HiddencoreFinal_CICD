package hiddencore.ddasum.backend.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.GuardianAccountService;
import hiddencore.ddasum.backend.web.dto.guardian.GuardianSignupRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Guardian — 회원가입", description = "App 보호자 직접 가입")
@RestController
@RequestMapping("/api/guardians")
@RequiredArgsConstructor
public class GuardianSignupController {

    private final GuardianAccountService guardianAccountService;

    @Operation(summary = "보호자 회원가입")
    @PostMapping("/signup")
    public ResponseEntity<Void> signup(@Valid @RequestBody GuardianSignupRequest request) {
        guardianAccountService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
