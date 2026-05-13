package hiddencore.ddasum.backend.web.dto.caregiver;

import com.fasterxml.jackson.annotation.JsonInclude;
import hiddencore.ddasum.backend.domain.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 간병인 일일 업무 체크리스트(=Document.type=CARE_CHECK)에 사용되는 DTO 묶음.
 *
 * <p>저장 시 본 DTO의 {@link Content} 가 JSON 으로 직렬화되어 {@link Document#getContent()} 에 그대로 저장되고,
 * 조회 시에는 다시 동일한 JSON 을 역직렬화해서 클라이언트에 돌려준다.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CaregiverCareCheckDto {

    /** 자동 저장(임시저장) / 제출(승인 대기) 공용 요청 본문 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveRequest {
        /** 환자 ID (필수) */
        private Long patientId;

        /** 기록 일자(yyyy-MM-dd). 미지정 시 서버 오늘 날짜로 처리. */
        private LocalDate recordDate;

        /** 실제 체크리스트 데이터(JSON 본문) */
        private Content content;
    }

    /** 단건 조회 / 저장 응답에 사용되는 DTO */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Response {
        private Long documentId;
        private Long patientId;
        private String patientName;
        private LocalDate recordDate;

        /** DRAFT(자동저장) / PENDING_APPROVAL(제출완료) 등 */
        private Document.DocumentStatus status;

        /** 종합 상태(NORMAL/ABNORMAL). 어느 항목이라도 ABNORMAL 이 있으면 ABNORMAL 로 계산. */
        private Document.Status overallStatus;

        /** JSON 으로 저장된 체크리스트 본문을 객체 형태로 다시 풀어서 내려준다. */
        private Content content;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ============================================================
    // 실제 체크리스트(JSON) 스키마
    // ============================================================

    /** 체크리스트 본문 - 화면 섹션과 1:1 매핑 */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Content {
        private MealSection meal;
        private HygieneSection hygiene;
        private ConditionSection condition;
        private EliminationSection elimination;

        /** 하단 "특이사항" 자유 텍스트 */
        private String specialNotes;
    }

    // ===== 식사 (Meal) =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MealSection {
        /** 아침/점심/저녁 - 각 시간대별 정상/이상 묶음 */
        private MealSlot morning;
        private MealSlot lunch;
        private MealSlot dinner;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MealSlot {
        /** 식사 섭취량 - 정상/이상 + 이상 시 셀별 메모 */
        private MealItem intake;
        /** 수분 섭취량 - 정상/이상 + 이상 시 셀별 메모 */
        private MealItem hydration;
        /** 사례 여부(사레/기침 등) - 정상/이상 + 이상 시 셀별 메모 */
        private MealItem incident;
    }

    /** 식사 그리드 한 칸(예: "아침 - 식사 섭취량") 단위. 이상 선택 시 메모를 별도 보유한다. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MealItem {
        private Document.Status status;
        private String memo;
    }

    // ===== 위생점검 (Hygiene) =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HygieneSection {
        private HygieneItem bedding;       // 침구류 청결도
        private HygieneItem patientItems;  // 환자 용품 청결
        private HygieneItem bathing;       // 목욕 여부
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HygieneItem {
        private Document.Status status;
        /** 이상 선택 시 입력하는 메모 */
        private String memo;
    }

    // ===== 상태 안정화 (Condition) =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ConditionSection {
        private ConditionItem breathing; // 호흡 양상 (warn=true 표시)
        private ConditionItem pain;      // 통증 유무
        private ConditionItem fall;      // 낙상 유무
    }

    /** 호흡/통증/낙상 등 각 항목 한 줄. 이상 선택 시 항목별 메모 보유. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ConditionItem {
        private Document.Status status;
        private String memo;
    }

    // ===== 배뇨 및 배변 (Elimination) =====
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class EliminationSection {
        private EliminationItem urination;  // 배뇨
        private EliminationItem defecation; // 배변
    }

    /**
     * 배뇨/배변 한 항목.
     *
     * <p>새로운 동작 모델:
     * <ul>
     *   <li>"정상" 버튼을 누르면 즉시 logs 에 status=NORMAL 로그 1건이 추가된다(자동 횟수 +1).</li>
     *   <li>"이상" 버튼을 누르면 메모 + 제출 버튼이 펼쳐지고, 제출을 눌러야 status=ABNORMAL + 메모를 가진
     *       로그가 1건 추가되면서 횟수가 +1 된다.</li>
     *   <li>각 로그마다 자기 메모를 가지므로 상위 EliminationItem 자체에는 status/memo 가 없다.</li>
     * </ul>
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class EliminationItem {
        /** 화면에 표시되는 횟수(=logs.size). 클라이언트가 함께 보내지만 서버는 logs 길이를 정으로 간주해도 무방. */
        private Integer count;
        /** 입력 이력 - 각 로그가 독립적인 정상/이상 상태와 메모를 가진다. */
        private List<EliminationLog> logs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class EliminationLog {
        /** 로그 식별자(클라이언트 생성 UUID) - 삭제 시 매칭용 */
        private String id;
        /** 로그 한 건의 정상/이상 상태 (NORMAL = 정상 즉시 기록, ABNORMAL = 이상 + 메모 제출) */
        private Document.Status status;
        /** 로그별 메모 (정상 로그는 비어있을 수 있다) */
        private String memo;
        /** 로그 발생 시각(ISO-8601) */
        private LocalDateTime createdAt;
    }
}
