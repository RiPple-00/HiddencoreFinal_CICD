package hiddencore.ddasum.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.web.dto.patient.PatientExtrasDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientExtrasService {

    private final GuardianPatientRepository guardianPatientRepository;
    private final DocumentRepository documentRepository;

    public PatientExtrasDto.Response getExtras(Long patientId) {
        List<PatientExtrasDto.GuardianLink> guardians = guardianPatientRepository
                .findByPatientId_PatientIdOrderByIsPrimaryDesc(patientId)
                .stream()
                .map(PatientExtrasDto.GuardianLink::from)
                .toList();

        List<PatientExtrasDto.DocumentSummary> visitRequests = documentRepository
                .findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(patientId, DocumentType.VISIT_REQUEST)
                .stream()
                .map(PatientExtrasDto.DocumentSummary::from)
                .toList();

        List<PatientExtrasDto.DocumentSummary> payments = documentRepository
                .findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(patientId, DocumentType.PAYMENT)
                .stream()
                .map(PatientExtrasDto.DocumentSummary::from)
                .toList();

        return PatientExtrasDto.Response.builder()
                .guardians(guardians)
                .visitRequests(visitRequests)
                .payments(payments)
                .build();
    }
}

