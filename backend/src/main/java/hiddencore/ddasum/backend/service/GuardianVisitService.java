package hiddencore.ddasum.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.LocalDate;
import java.time.LocalTime;

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

    @Transactional(readOnly = true)
    public List<VisitRequestDto.AdminListResponse> getAdminVisitRequests() {
        return documentRepository
                .findByTypeOrderByRequestedAtDesc(Document.DocumentType.VISIT_REQUEST)
                .stream()
                .map(this::toAdminListResponse)
                .toList();
    }

    public VisitRequestDto.AdminListResponse approveVisitRequest(Long visitRequestId) {
        Document doc = documentRepository.findById(visitRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "면회 신청을 찾을 수 없습니다."));

        if (doc.getType() != Document.DocumentType.VISIT_REQUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "면회 신청 문서가 아닙니다.");
        }

        doc.setStatus(Document.DocumentStatus.APPROVED);
        doc.setApprovedAt(LocalDateTime.now());

        return toAdminListResponse(doc);
    }

    public VisitRequestDto.AdminListResponse rejectVisitRequest(Long visitRequestId,
            VisitRequestDto.RejectRequest request) {
        Document doc = documentRepository.findById(visitRequestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "면회 신청을 찾을 수 없습니다."));

        if (doc.getType() != Document.DocumentType.VISIT_REQUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "면회 신청 문서가 아닙니다.");
        }

        doc.setStatus(Document.DocumentStatus.REJECTED);
        doc.setApprovedAt(LocalDateTime.now());

        try {
            JsonNode node = objectMapper.readTree(doc.getContent());
            ObjectNode objectNode = node.isObject()
                    ? (ObjectNode) node
                    : objectMapper.createObjectNode();

            objectNode.put("rejectReason", request.getReason());
            doc.setContent(objectMapper.writeValueAsString(objectNode));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "반려 사유 저장에 실패했습니다.");
        }

        return toAdminListResponse(doc);
    }

    @Transactional(readOnly = true)
    public List<VisitRequestDto.MyListResponse> getMyVisitApplications(Long guardianUserId) {
        return documentRepository
                .findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
                        guardianUserId, DocumentType.VISIT_REQUEST)
                .stream()
                .filter(doc -> doc.getStatus() != DocumentStatus.CANCELLED)
                .map(this::toMyListResponse)
                .toList();
    }

    private VisitRequestDto.MyListResponse toMyListResponse(Document doc) {
        JsonNode content = parseContent(doc.getContent());
        Patient patient = doc.getPatientId();
        DocumentStatus status = doc.getStatus();

        return VisitRequestDto.MyListResponse.builder()
                .visitRequestId(doc.getDocumentId())
                .patientName(patient != null ? patient.getName() : "-")
                .patientRoom(patient != null ? formatPatientRoom(patient) : "병실 미배정")
                .visitDate(localDateValue(content, "visitDate"))
                .visitTime(localTimeValue(content, "visitTime"))
                .visitorName(textValue(content, "visitorName"))
                .relationship(textValue(content, "relationship"))
                .visitType(textValue(content, "visitType"))
                .status(status != null ? status.name() : null)
                .statusLabel(toGuardianVisitStatusLabel(status))
                .rejectReason(textValue(content, "rejectReason"))
                .requestedAt(doc.getRequestedAt() != null ? doc.getRequestedAt() : doc.getCreatedAt())
                .build();
    }

    private static String toGuardianVisitStatusLabel(DocumentStatus status) {
        if (status == null) {
            return "-";
        }
        return switch (status) {
            case PENDING_APPROVAL -> "승인 대기";
            case APPROVED -> "승인 완료";
            case REJECTED -> "반려";
            case CANCELLED -> "취소됨";
            default -> status.name();
        };
    }

    private VisitRequestDto.AdminListResponse toAdminListResponse(Document doc) {
        JsonNode content = parseContent(doc.getContent());
        Patient patient = doc.getPatientId();

        return VisitRequestDto.AdminListResponse.builder()
                .visitRequestId(doc.getDocumentId())
                .patientId(patient != null ? patient.getPatientId() : null)
                .patientName(patient != null ? patient.getName() : "-")
                .patientRoom(patient != null ? formatPatientRoom(patient) : "병실 미배정")
                .visitorName(textValue(content, "visitorName"))
                .visitorPhone(textValue(content, "visitorPhone"))
                .relationship(textValue(content, "relationship"))
                .visitDate(localDateValue(content, "visitDate"))
                .visitTime(localTimeValue(content, "visitTime"))
                .visitType(textValue(content, "visitType"))
                .status(doc.getStatus() != null ? doc.getStatus().name() : null)
                .requestedAt(doc.getRequestedAt() != null ? doc.getRequestedAt() : doc.getCreatedAt())
                .build();
    }

    private JsonNode parseContent(String content) {
        try {
            if (content == null || content.isBlank()) {
                return objectMapper.createObjectNode();
            }
            return objectMapper.readTree(content);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private String textValue(JsonNode node, String fieldName) {
        JsonNode value = node.get(fieldName);
        return value == null || value.isNull() ? "" : value.asText();
    }

    private LocalDate localDateValue(JsonNode node, String fieldName) {
        String value = textValue(node, fieldName);
        if (value == null || value.isBlank())
            return null;
        return LocalDate.parse(value);
    }

    private LocalTime localTimeValue(JsonNode node, String fieldName) {
        String value = textValue(node, fieldName);
        if (value == null || value.isBlank())
            return null;
        return LocalTime.parse(value);
    }

    /**
     * 면회 신청 화면에서 선택한 관계 문자열을 해당 보호자–환자 {@link GuardianPatient} 행의 relationship 에
     * 반영합니다.
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
