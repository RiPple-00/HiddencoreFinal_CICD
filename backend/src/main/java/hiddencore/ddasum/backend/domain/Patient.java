package hiddencore.ddasum.backend.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PATIENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location locationId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /**
     * 선택 입력(null 가능). 저장 시에는 {@link Gender#name()} 만 DB에 기록.
     * 읽기 시 레거시·한글·깨진 문자열이 있어도 매핑 실패로 전체 조회가 죽지 않도록 컨버터 사용.
     */
    @Convert(converter = PatientGenderConverter.class)
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 20)
    private Gender gender;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "address", length = 255) // 주소 칼럼 추가
    private String address;

    @Column(name = "admission_date", nullable = false) // 입원 날짜
    private LocalDate admissionDate;

    @Column(name = "discharge_date")
    private LocalDate dischargeDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_type", nullable = false)
    private BloodType type;

    @Column(name = "height", precision = 5, scale = 2) // precision 총 자리수, scale = 소수점 표현 자리수
    private BigDecimal height; // BigDecimal 더 정확한 소수점

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "admission_status", length = 100)
    private String admissionStatus;

    @Column(name = "diet_type", length = 50)
    private String dietType;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private PatientStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BloodType {
        A_POSITIVE("A형+"),
        A_NEGATIVE("A형-"),
        B_POSITIVE("B형+"),
        B_NEGATIVE("B형-"),
        O_POSITIVE("O형+"),
        O_NEGATIVE("O형-"),
        AB_POSITIVE("AB형+"),
        AB_NEGATIVE("AB형-");

        private final String description;

        BloodType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum PatientStatus {
        STABLE("안정"),
        MONITORING("집중관찰"),
        DISCHARGE("퇴원예정"),
        POSTOPERATIVE("수술후"),
        CRITICAL("위험"),
        /** 더미/시드 데이터 호환: 퇴원 완료 */
        DISCHARGED("퇴원완료");

        private final String description;

        PatientStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum Gender {
        MALE,
        FEMALE,
        OTHER
    }

    @Converter(autoApply = false)
    public static class PatientGenderConverter implements AttributeConverter<Gender, String> {

        @Override
        public String convertToDatabaseColumn(Gender attribute) {
            return attribute == null ? null : attribute.name();
        }

        @Override
        public Gender convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) {
                return null;
            }
            String s = dbData.trim();
            try {
                return Gender.valueOf(s.toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // fall through: 레거시 한글·인코딩 깨짐 등
            }
            return switch (s) {
                case "남", "남성", "M", "m", "Male", "MALE" -> Gender.MALE;
                case "여", "여성", "F", "f", "Female", "FEMALE" -> Gender.FEMALE;
                case "기타", "Other", "OTHER" -> Gender.OTHER;
                default -> Gender.OTHER;
            };
        }
    }
   
}
