package hiddencore.ddasum.backend.service.caregiver;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Facility;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.repository.FacilityRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.caregiver.CaregiverCareCheckRepository;
import hiddencore.ddasum.backend.web.dto.caregiver.CaregiverCareCheckDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

/**
 * 간병인 일일 업무 체크리스트(CARE_CHECK) 도메인 서비스.
 *
 * <ul>
 *   <li>자동 저장(임시저장) - 동일 (환자, 날짜) 문서가 있으면 갱신, 없으면 생성한다.</li>
 *   <li>제출 - 자동 저장 본문을 그대로 PENDING_APPROVAL 로 승격한다.</li>
 *   <li>조회 - 저장된 JSON content 를 다시 객체로 풀어서 반환한다.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CaregiverCareCheckService {

    private final CaregiverCareCheckRepository careCheckRepository;
    private final PatientRepository patientRepository;
    private final FacilityRepository facilityRepository;
    private final ObjectMapper objectMapper;

    // ============================================================
    // 자동 저장(임시저장)
    // ============================================================

    /**
     * 자동 저장. 동일 (환자, 날짜) 문서가 있으면 갱신, 없으면 새로 생성한다.
     * 화면 입력이 멈추면 프론트에서 디바운스해 호출한다.
     */
    @Transactional
    public CaregiverCareCheckDto.Response autoSave(CaregiverCareCheckDto.SaveRequest request) {
        validate(request);

        LocalDate date = request.getRecordDate() != null ? request.getRecordDate() : LocalDate.now();
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("환자가 없습니다. id=" + request.getPatientId()));

        Document document = careCheckRepository
                .findLatestCareCheck(request.getPatientId(), date)
                .orElseGet(() -> newCareCheckDocument(patient, date));

        applyContent(document, request.getContent(), date, patient, Document.DocumentStatus.DRAFT);

        Document saved = careCheckRepository.save(document);
        return toResponse(saved);
    }

    // ============================================================
    // 제출
    // ============================================================

    /** 사용자가 "제출하기" 버튼을 눌렀을 때 호출된다. 본문은 마지막 자동 저장 결과 그대로 사용 가능. */
    @Transactional
    public CaregiverCareCheckDto.Response submit(CaregiverCareCheckDto.SaveRequest request) {
        validate(request);
        LocalDate date = request.getRecordDate() != null ? request.getRecordDate() : LocalDate.now();
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("환자가 없습니다. id=" + request.getPatientId()));

        Document document = careCheckRepository
                .findLatestCareCheck(request.getPatientId(), date)
                .orElseGet(() -> newCareCheckDocument(patient, date));

        applyContent(document, request.getContent(), date, patient, Document.DocumentStatus.PENDING_APPROVAL);
        document.setRequestedAt(java.time.LocalDateTime.now());

        Document saved = careCheckRepository.save(document);
        return toResponse(saved);
    }

    // ============================================================
    // 조회
    // ============================================================

    /** 단건 조회 - 환자, 날짜 기준. 없으면 null content 응답. */
    public CaregiverCareCheckDto.Response getOne(Long patientId, LocalDate recordDate) {
        Objects.requireNonNull(patientId, "patientId");
        LocalDate date = recordDate != null ? recordDate : LocalDate.now();

        return careCheckRepository.findLatestCareCheck(patientId, date)
                .map(this::toResponse)
                .orElse(CaregiverCareCheckDto.Response.builder()
                        .patientId(patientId)
                        .recordDate(date)
                        .build());
    }

    /** 환자별 이력 목록 - 최신순 */
    public List<CaregiverCareCheckDto.Response> getHistory(Long patientId) {
        return careCheckRepository.findAllByPatient(patientId).stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // 내부 헬퍼
    // ============================================================

    private void validate(CaregiverCareCheckDto.SaveRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("요청 본문이 비어있습니다.");
        }
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException("patientId 는 필수입니다.");
        }
    }

    private Document newCareCheckDocument(Patient patient, LocalDate date) {
        Facility facility = patient.getFacilityId() != null
                ? patient.getFacilityId()
                : facilityRepository.findById(1L)
                    .orElseThrow(() -> new IllegalArgumentException("기본 시설(id=1) 이 없습니다."));

        return Document.builder()
                .patientId(patient)
                .facilityId(facility)
                .type(Document.DocumentType.CARE_CHECK)
                .title(buildTitle(patient, date))
                .status(Document.DocumentStatus.DRAFT)
                .recordDate(date)
                .build();
    }

    private String buildTitle(Patient patient, LocalDate date) {
        String name = patient.getName() != null ? patient.getName() : "환자";
        return String.format("%s 일일 업무 체크 - %s", name, date);
    }

    /**
     * 요청 Content 를 Document 본문에 반영한다.
     * <ul>
     *   <li>{@link Document#setContent(String)} 에 JSON 직렬화 결과를 그대로 저장</li>
     *   <li>{@link Document#setOverallStatus(Document.Status)} 는 항목 중 하나라도 ABNORMAL 이면 ABNORMAL</li>
     * </ul>
     */
    private void applyContent(Document document,
                              CaregiverCareCheckDto.Content content,
                              LocalDate date,
                              Patient patient,
                              Document.DocumentStatus newStatus) {
        document.setRecordDate(date);
        document.setPatientId(patient);
        document.setStatus(newStatus);
        document.setTitle(buildTitle(patient, date));

        if (content == null) {
            document.setContent(null);
            document.setOverallStatus(null);
            return;
        }

        try {
            String json = objectMapper.writeValueAsString(content);
            document.setContent(json);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("체크리스트 JSON 직렬화 실패", e);
        }
        document.setOverallStatus(computeOverallStatus(content));
    }

    /** 항목 중 하나라도 ABNORMAL 이면 ABNORMAL, 그 외에는 NORMAL. 모두 미선택이면 null. */
    private Document.Status computeOverallStatus(CaregiverCareCheckDto.Content content) {
        boolean anySelected = false;
        boolean anyAbnormal = false;

        if (content.getMeal() != null) {
            anyAbnormal |= isAbnormal(content.getMeal().getMorning());
            anyAbnormal |= isAbnormal(content.getMeal().getLunch());
            anyAbnormal |= isAbnormal(content.getMeal().getDinner());
            anySelected |= hasAnyMealStatus(content.getMeal());
        }
        if (content.getHygiene() != null) {
            anyAbnormal |= isAbnormal(content.getHygiene().getBedding());
            anyAbnormal |= isAbnormal(content.getHygiene().getPatientItems());
            anyAbnormal |= isAbnormal(content.getHygiene().getBathing());
            anySelected |= statusOf(content.getHygiene().getBedding()) != null
                    || statusOf(content.getHygiene().getPatientItems()) != null
                    || statusOf(content.getHygiene().getBathing()) != null;
        }
        if (content.getCondition() != null) {
            anyAbnormal |= isAbnormal(content.getCondition().getBreathing());
            anyAbnormal |= isAbnormal(content.getCondition().getPain());
            anyAbnormal |= isAbnormal(content.getCondition().getFall());
            anySelected |= statusOf(content.getCondition().getBreathing()) != null
                    || statusOf(content.getCondition().getPain()) != null
                    || statusOf(content.getCondition().getFall()) != null;
        }
        if (content.getElimination() != null) {
            anyAbnormal |= hasAbnormalLog(content.getElimination().getUrination());
            anyAbnormal |= hasAbnormalLog(content.getElimination().getDefecation());
            anySelected |= hasAnyLog(content.getElimination().getUrination())
                    || hasAnyLog(content.getElimination().getDefecation());
        }

        if (!anySelected) {
            return null;
        }
        return anyAbnormal ? Document.Status.ABNORMAL : Document.Status.NORMAL;
    }

    private boolean hasAnyMealStatus(CaregiverCareCheckDto.MealSection meal) {
        return slotHasStatus(meal.getMorning())
                || slotHasStatus(meal.getLunch())
                || slotHasStatus(meal.getDinner());
    }

    private boolean slotHasStatus(CaregiverCareCheckDto.MealSlot slot) {
        if (slot == null) return false;
        return statusOf(slot.getIntake()) != null
                || statusOf(slot.getHydration()) != null
                || statusOf(slot.getIncident()) != null;
    }

    private boolean isAbnormal(CaregiverCareCheckDto.MealSlot slot) {
        if (slot == null) return false;
        return isAbnormal(slot.getIntake())
                || isAbnormal(slot.getHydration())
                || isAbnormal(slot.getIncident());
    }

    private boolean isAbnormal(CaregiverCareCheckDto.MealItem item) {
        return item != null && item.getStatus() == Document.Status.ABNORMAL;
    }

    private boolean isAbnormal(CaregiverCareCheckDto.HygieneItem item) {
        return item != null && item.getStatus() == Document.Status.ABNORMAL;
    }

    private boolean isAbnormal(CaregiverCareCheckDto.ConditionItem item) {
        return item != null && item.getStatus() == Document.Status.ABNORMAL;
    }

    /** EliminationItem 의 logs 중 하나라도 ABNORMAL 이면 true. */
    private boolean hasAbnormalLog(CaregiverCareCheckDto.EliminationItem item) {
        if (item == null || item.getLogs() == null) return false;
        return item.getLogs().stream()
                .anyMatch(l -> l != null && l.getStatus() == Document.Status.ABNORMAL);
    }

    /** EliminationItem 에 로그가 한 건이라도 있으면 true. */
    private boolean hasAnyLog(CaregiverCareCheckDto.EliminationItem item) {
        return item != null && item.getLogs() != null && !item.getLogs().isEmpty();
    }

    private Document.Status statusOf(CaregiverCareCheckDto.MealItem item) {
        return item == null ? null : item.getStatus();
    }

    private Document.Status statusOf(CaregiverCareCheckDto.HygieneItem item) {
        return item == null ? null : item.getStatus();
    }

    private Document.Status statusOf(CaregiverCareCheckDto.ConditionItem item) {
        return item == null ? null : item.getStatus();
    }

    /** 저장된 Document 를 응답 DTO 로 매핑(JSON content 를 다시 객체로 풀어서 채움). */
    private CaregiverCareCheckDto.Response toResponse(Document document) {
        CaregiverCareCheckDto.Content content = null;
        String raw = document.getContent();
        if (raw != null && !raw.isBlank()) {
            try {
                content = objectMapper.readValue(raw, CaregiverCareCheckDto.Content.class);
            } catch (JsonProcessingException ignored) {
                // 손상된 JSON 이라도 메타데이터는 살려서 응답한다.
                content = null;
            }
        }

        Patient patient = document.getPatientId();
        return CaregiverCareCheckDto.Response.builder()
                .documentId(document.getDocumentId())
                .patientId(patient != null ? patient.getPatientId() : null)
                .patientName(patient != null ? patient.getName() : null)
                .recordDate(document.getRecordDate())
                .status(document.getStatus())
                .overallStatus(document.getOverallStatus())
                .content(content)
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }
}
