package hiddencore.ddasum.backend.web;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.security.SecurityContextHelper;
import hiddencore.ddasum.backend.service.CareChecklistService;
import hiddencore.ddasum.backend.web.dto.care.CareChecklistLatestResponse;
import hiddencore.ddasum.backend.web.dto.care.GuardianLinkedPatientResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guardian/me")
@RequiredArgsConstructor
public class GuardianCareChecklistController {

    private final SecurityContextHelper securityContextHelper;
    private final CareChecklistService careChecklistService;

    @GetMapping("/linked-patients")
    public List<GuardianLinkedPatientResponse> linkedPatients() {
        AuthenticatedUser u = securityContextHelper.requireAuthenticatedUser();
        requireGuardian(u);
        return careChecklistService.listGuardianPatients(u.userId());
    }

    @GetMapping("/patients/{patientId}/care-checklist/latest")
    public ResponseEntity<CareChecklistLatestResponse> latestChecklist(@PathVariable Long patientId) {
        AuthenticatedUser u = securityContextHelper.requireAuthenticatedUser();
        requireGuardian(u);
        if (!careChecklistService.isGuardianOfPatient(u.userId(), patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "연결된 환자만 조회할 수 있습니다.");
        }
        Optional<CareChecklistLatestResponse> body = careChecklistService.findLatestChecklist(patientId);
        return body.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    private static void requireGuardian(AuthenticatedUser u) {
        if (!"GUARDIAN".equals(u.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "보호자 전용 기능입니다.");
        }
    }
}
