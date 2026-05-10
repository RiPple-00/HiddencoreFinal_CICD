package hiddencore.ddasum.backend.repository.caregiver;

import hiddencore.ddasum.backend.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 간병인 일일 업무 체크리스트({@link Document.DocumentType#CARE_CHECK}) 전용 리포지토리.
 *
 * <p>{@code Document} 테이블을 그대로 사용하지만 type=CARE_CHECK 만 다루므로 caregiver 패키지에 둔다.
 * 자동 저장은 (환자 + 날짜) 단일 문서를 upsert 방식으로 갱신하기 위해 단건 조회 메서드를 제공한다.
 */
public interface CaregiverCareCheckRepository extends JpaRepository<Document, Long> {

    /**
     * 특정 환자, 특정 일자의 CARE_CHECK 문서 한 건을 가져온다.
     * 동일 (환자, 일자) 조합이 이미 있으면 자동 저장 시 그 문서를 갱신해야 하므로
     * 가장 최근(updated_at desc) 한 건을 우선 반환한다.
     */
    @Query("""
        SELECT d
        FROM Document d
        WHERE d.type = hiddencore.ddasum.backend.domain.Document.DocumentType.CARE_CHECK
          AND d.patientId.patientId = :patientId
          AND d.recordDate = :recordDate
        ORDER BY d.updatedAt DESC
    """)
    List<Document> findCareChecks(@Param("patientId") Long patientId,
                                  @Param("recordDate") LocalDate recordDate);

    default Optional<Document> findLatestCareCheck(Long patientId, LocalDate recordDate) {
        List<Document> list = findCareChecks(patientId, recordDate);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    /** 특정 환자의 CARE_CHECK 이력 - 최신순. 추후 목록 화면에서 활용 */
    @Query("""
        SELECT d
        FROM Document d
        WHERE d.type = hiddencore.ddasum.backend.domain.Document.DocumentType.CARE_CHECK
          AND d.patientId.patientId = :patientId
        ORDER BY d.recordDate DESC, d.updatedAt DESC
    """)
    List<Document> findAllByPatient(@Param("patientId") Long patientId);
}
