package hiddencore.ddasum.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "MEDICATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    // 환자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patientId;

    // 보호자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id")
    private Users guardianId;

    // 처방일자
    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate;

    /** 기존 MEDICATION 테이블 NOT NULL 컬럼 (QR 저장 시 요약·기간으로 채움) */
    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docter_user_id", nullable = false)
    private Users doctorUserId;

    // QR 원본 데이터
    @Lob // longobject 긴애들
    @Column(name = "qr_raw_data", columnDefinition = "LONGTEXT", nullable = false)
    private String qrRawData;

    // 약 목록 + 복용 정보 + API 조회 결과를 JSON 문자열로 저장
    @Lob
    @Column(name = "medicine_data", columnDefinition = "LONGTEXT")
    private String medicineData;

    // 화면에 간단히 보여줄 요약용
    @Column(name = "medicine_summary", length = 500)
    private String medicineSummary;

    // 처방전 안의 약 상세 목록
    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MedicationDetail> details = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}