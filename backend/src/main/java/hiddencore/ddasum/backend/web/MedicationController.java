package hiddencore.ddasum.backend.web;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.service.EdbQrDecoder;
import hiddencore.ddasum.backend.service.MedicationApiClient;
import hiddencore.ddasum.backend.service.MedicationService;
import hiddencore.ddasum.backend.service.HiraMedicationApiClient;
import hiddencore.ddasum.backend.web.dto.guardian.MedicationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Medication", description = "복약/처방전 QR API")
@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicationController {

    private final MedicationService medicationService;
    private final EdbQrDecoder edbQrDecoder;
    private final MedicationApiClient medicationApiClient;
    private final HiraMedicationApiClient hiraMedicationApiClient;

    /**
     * 📌 처방전 QR 스캔 후 약 정보 저장
     * POST /api/medications/scan
     */
    @Operation(summary = "처방전 QR 스캔 저장", description = "보호자가 처방전 QR을 스캔하면 처방일자와 약 정보를 파싱하고, 의약품 API 정보를 조회하여 저장합니다.")
    @PostMapping("/scan")
    public ResponseEntity<MedicationDto.Response> scanMedicationQr(
            @RequestBody MedicationDto.ScanRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return ResponseEntity.ok(
                medicationService.saveMedicationFromQr(request));
    }

    /**
     * 📌 EDB QR 1차 디코딩 테스트
     * POST /api/medications/edb-decode
     */
    @PostMapping("/edb-decode")
    public ResponseEntity<String> decodeEdbQr(
            @RequestBody Map<String, String> request) {
        String qrRawData = request.get("qrRawData");

        String decoded = edbQrDecoder.decode(qrRawData);

        return ResponseEntity.ok(decoded);
    }

    /**
     * 📌 EDB QR에서 약 코드 추출 후 약 API 조회
     * POST /api/medications/edb-drugs
     */
    @PostMapping("/edb-drugs")
    public ResponseEntity<List<Map<String, Object>>> decodeEdbQrDrugs(
            @RequestBody Map<String, String> request) {
        String qrRawData = request.get("qrRawData");

        List<String> itemSeqs = edbQrDecoder.extractMedicationCodesFromQr(qrRawData);
        LocalDate prescriptionDate = edbQrDecoder.extractPrescriptionDateFromQr(qrRawData);

        List<Map<String, Object>> result = new ArrayList<>();

        for (String itemSeq : itemSeqs) {
            Map<String, Object> row = new LinkedHashMap<>();

            row.put("prescriptionDate", prescriptionDate);
            row.put("itemSeq", itemSeq);

            var hiraDrugInfoOptional = hiraMedicationApiClient.searchByMdsCd(itemSeq);

            if (hiraDrugInfoOptional.isPresent()) {
                HiraMedicationApiClient.HiraDrugInfo drugInfo = hiraDrugInfoOptional.get();

                row.put("apiFound", true);
                row.put("itemName", drugInfo.getItemName());
                row.put("manufacturerName", drugInfo.getManufacturerName());
                row.put("unit", drugInfo.getUnit());
                row.put("payType", drugInfo.getPayType());
                row.put("route", drugInfo.getRoute());
                row.put("classNo", drugInfo.getClassNo());
                row.put("mainIngredientCode", drugInfo.getMainIngredientCode());
                row.put("applyStartDate", drugInfo.getApplyStartDate());
                row.put("applyEndDate", drugInfo.getApplyEndDate());
                row.put("maxPrice", drugInfo.getMaxPrice());
                row.put("specialGeneralType", drugInfo.getSpecialGeneralType());
                row.put("substitutionType", drugInfo.getSubstitutionType());
            } else {
                row.put("apiFound", false);
                row.put("itemName", null);
            }

            result.add(row);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getMedicationHistory(
            @RequestParam Long patientId,
            @RequestParam(required = false) Long guardianId) {
        return ResponseEntity.ok(
                medicationService.getMedicationHistory(patientId, guardianId));
    }

    @GetMapping("/{medicationId}")
    public ResponseEntity<?> getMedicationDetail(
            @PathVariable Long medicationId) {
        return ResponseEntity.ok(
                medicationService.getMedicationDetail(medicationId));
    }
}