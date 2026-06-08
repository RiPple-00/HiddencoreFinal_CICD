package hiddencore.ddasum.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;

import hiddencore.ddasum.backend.domain.Medication;
import hiddencore.ddasum.backend.domain.MedicationDetail;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.domain.Users;
import hiddencore.ddasum.backend.domain.Users.UsersRole;
import hiddencore.ddasum.backend.repository.MedicationDetailRepository;
import hiddencore.ddasum.backend.repository.MedicationRepository;
import hiddencore.ddasum.backend.repository.MemberRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.repository.UsersRepository;
import hiddencore.ddasum.backend.web.dto.guardian.MedicationDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final MedicationRepository medicationRepository;
    private final PatientRepository patientRepository;
    private final UsersRepository usersRepository;
    private final MemberRepository memberRepository;

    private final MedicationQrParser medicationQrParser;
    private final MedicationApiClient medicationApiClient;
    private final ObjectMapper objectMapper;

    private final EdbQrDecoder edbQrDecoder;
    private final HiraMedicationApiClient hiraMedicationApiClient;
    private final MfdsEasyDrugApiClient mfdsEasyDrugApiClient;
    private final MfdsDrugPermitApiClient mfdsDrugPermitApiClient;
    private final MfdsDurApiClient mfdsDurApiClient;
    private final MedicationDetailRepository medicationDetailRepository;

    @Transactional
    public MedicationDto.Response saveMedicationFromQr(MedicationDto.ScanRequest request) {

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new IllegalArgumentException("환자를 찾을 수 없습니다. id=" + request.getPatientId()));

        Users guardian = null;

        if (request.getGuardianId() != null) {
            guardian = usersRepository.findById(request.getGuardianId())
                    .orElseThrow(() -> new IllegalArgumentException("보호자를 찾을 수 없습니다. id=" + request.getGuardianId()));
        }

        if (isEdbQr(request.getQrRawData())) {
            return saveMedicationFromEdbQr(request, patient, guardian);
        }

        MedicationDto.ParsedPrescription parsedPrescription = medicationQrParser.parse(request.getQrRawData());

        if (parsedPrescription.getMedicines() == null || parsedPrescription.getMedicines().isEmpty()) {
            throw new IllegalArgumentException("QR 데이터에 약 정보가 없습니다.");
        }

        List<MedicationDto.MedicineApiInfo> medicineApiInfos = new ArrayList<>();

        for (MedicationDto.ParsedMedicine parsedMedicine : parsedPrescription.getMedicines()) {

            Optional<MedicationApiClient.DrugInfo> drugInfoOptional = medicationApiClient
                    .searchByMedicineName(parsedMedicine.getMedicineName());

            MedicationDto.MedicineApiInfo.MedicineApiInfoBuilder medicineBuilder = MedicationDto.MedicineApiInfo
                    .builder()
                    .medicineName(parsedMedicine.getMedicineName())
                    .dose(parsedMedicine.getDose())
                    .timesPerDay(parsedMedicine.getTimesPerDay())
                    .days(parsedMedicine.getDays());

            if (drugInfoOptional.isPresent()) {
                MedicationApiClient.DrugInfo drugInfo = drugInfoOptional.get();

                medicineBuilder
                        .itemSeq(drugInfo.getItemSeq())
                        .entpName(drugInfo.getEntpName())
                        .efficacy(drugInfo.getEfficacy())
                        .useMethod(drugInfo.getUseMethod())
                        .cautionWarning(drugInfo.getCautionWarning())
                        .caution(drugInfo.getCaution())
                        .interaction(drugInfo.getInteraction())
                        .sideEffect(drugInfo.getSideEffect())
                        .storageMethod(drugInfo.getStorageMethod());
            }

            medicineApiInfos.add(medicineBuilder.build());
        }

        String medicineData;

        try {
            medicineData = objectMapper.writeValueAsString(medicineApiInfos);
        } catch (Exception e) {
            throw new IllegalArgumentException("약 정보를 JSON으로 변환하는 중 오류가 발생했습니다.");
        }

        String medicineSummary = createMedicineSummary(medicineApiInfos);
        int maxDays =
                parsedPrescription.getMedicines().stream()
                        .map(MedicationDto.ParsedMedicine::getDays)
                        .filter(days -> days != null && days > 0)
                        .max(Integer::compareTo)
                        .orElse(7);

        Medication medication =
                buildMedicationRecord(
                        patient,
                        guardian,
                        parsedPrescription.getPrescriptionDate(),
                        request.getQrRawData(),
                        medicineData,
                        medicineSummary,
                        maxDays);

        Medication savedMedication = medicationRepository.save(medication);

        return MedicationDto.Response.builder()
                .medicationId(savedMedication.getMedicationId())
                .patientId(request.getPatientId())
                .guardianId(request.getGuardianId())
                .prescriptionDate(savedMedication.getPrescriptionDate())
                .medicineSummary(savedMedication.getMedicineSummary())
                .medicineData(savedMedication.getMedicineData())
                .build();
    }

    private MedicationDto.Response saveMedicationFromEdbQr(
            MedicationDto.ScanRequest request,
            Patient patient,
            Users guardian) {
        LocalDate prescriptionDate = edbQrDecoder.extractPrescriptionDateFromQr(request.getQrRawData());

        List<String> itemSeqs = edbQrDecoder.extractMedicationCodesFromQr(request.getQrRawData());

        if (itemSeqs == null || itemSeqs.isEmpty()) {
            throw new IllegalArgumentException("EDB QR에서 약 코드를 추출할 수 없습니다.");
        }

        List<Map<String, Object>> medicineInfos = new ArrayList<>();

        for (String itemSeq : itemSeqs) {
            Map<String, Object> row = new LinkedHashMap<>();

            row.put("source", "EDB_QR");
            row.put("itemSeq", itemSeq);

            var hiraDrugInfoOptional = hiraMedicationApiClient.searchByMdsCd(itemSeq);

            if (hiraDrugInfoOptional.isPresent()) {
                HiraMedicationApiClient.HiraDrugInfo drugInfo = hiraDrugInfoOptional.get();

                row.put("apiFound", true);
                row.put("medicineName", drugInfo.getItemName());
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
                Map<String, Object> permitInfoByEdi = mfdsDrugPermitApiClient.getPermitInfoByEdiCode(itemSeq);

                row.putAll(permitInfoByEdi);

                if (Boolean.TRUE.equals(permitInfoByEdi.get("permitInfoFound"))) {
                    row.put("apiFound", true);
                    row.put("apiSource", "MFDS_PERMIT_BY_EDI");

                    Object permitItemName = permitInfoByEdi.get("permitItemName");
                    Object permitEntpName = permitInfoByEdi.get("permitEntpName");

                    row.put("medicineName", permitItemName == null ? null : permitItemName.toString());
                    row.put("itemName", permitItemName == null ? null : permitItemName.toString());
                    row.put("manufacturerName", permitEntpName == null ? "" : permitEntpName.toString());

                } else {
                    row.put("apiFound", false);
                    row.put("medicineName", null);
                    row.put("itemName", null);
                }
            }

            String medicineNameForSearch = resolveMedicineName(row);
            String manufacturerName = resolveManufacturerName(row);

            Map<String, Object> easyDrugInfo = mfdsEasyDrugApiClient.getEasyDrugInfo(medicineNameForSearch);
            row.putAll(easyDrugInfo);

            /*
             * e약은요 이름 조회 실패 + 아직 허가정보가 없으면
             * 식약처 허가정보에서 permitItemSeq를 먼저 확보
             */
            if (!Boolean.TRUE.equals(easyDrugInfo.get("drugInfoFound"))
                    && !Boolean.TRUE.equals(row.get("permitInfoFound"))) {
                Map<String, Object> permitInfo = mfdsDrugPermitApiClient.getPermitInfo(
                        medicineNameForSearch,
                        manufacturerName);
                row.putAll(permitInfo);
            }

            String permitItemSeq = "";

            Object permitItemSeqValue = row.get("permitItemSeq");
            if (permitItemSeqValue != null) {
                permitItemSeq = permitItemSeqValue.toString();
            }

            /*
             * e약은요 이름 조회 실패 시,
             * 공식 요청변수 itemSeq로 한 번 더 조회
             */
            if (!Boolean.TRUE.equals(easyDrugInfo.get("drugInfoFound"))
                    && permitItemSeq != null
                    && !permitItemSeq.isBlank()) {
                Map<String, Object> easyDrugInfoByItemSeq = mfdsEasyDrugApiClient
                        .getEasyDrugInfoByItemSeq(permitItemSeq);

                row.putAll(easyDrugInfoByItemSeq);
            }

            /*
             * e약은요 조회가 최종 실패하면,
             * 식약처 허가 상세정보 API로 효능/용법/주의사항 조회
             */
            if (!Boolean.TRUE.equals(row.get("drugInfoFound"))
                    && permitItemSeq != null
                    && !permitItemSeq.isBlank()) {
                Map<String, Object> permitDetailInfo = mfdsDrugPermitApiClient.getPermitDetailByItemSeq(permitItemSeq);

                row.putAll(permitDetailInfo);
            }  

            if (permitItemSeq != null && !permitItemSeq.isBlank()) {
                Map<String, Object> durInfo = mfdsDurApiClient.getDurInfo(medicineNameForSearch, permitItemSeq);
                row.putAll(durInfo);
            } else {
                row.put("durInfoFound", false);
                row.put("durProductFound", false);
                row.put("durWarningCount", 0);
                row.put("durWarnings", new ArrayList<>());
                row.put("durProductInfo", null);
                row.put("durInfoMessage", "품목기준코드가 없어 DUR 정확 조회를 생략했습니다.");
            }

            medicineInfos.add(row);
        }

        String medicineData;

        try {
            medicineData = objectMapper.writeValueAsString(medicineInfos);
        } catch (Exception e) {
            throw new IllegalArgumentException("EDB 약 정보를 JSON으로 변환하는 중 오류가 발생했습니다.");
        }

        String medicineSummary = createEdbMedicineSummary(medicineInfos);

        Medication medication =
                buildMedicationRecord(
                        patient,
                        guardian,
                        prescriptionDate,
                        request.getQrRawData(),
                        medicineData,
                        medicineSummary,
                        7);

        Medication savedMedication = medicationRepository.save(medication);

        saveEdbMedicationDetails(savedMedication, medicineInfos);

        return MedicationDto.Response.builder()
                .medicationId(savedMedication.getMedicationId())
                .patientId(request.getPatientId())
                .guardianId(request.getGuardianId())
                .prescriptionDate(savedMedication.getPrescriptionDate())
                .medicineSummary(savedMedication.getMedicineSummary())
                .medicineData(savedMedication.getMedicineData())
                .build();
    }

    private Medication buildMedicationRecord(
            Patient patient,
            Users guardian,
            LocalDate prescriptionDate,
            String qrRawData,
            String medicineData,
            String medicineSummary,
            int treatmentDays) {
        LocalDate startDate = prescriptionDate != null ? prescriptionDate : LocalDate.now();
        int days = treatmentDays > 0 ? treatmentDays : 7;
        LocalDate endDate = startDate.plusDays(Math.max(days - 1L, 0L));

        String medicationName = medicineSummary;
        if (medicationName == null || medicationName.isBlank()) {
            medicationName = "처방전";
        }
        if (medicationName.length() > 200) {
            medicationName = medicationName.substring(0, 200);
        }

        return Medication.builder()
                .patientId(patient)
                .guardianId(guardian)
                .prescriptionDate(startDate)
                .medicationName(medicationName)
                .startDate(startDate)
                .endDate(endDate)
                .doctorUserId(resolveDoctorForPatient(patient))
                .qrRawData(qrRawData)
                .medicineData(medicineData)
                .medicineSummary(medicineSummary)
                .build();
    }

    private Users resolveDoctorForPatient(Patient patient) {
        if (patient.getFacilityId() != null) {
            Long facilityId = patient.getFacilityId().getFacilityId();
            Optional<Users> doctor =
                    memberRepository.findFirstByFacilityId_FacilityIdAndRole(facilityId, UsersRole.DOCTOR);
            if (doctor.isPresent()) {
                return doctor.get();
            }
        }
        return memberRepository
                .findByLoginId("12345678|2120010101")
                .orElseThrow(() -> new IllegalStateException("처방 저장용 의사 계정을 찾을 수 없습니다."));
    }

    private boolean isEdbQr(String qrRawData) {
        if (qrRawData == null) {
            return false;
        }

        String normalized = qrRawData
                .replace("%2B", "+")
                .replace("%2b", "+")
                .replace(" ", "+");

        return normalized.contains("edb.co.kr/m.htm")
                && normalized.contains("MLK");
    }

    private String createEdbMedicineSummary(List<Map<String, Object>> medicines) {
        List<String> medicineNames = medicines.stream()
                .map(row -> {
                    Object name = row.get("medicineName");
                    Object itemSeq = row.get("itemSeq");

                    if (name != null && !name.toString().isBlank()) {
                        return name.toString();
                    }

                    return itemSeq == null ? "알 수 없는 약" : itemSeq.toString();
                })
                .toList();

        if (medicineNames.size() <= 3) {
            return String.join(", ", medicineNames);
        }

        return String.join(", ", medicineNames.subList(0, 3))
                + " 외 "
                + (medicineNames.size() - 3)
                + "개";
    }

    private String createMedicineSummary(List<MedicationDto.MedicineApiInfo> medicines) {
        List<String> medicineNames = medicines.stream()
                .map(MedicationDto.MedicineApiInfo::getMedicineName)
                .toList();

        if (medicineNames.size() <= 3) {
            return String.join(", ", medicineNames);
        }

        return String.join(", ", medicineNames.subList(0, 3))
                + " 외 "
                + (medicineNames.size() - 3)
                + "개";
    }

    private String resolveMedicineName(Map<String, Object> row) {
        if (row == null) {
            return "";
        }

        Object medicineName = row.get("medicineName");

        if (medicineName == null || medicineName.toString().isBlank()) {
            medicineName = row.get("itemName");
        }

        if (medicineName == null) {
            return "";
        }

        return medicineName.toString();
    }

    private String resolveManufacturerName(Map<String, Object> row) {
        if (row == null) {
            return "";
        }

        Object manufacturerName = row.get("manufacturerName");

        if (manufacturerName == null) {
            return "";
        }

        return manufacturerName.toString();

    }

    private void saveEdbMedicationDetails(
            Medication savedMedication,
            List<Map<String, Object>> medicineInfos) {
        for (Map<String, Object> row : medicineInfos) {
            try {
                MedicationDetail detail = MedicationDetail.builder()
                        .medication(savedMedication)

                        .itemSeq(toStr(row.get("itemSeq")))
                        .medicineName(toStr(row.get("medicineName")))
                        .itemName(toStr(row.get("itemName")))
                        .manufacturerName(toStr(row.get("manufacturerName")))
                        .unit(toStr(row.get("unit")))
                        .payType(toStr(row.get("payType")))
                        .route(toStr(row.get("route")))
                        .classNo(toStr(row.get("classNo")))
                        .mainIngredientCode(toStr(row.get("mainIngredientCode")))
                        .applyStartDate(toStr(row.get("applyStartDate")))
                        .applyEndDate(toStr(row.get("applyEndDate")))
                        .maxPrice(toStr(row.get("maxPrice")))
                        .specialGeneralType(toStr(row.get("specialGeneralType")))
                        .substitutionType(toStr(row.get("substitutionType")))

                        .drugInfoFound(toBool(row.get("drugInfoFound")))
                        .drugInfoMessage(toStr(row.get("drugInfoMessage")))
                        .drugInfoSearchName(toStr(row.get("drugInfoSearchName")))

                        .easyDrugItemName(toStr(row.get("easyDrugItemName")))
                        .effect(toStr(row.get("effect")))
                        .useMethod(toStr(row.get("useMethod")))
                        .warning(toStr(row.get("warning")))
                        .caution(toStr(row.get("caution")))
                        .interaction(toStr(row.get("interaction")))
                        .sideEffect(toStr(row.get("sideEffect")))
                        .storageMethod(toStr(row.get("storageMethod")))
                        .itemImage(toStr(row.get("itemImage")))

                        .permitInfoFound(toBool(row.get("permitInfoFound")))
                        .permitSearchName(toStr(row.get("permitSearchName")))
                        .permitItemSeq(toStr(row.get("permitItemSeq")))
                        .permitItemName(toStr(row.get("permitItemName")))
                        .permitEntpName(toStr(row.get("permitEntpName")))
                        .permitEffect(toStr(row.get("permitEffect")))
                        .permitUseMethod(toStr(row.get("permitUseMethod")))
                        .permitCaution(toStr(row.get("permitCaution")))

                        .durInfoFound(toBool(row.get("durInfoFound")))
                        .durSearchName(toStr(row.get("durSearchName")))
                        .durSearchItemSeq(toStr(row.get("durSearchItemSeq")))
                        .durProductFound(toBool(row.get("durProductFound")))
                        .durWarningCount(toInt(row.get("durWarningCount")))
                        .durWarningsJson(toJson(dedupeDurWarnings(row.get("durWarnings"))))
                        .durProductInfoJson(toJson(row.get("durProductInfo")))
                        .durInfoMessage(toStr(row.get("durInfoMessage")))

                        .build();

                medicationDetailRepository.save(detail);

            } catch (Exception e) {
                System.out.println(
                        "약 상세 저장 실패 itemSeq=" + row.get("itemSeq")
                                + ", message=" + e.getMessage());
            }
        }
    }

    private String toStr(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Boolean toBool(Object value) {
        if (value == null)
            return false;
        if (value instanceof Boolean b)
            return b;

        return Boolean.parseBoolean(String.valueOf(value));
    }

    private Integer toInt(Object value) {
        if (value == null)
            return 0;

        if (value instanceof Number n) {
            return n.intValue();
        }

        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception e) {
            return 0;
        }
    }

    @SuppressWarnings("unchecked")
    private Object dedupeDurWarnings(Object value) {
        if (!(value instanceof List<?> list)) {
            return value;
        }

        List<Map<String, Object>> result = new ArrayList<>();
        List<String> seen = new ArrayList<>();

        for (Object item : list) {
            if (!(item instanceof Map<?, ?> rawMap)) {
                continue;
            }

            Map<String, Object> warning = new LinkedHashMap<>();

            for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                warning.put(String.valueOf(entry.getKey()), entry.getValue());
            }

            String key = String.join("|",
                    toStr(warning.get("durCategory")),
                    toStr(warning.get("durIngredientName")),
                    toStr(warning.get("durContent")),
                    toStr(warning.get("durNotificationDate")));

            if (!seen.contains(key)) {
                seen.add(key);
                result.add(warning);
            }
        }

        return result;
    }

    private String toJson(Object value) {
        if (value == null)
            return null;

        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMedicationHistory(Long patientId, Long guardianId) {
        List<Medication> medications =
                guardianId == null
                        ? medicationRepository.findByPatientId_PatientIdOrderByPrescriptionDateDesc(
                                patientId)
                        : medicationRepository
                                .findByPatientId_PatientIdAndGuardianId_UserIdOrderByPrescriptionDateDescMedicationIdDesc(
                                        patientId, guardianId);

        return medications.stream().map(medication -> {
            Map<String, Object> row = new LinkedHashMap<>();

            row.put("medicationId", medication.getMedicationId());
            row.put("patientId", medication.getPatientId().getPatientId());
            row.put("guardianId", medication.getGuardianId() == null ? null : medication.getGuardianId().getUserId());
            row.put("prescriptionDate", medication.getPrescriptionDate());
            row.put("medicineSummary", medication.getMedicineSummary());
            row.put("createdAt", medication.getCreatedAt());

            return row;
        }).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMedicationDetail(Long medicationId) {
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new IllegalArgumentException("처방 기록을 찾을 수 없습니다. id=" + medicationId));

        List<MedicationDetail> details = medicationDetailRepository
                .findByMedication_MedicationIdOrderByMedicationDetailIdAsc(medicationId);

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("medicationId", medication.getMedicationId());
        result.put("patientId", medication.getPatientId().getPatientId());
        result.put("guardianId", medication.getGuardianId() == null ? null : medication.getGuardianId().getUserId());
        result.put("prescriptionDate", medication.getPrescriptionDate());
        result.put("medicineSummary", medication.getMedicineSummary());
        result.put("details", details.stream().map(this::detailToMap).toList());

        return result;
    }

    private Map<String, Object> detailToMap(MedicationDetail detail) {
        Map<String, Object> row = new LinkedHashMap<>();

        row.put("medicationDetailId", detail.getMedicationDetailId());
        row.put("itemSeq", detail.getItemSeq());
        row.put("medicineName", detail.getMedicineName());
        row.put("itemName", detail.getItemName());
        row.put("manufacturerName", detail.getManufacturerName());
        row.put("unit", detail.getUnit());
        row.put("payType", detail.getPayType());
        row.put("route", detail.getRoute());
        row.put("classNo", detail.getClassNo());
        row.put("mainIngredientCode", detail.getMainIngredientCode());
        row.put("specialGeneralType", detail.getSpecialGeneralType());
        row.put("substitutionType", detail.getSubstitutionType());

        row.put("drugInfoFound", detail.getDrugInfoFound());
        row.put("drugInfoMessage", detail.getDrugInfoMessage());
        row.put("drugInfoSearchName", detail.getDrugInfoSearchName());

        row.put("easyDrugItemName", detail.getEasyDrugItemName());
        row.put("effect", detail.getEffect());
        row.put("useMethod", detail.getUseMethod());
        row.put("warning", detail.getWarning());
        row.put("caution", detail.getCaution());
        row.put("interaction", detail.getInteraction());
        row.put("sideEffect", detail.getSideEffect());
        row.put("storageMethod", detail.getStorageMethod());
        row.put("itemImage", detail.getItemImage());

        row.put("permitInfoFound", detail.getPermitInfoFound());
        row.put("permitItemSeq", detail.getPermitItemSeq());
        row.put("permitItemName", detail.getPermitItemName());
        row.put("permitEntpName", detail.getPermitEntpName());
        row.put("permitEffect", detail.getPermitEffect());
        row.put("permitUseMethod", detail.getPermitUseMethod());
        row.put("permitCaution", detail.getPermitCaution());

        row.put("durInfoFound", detail.getDurInfoFound());
        row.put("durProductFound", detail.getDurProductFound());
        row.put("durWarningCount", detail.getDurWarningCount());
        row.put("durInfoMessage", detail.getDurInfoMessage());
        row.put("durWarnings", fromJson(detail.getDurWarningsJson()));
        row.put("durProductInfo", fromJson(detail.getDurProductInfoJson()));

        return row;
    }

    private Object fromJson(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json;
        }
    }
}