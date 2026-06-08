package hiddencore.ddasum.backend.domain;

import java.time.LocalDateTime;

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

@Entity
@Table(name = "MEDICATION_DETAIL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medication_detail_id", nullable = false)
    private Long medicationDetailId;

    // 어느 처방전에 속한 약인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false)
    private Medication medication;

    @Column(name = "item_seq", length = 50)
    private String itemSeq;

    @Column(name = "medicine_name", length = 500)
    private String medicineName;

    @Column(name = "item_name", length = 500)
    private String itemName;

    @Column(name = "manufacturer_name", length = 255)
    private String manufacturerName;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(name = "pay_type", length = 50)
    private String payType;

    @Column(name = "route", length = 50)
    private String route;

    @Column(name = "class_no", length = 50)
    private String classNo;

    @Column(name = "main_ingredient_code", length = 100)
    private String mainIngredientCode;

    @Column(name = "apply_start_date", length = 20)
    private String applyStartDate;

    @Column(name = "apply_end_date", length = 20)
    private String applyEndDate;

    @Column(name = "max_price", length = 50)
    private String maxPrice;

    @Column(name = "special_general_type", length = 50)
    private String specialGeneralType;

    @Column(name = "substitution_type", length = 100)
    private String substitutionType;

    @Column(name = "drug_info_found")
    private Boolean drugInfoFound;

    @Column(name = "drug_info_message", length = 500)
    private String drugInfoMessage;

    @Column(name = "drug_info_search_name", length = 255)
    private String drugInfoSearchName;

    @Column(name = "easy_drug_item_name", length = 500)
    private String easyDrugItemName;

    @Lob
    @Column(name = "easy_effect", columnDefinition = "LONGTEXT")
    private String effect;

    @Lob
    @Column(name = "easy_use_method", columnDefinition = "LONGTEXT")
    private String useMethod;

    @Lob
    @Column(name = "easy_warning", columnDefinition = "LONGTEXT")
    private String warning;

    @Lob
    @Column(name = "easy_caution", columnDefinition = "LONGTEXT")
    private String caution;

    @Lob
    @Column(name = "easy_interaction", columnDefinition = "LONGTEXT")
    private String interaction;

    @Lob
    @Column(name = "easy_side_effect", columnDefinition = "LONGTEXT")
    private String sideEffect;

    @Lob
    @Column(name = "easy_storage_method", columnDefinition = "LONGTEXT")
    private String storageMethod;

    @Column(name = "easy_item_image", length = 1000)
    private String itemImage;

    @Column(name = "permit_info_found")
    private Boolean permitInfoFound;

    @Column(name = "permit_search_name", length = 255)
    private String permitSearchName;

    @Column(name = "permit_item_seq", length = 50)
    private String permitItemSeq;

    @Column(name = "permit_item_name", length = 500)
    private String permitItemName;

    @Column(name = "permit_entp_name", length = 255)
    private String permitEntpName;

    @Lob
    @Column(name = "permit_effect", columnDefinition = "LONGTEXT")
    private String permitEffect;

    @Lob
    @Column(name = "permit_use_method", columnDefinition = "LONGTEXT")
    private String permitUseMethod;

    @Lob
    @Column(name = "permit_caution", columnDefinition = "LONGTEXT")
    private String permitCaution;

    @Column(name = "dur_info_found")
    private Boolean durInfoFound;

    @Column(name = "dur_search_name", length = 255)
    private String durSearchName;

    @Column(name = "dur_search_item_seq", length = 50)
    private String durSearchItemSeq;

    @Column(name = "dur_product_found")
    private Boolean durProductFound;

    @Column(name = "dur_warning_count")
    private Integer durWarningCount;

    @Lob
    @Column(name = "dur_warnings_json", columnDefinition = "LONGTEXT")
    private String durWarningsJson;

    @Lob
    @Column(name = "dur_product_info_json", columnDefinition = "LONGTEXT")
    private String durProductInfoJson;

    @Column(name = "dur_info_message", length = 500)
    private String durInfoMessage;

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