package hiddencore.ddasum.backend.domain;

import jakarta.persistence.Column;
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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MEAL_PLAN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meal_plan_id", nullable = false)
    private Long meal_plan_id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Users adminId;

    @Column(name = "meal_date", nullable = false)
    private LocalDate mealDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 30)
    private Mealtype mealType;

    @Enumerated(EnumType.STRING)
    @Column(name = "diet_type", nullable = false, length = 30)
    private Diettype dietType;

    @Column(name = "menu", nullable = false, columnDefinition = "TEXT")
    private String menu;

    @Column(name = "calorie")
    private Integer calorie;

    @Column(name = "protein")
    private Integer protein;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Mealtype {
        DINNER,
        LUNCH,
        BREAKFAST
    }

    public enum Diettype {
        GENERAL, // 일반식
        LOW_SODIUM, // 저염식
        DIABETIC, // 당뇨식
        SOFT, // 연식 (부드러운 음식)
        LIQUID, // 유동식
        HIGH_PROTEIN, // 고단백식
        LOW_FAT, // 저지방식
        RENAL, // 신장식
        ETC // 기타
    }

}
