package hiddencore.ddasum.backend.web.dto.guardian;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

public class MedicationDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScanRequest {
        private Long patientId;
        private Long guardianId;
        private String qrRawData;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ParsedPrescription {
        private LocalDate prescriptionDate;
        private List<ParsedMedicine> medicines;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ParsedMedicine {
        private String medicineName;
        private String dose;
        private Integer timesPerDay;
        private Integer days;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class MedicineApiInfo {
        private String medicineName;
        private String dose;
        private Integer timesPerDay;
        private Integer days;

        private String itemSeq;
        private String entpName;
        private String efficacy;
        private String useMethod;
        private String cautionWarning;
        private String caution;
        private String interaction;
        private String sideEffect;
        private String storageMethod;
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class Response {
        private Long medicationId;
        private Long patientId;
        private Long guardianId;
        private LocalDate prescriptionDate;
        private String medicineSummary;
        private String medicineData;
    }
}