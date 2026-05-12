package hiddencore.ddasum.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.PatientNote;
import hiddencore.ddasum.backend.domain.PatientNote.NoteType;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientNoteRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.web.dto.PatientDto;
import hiddencore.ddasum.backend.web.dto.care.CareChecklistLatestResponse;
import hiddencore.ddasum.backend.web.dto.care.CareChecklistSaveRequest;
import hiddencore.ddasum.backend.web.dto.care.GuardianLinkedPatientResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CareChecklistService {

    public static final String CHECKLIST_TITLE = "CAREGIVER_WORK_CHECKLIST_V1";

    private final PatientNoteRepository patientNoteRepository;
    private final GuardianPatientRepository guardianPatientRepository;
    private final PatientRepository patientRepository;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    public boolean isGuardianOfPatient(long guardianUserId, long patientId) {
        return guardianPatientRepository
                .findByGuardianUserId_UserIdAndPatientId_PatientId(guardianUserId, patientId)
                .isPresent();
    }

    public List<GuardianLinkedPatientResponse> listGuardianPatients(long guardianUserId) {
        return guardianPatientRepository.findByGuardianUserId_UserId(guardianUserId).stream()
                .map(
                        gp -> {
                            Patient p = gp.getPatientId();
                            return GuardianLinkedPatientResponse.builder()
                                    .patientId(p.getPatientId())
                                    .patientName(p.getName())
                                    .relationship(gp.getRelationship())
                                    .primary(gp.getIsPrimary())
                                    .build();
                        })
                .toList();
    }

    public Optional<CareChecklistLatestResponse> findLatestChecklist(long patientId) {
        return patientNoteRepository
                .findFirstByPatientId_PatientIdAndTypeAndTitleOrderByUpdatedAtDesc(
                        patientId, NoteType.CARE, CHECKLIST_TITLE)
                .map(this::toLatestResponse);
    }

    public List<PatientDto.ListResponse> listPatientsForCaregiverFacility(long facilityId) {
        return patientRepository.findByFacilityId_FacilityId(facilityId).stream()
                .map(PatientDto.ListResponse::from)
                .toList();
    }

    public void requirePatientInFacility(long facilityId, long patientId) {
        Patient patient =
                patientRepository
                        .findById(patientId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."));
        if (!patient.getFacilityId().getFacilityId().equals(facilityId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 시설 환자가 아닙니다.");
        }
    }

    @Transactional
    public CareChecklistLatestResponse saveChecklist(AuthenticatedUser caregiver, long patientId, CareChecklistSaveRequest request) {
        if (!"CAREGIVER".equals(caregiver.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "요양사만 등록할 수 있습니다.");
        }
        Long facilityId = caregiver.facilityId();
        if (facilityId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "시설 정보가 없는 계정입니다.");
        }
        if (request.getChecklist() == null || request.getChecklist().isNull()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "checklist 본문이 필요합니다.");
        }

        requirePatientInFacility(facilityId, patientId);
        Patient patient =
                patientRepository
                        .findById(patientId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."));

        Users employee =
                memberRepository
                        .findById(caregiver.userId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));

        String json;
        try {
            json = objectMapper.writeValueAsString(request.getChecklist());
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "checklist 직렬화에 실패했습니다.");
        }

        PatientNote note =
                PatientNote.builder()
                        .patientId(patient)
                        .employeeUserId(employee)
                        .type(NoteType.CARE)
                        .title(CHECKLIST_TITLE)
                        .content(json)
                        .build();

        PatientNote saved = patientNoteRepository.save(note);
        return toLatestResponse(saved);
    }

    private CareChecklistLatestResponse toLatestResponse(PatientNote note) {
        Patient patient = note.getPatientId();
        Users author = note.getEmployeeUserId();
        JsonNode checklist;
        try {
            checklist = objectMapper.readTree(note.getContent());
        } catch (Exception e) {
            checklist = objectMapper.createObjectNode();
        }
        return CareChecklistLatestResponse.builder()
                .noteId(note.getNoteId())
                .patientId(patient.getPatientId())
                .patientName(patient.getName())
                .updatedAt(note.getUpdatedAt())
                .recordedByUserId(author.getUserId())
                .recordedByName(author.getName())
                .checklist(checklist)
                .build();
    }
}
