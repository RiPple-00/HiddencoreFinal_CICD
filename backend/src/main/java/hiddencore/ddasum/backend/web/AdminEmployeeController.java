package hiddencore.ddasum.backend.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.security.SecurityContextHelper;
import hiddencore.ddasum.backend.service.EmployeeAccountService;
import hiddencore.ddasum.backend.web.dto.admin.AdminEmployeeCreateRequest;
import hiddencore.ddasum.backend.web.dto.admin.EmployeeIssueResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Admin — 직원", description = "시설 직원 계정 발급")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminEmployeeController {

    private final EmployeeAccountService employeeAccountService;
    private final SecurityContextHelper securityContextHelper;
    private final MemberRepository memberRepository;

    @Operation(summary = "직원 계정 발급")
    @PostMapping("/employees")
    public ResponseEntity<EmployeeIssueResponse> issueEmployee(@Valid @RequestBody AdminEmployeeCreateRequest request) {
        AuthenticatedUser au = securityContextHelper.requireAuthenticatedUser();
        Users issuer =
                memberRepository
                        .findByUserId(au.userId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        EmployeeIssueResponse body = employeeAccountService.issueEmployee(request, issuer);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }
}
