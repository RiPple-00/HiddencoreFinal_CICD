package hiddencore.ddasum.backend.web.dto.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.AdminPatientService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/patients")
@RequiredArgsConstructor
public class AdminPatientController {

    private final AdminPatientService adminPatientService;

    @GetMapping("/{patientId}")
    public ResponseEntity<AdminPatientDetailResponse> getPatientDetail(@PathVariable Long patientId) {
        AdminPatientDetailResponse response = adminPatientService.getPatientDetail(patientId);
        return ResponseEntity.ok(response);
    }

}