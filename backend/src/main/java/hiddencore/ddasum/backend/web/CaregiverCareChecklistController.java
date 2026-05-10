package hiddencore.ddasum.backend.web;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.security.SecurityContextHelper;
import hiddencore.ddasum.backend.service.CareChecklistService;
import hiddencore.ddasum.backend.web.dto.PatientDto;
import hiddencore.ddasum.backend.web.dto.care.CareChecklistLatestResponse;
import hiddencore.ddasum.backend.web.dto.care.CareChecklistSaveRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/caregiver")
@RequiredArgsConstructor
public class CaregiverCareChecklistController {

    private final SecurityContextHelper securityContextHelper;
    private final CareChecklistService careChecklistService;

    @GetMapping("/patients")
    public List<PatientDto.ListResponse> patientsInMyFacility() {
        AuthenticatedUser u = securityContextHelper.requireAuthenticatedUser();
        requireCaregiverWithFacility(u);
        return careChecklistService.listPatientsForCaregiverFacility(u.facilityId());
    }

    @GetMapping("/patients/{patientId}/care-checklist/latest")
    public ResponseEntity<CareChecklistLatestResponse> latestChecklist(@PathVariable Long patientId) {
        AuthenticatedUser u = securityContextHelper.requireAuthenticatedUser();
        requireCaregiverWithFacility(u);
        careChecklistService.requirePatientInFacility(u.facilityId(), patientId);
        Optional<CareChecklistLatestResponse> body = careChecklistService.findLatestChecklist(patientId);
        return body.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/patients/{patientId}/care-checklist")
    public CareChecklistLatestResponse saveChecklist(
            @PathVariable Long patientId, @RequestBody CareChecklistSaveRequest body) {
        AuthenticatedUser u = securityContextHelper.requireAuthenticatedUser();
        requireCaregiverWithFacility(u);
        return careChecklistService.saveChecklist(u, patientId, body);
    }

    private static void requireCaregiverWithFacility(AuthenticatedUser u) {
        if (!"CAREGIVER".equals(u.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "요양사 전용 기능입니다.");
        }
        if (u.facilityId() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "시설 정보가 없는 계정입니다.");
        }
    }
}
