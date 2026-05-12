package hiddencore.ddasum.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.web.dto.admin.AdminPatientDetailResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminPatientService {

    private final PatientRepository patientRepository;

    public AdminPatientDetailResponse getPatientDetail(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("환자가 없습니다. id=" + patientId));
        return AdminPatientDetailResponse.from(patient);
    }

}
