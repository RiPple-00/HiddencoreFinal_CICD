package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.web.dto.guardian.MedicationDto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class MedicationQrParser {

    private final ObjectMapper objectMapper;

    public MedicationDto.ParsedPrescription parse(String qrRawData) {
        try {
            JsonNode root = objectMapper.readTree(qrRawData);

            LocalDate prescriptionDate = LocalDate.parse(
                    root.path("prescriptionDate").asText()
            );

            List<MedicationDto.ParsedMedicine> medicines = new ArrayList<>();

            for (JsonNode medicineNode : root.path("medicines")) {
                medicines.add(
                        MedicationDto.ParsedMedicine.builder()
                                .medicineName(medicineNode.path("medicineName").asText())
                                .dose(medicineNode.path("dose").asText(null))
                                .timesPerDay(
                                        medicineNode.path("timesPerDay").isMissingNode()
                                                ? null
                                                : medicineNode.path("timesPerDay").asInt()
                                )
                                .days(
                                        medicineNode.path("days").isMissingNode()
                                                ? null
                                                : medicineNode.path("days").asInt()
                                )
                                .build()
                );
            }

            return MedicationDto.ParsedPrescription.builder()
                    .prescriptionDate(prescriptionDate)
                    .medicines(medicines)
                    .build();

        } catch (Exception e) {
            throw new IllegalArgumentException("QR 데이터 형식이 올바르지 않습니다.");
        }
    }
}