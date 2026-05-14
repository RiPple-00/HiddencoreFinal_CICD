package hiddencore.ddasum.backend.web;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.security.SecurityContextHelper;
import hiddencore.ddasum.backend.service.CareChecklistService;
import hiddencore.ddasum.backend.service.caregiver.CaregiverCareCheckService;
import hiddencore.ddasum.backend.web.dto.care.CareChecklistLatestResponse;
import hiddencore.ddasum.backend.web.dto.care.GuardianLinkedPatientResponse;
import hiddencore.ddasum.backend.web.dto.caregiver.CaregiverCareCheckDto;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guardian/me")
@RequiredArgsConstructor
public class GuardianCareChecklistController {

    private final SecurityContextHelper securityContextHelper;
    private final CareChecklistService careChecklistService;
    private final CaregiverCareCheckService caregiverCareCheckService;

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

    /**
     * 요양사가 작성 중인 일일 업무 체크리스트(CARE_CHECK, 자동 저장/제출)를 보호자가 조회한다.
     * 기록 일자를 생략하면 서버 기준 오늘 날짜로 조회한다.
     */
    @GetMapping("/patients/{patientId}/care-check")
    public CaregiverCareCheckDto.Response latestCareCheck(
            @PathVariable Long patientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        AuthenticatedUser u = securityContextHelper.requireAuthenticatedUser();
        requireGuardian(u);
        if (!careChecklistService.isGuardianOfPatient(u.userId(), patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "연결된 환자만 조회할 수 있습니다.");
        }
        return caregiverCareCheckService.getOne(patientId, date);
    }

    private static void requireGuardian(AuthenticatedUser u) {
        if (!"GUARDIAN".equals(u.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "보호자 전용 기능입니다.");
        }
    }
}
