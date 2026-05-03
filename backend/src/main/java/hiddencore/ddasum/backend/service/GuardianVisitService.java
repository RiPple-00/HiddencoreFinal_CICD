package hiddencore.ddasum.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.GuardianPatient;
import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.GuardianPatientRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.UsersRepository;
import hiddencore.ddasum.backend.web.dto.VisitRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class GuardianVisitService {

    private final PatientRepository patientRepository;
    private final DocumentRepository documentRepository;
    private final GuardianPatientRepository guardianPatientRepository;
    private final UsersRepository usersRepository;
    private final ObjectMapper objectMapper;

    /**
     * 면회 신청을 {@link Document} (document_type=VISIT_REQUEST) 로 저장합니다.
     * 면회 상세는 JSON으로 {@link Document#getContent()} 에 보관합니다.
     */
    public VisitRequestDto.CreateResponse createVisit(VisitRequestDto.CreateRequest req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "환자를 찾을 수 없습니다."));

        Users requester = resolveRequester(req.getRequesterUserId(), patient);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("visitDate", req.getVisitDate().toString());
        payload.put("visitTime", req.getVisitTime().toString());
        payload.put("visitorName", req.getVisitorName());
        payload.put("visitorPhone", req.getVisitorPhone());
        payload.put("relationship", req.getRelationship());
        payload.put("visitType", req.getVisitType());

        String content;
        try {
            content = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "문서 본문 직렬화에 실패했습니다.");
        }

        LocalDateTime now = LocalDateTime.now();
        Document doc = Document.builder()
                .patientId(patient)
                .facilityId(patient.getFacilityId())
                .type(DocumentType.VISIT_REQUEST)
                .title("면회 신청 — " + req.getVisitorName())
                .content(content)
                .requesterUserId(requester)
                .approverUserId(null)
                .status(DocumentStatus.PENDING_APPROVAL)
                .fileUrls(null)
                .requestedAt(now)
                .approvedAt(null)
                .issuedAt(null)
                .build();

        Document saved = documentRepository.save(doc);

        syncGuardianPatientRelationship(requester, patient, req.getRelationship());

        Patient patientForResponse = patientRepository.findById(patient.getPatientId()).orElse(patient);

        return VisitRequestDto.CreateResponse.builder()
                .visitRequestId(saved.getDocumentId())
                .visitDate(req.getVisitDate())
                .visitTime(req.getVisitTime())
                .patientId(patientForResponse.getPatientId())
                .patientName(patientForResponse.getName())
                .patientRoom(formatPatientRoom(patientForResponse))
                .visitorName(req.getVisitorName())
                .visitorPhone(req.getVisitorPhone())
                .relationship(req.getRelationship())
                .visitType(req.getVisitType())
                .status(DocumentStatus.PENDING_APPROVAL.name())
                .requestedAt(saved.getRequestedAt() != null ? saved.getRequestedAt() : saved.getCreatedAt())
                .build();
    }

    /**
     * 면회 신청 화면에서 선택한 관계 문자열을 해당 보호자–환자 {@link GuardianPatient} 행의 relationship 에 반영합니다.
     * 행이 없으면(요청자만 지정된 경우 등) 새로 연결 행을 만듭니다.
     */
    private void syncGuardianPatientRelationship(Users requester, Patient patient, String relationship) {
        Optional<GuardianPatient> existing = guardianPatientRepository
                .findByGuardianUserId_UserIdAndPatientId_PatientId(
                        requester.getUserId(), patient.getPatientId());
        if (existing.isPresent()) {
            GuardianPatient link = existing.get();
            link.setRelationship(relationship);
            guardianPatientRepository.save(link);
            return;
        }
        GuardianPatient created = GuardianPatient.builder()
                .guardianUserId(requester)
                .patientId(patient)
                .relationship(relationship)
                .isPrimary(false)
                .build();
        guardianPatientRepository.save(created);
    }

    private Users resolveRequester(Long explicitUserId, Patient patient) {
        if (explicitUserId != null) {
            return usersRepository.findById(explicitUserId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "신청자(보호자) 사용자를 찾을 수 없습니다."));
        }
        List<GuardianPatient> links = guardianPatientRepository
                .findByPatientId_PatientIdOrderByIsPrimaryDesc(patient.getPatientId());
        if (links.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "해당 환자에 등록된 보호자가 없습니다. requesterUserId를 요청에 포함해 주세요.");
        }
        return links.get(0).getGuardianUserId();
    }

    private String formatPatientRoom(Patient patient) {
        Location loc = patient.getLocationId();
        if (loc == null) {
            return "병실 미배정";
        }
        String building = loc.getBuilding() != null ? loc.getBuilding() : "";
        String floorPart = loc.getFloor() != null ? loc.getFloor() + "층 " : "";
        String room = loc.getRoom() != null ? loc.getRoom() : "";
        if (!room.isEmpty() && !room.endsWith("호")) {
            room = room + "호";
        }
        return (building + " " + floorPart + room).trim().replaceAll("\\s+", " ");
    }
}
