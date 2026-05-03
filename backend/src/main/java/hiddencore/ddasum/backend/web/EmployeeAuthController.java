package hiddencore.ddasum.backend.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.EmployeeAccountService;
import hiddencore.ddasum.backend.web.dto.auth.EmployeeLoginRequest;
import hiddencore.ddasum.backend.web.dto.auth.EmployeeLoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Auth — 직원", description = "시설코드 + 직원 ID 로그인")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class EmployeeAuthController {

    private final EmployeeAccountService employeeAccountService;

    @Operation(summary = "직원 로그인")
    @PostMapping("/employee/login")
    public ResponseEntity<EmployeeLoginResponse> login(@Valid @RequestBody EmployeeLoginRequest request) {
        return ResponseEntity.ok(employeeAccountService.loginEmployee(request));
    }
}
