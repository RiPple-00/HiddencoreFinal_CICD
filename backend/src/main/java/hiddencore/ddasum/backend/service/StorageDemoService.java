package hiddencore.ddasum.backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import hiddencore.ddasum.backend.config.DemoPatientConstants;
import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.repository.DocumentRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;

/** 보호자 앱 수납 화면 — 로컬 storageApi MOCK 과 동일한 데모 응답 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StorageDemoService {

    private final PatientRepository patientRepository;
    private final DocumentRepository documentRepository;

    public List<Map<String, Object>> listPatients(Long id) {
        long patientId = id != null ? id : DemoPatientConstants.KIM_PATIENT_ID;
        Optional<Patient> patientOpt = patientRepository.findById(patientId);
        if (patientOpt.isEmpty()) {
            return List.of(buildKimPatientFallback());
        }
        Patient patient = patientOpt.get();
        String room = "-";
        if (patient.getLocationId() != null && patient.getLocationId().getRoom() != null) {
            room = patient.getLocationId().getRoom();
        }
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", patient.getPatientId());
        row.put("name", patient.getName());
        row.put("status", "입원중");
        row.put("room", room);
        row.put(
                "admissionDate",
                patient.getAdmissionDate() != null ? patient.getAdmissionDate().toString() : "2026.04.10");
        row.put("expectedTotal", 1280000);
        row.put("expectedTotalAsOf", "2026.06.08");
        return List.of(row);
    }

    public List<Map<String, Object>> listInvoices(Long id) {
        long patientId = id != null ? id : DemoPatientConstants.KIM_PATIENT_ID;
        List<Document> payments =
                documentRepository.findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(
                        patientId, DocumentType.PAYMENT);
        if (!payments.isEmpty()) {
            List<Map<String, Object>> fromDocs = new ArrayList<>();
            int invoiceId = 101;
            for (Document doc : payments) {
                fromDocs.add(mapPaymentDocumentToInvoice(doc, invoiceId--));
            }
            return fromDocs;
        }
        return defaultInvoices();
    }

    public List<Map<String, Object>> listPayments(Long patientId) {
        return defaultPayments();
    }

    public List<Map<String, Object>> listOverdue(Long patientId, Integer limit) {
        List<Map<String, Object>> overdue = new ArrayList<>();
        for (Map<String, Object> payment : defaultPayments()) {
            String status = String.valueOf(payment.get("status"));
            if ("미납".equals(status) || "부분납".equals(status)) {
                overdue.add(payment);
            }
        }
        int max = limit != null && limit > 0 ? limit : overdue.size();
        return overdue.size() <= max ? overdue : overdue.subList(0, max);
    }

    private static Map<String, Object> buildKimPatientFallback() {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", DemoPatientConstants.KIM_PATIENT_ID);
        row.put("name", DemoPatientConstants.KIM_PATIENT_NAME);
        row.put("status", "입원중");
        row.put("room", "107");
        row.put("admissionDate", "2026.04.10");
        row.put("expectedTotal", 1280000);
        row.put("expectedTotalAsOf", "2026.06.08");
        return row;
    }

    private static Map<String, Object> mapPaymentDocumentToInvoice(Document doc, int invoiceId) {
        Map<String, Object> row = new LinkedHashMap<>();
        String title = doc.getTitle() != null ? doc.getTitle() : "청구서";
        row.put("id", invoiceId);
        row.put("month", title.length() >= 7 ? title.substring(0, 7) : "2026.06");
        row.put("title", title);
        row.put("issued", formatDate(doc.getIssuedAt()));
        row.put("due", formatDate(doc.getIssuedAt() != null ? doc.getIssuedAt().plusDays(10) : null));
        row.put("amount", inferAmount(doc));
        row.put("status", mapDocStatus(doc.getStatus()));
        row.put("tags", List.of("입원비", "식대"));
        row.put("period", "2026.04.01 ~ 2026.04.25");
        row.put("dept", "원무과");
        row.put("covered", List.of(Map.of("name", "입원료", "amount", 420000)));
        row.put("nonCovered", List.of(Map.of("name", "비급여 검사", "amount", 350000)));
        return row;
    }

    private static int inferAmount(Document doc) {
        String content = doc.getContent() != null ? doc.getContent() : "";
        if (content.contains("890,000")) {
            return 890000;
        }
        if (content.contains("520,000") || doc.getStatus() == DocumentStatus.PAID) {
            return 520000;
        }
        if (content.contains("420,000")) {
            return 890000;
        }
        return 890000;
    }

    private static String mapDocStatus(DocumentStatus status) {
        if (status == DocumentStatus.PAID) {
            return "완납";
        }
        if (status == DocumentStatus.PAYMENT_PENDING) {
            return "미납";
        }
        return "미납";
    }

    private static String formatDate(LocalDateTime value) {
        if (value == null) {
            return "2026.04.25";
        }
        return String.format(
                "%04d.%02d.%02d", value.getYear(), value.getMonthValue(), value.getDayOfMonth());
    }

    private static List<Map<String, Object>> defaultInvoices() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> apr = new LinkedHashMap<>();
        apr.put("id", 101);
        apr.put("month", "2026.04");
        apr.put("title", "2026.04 청구서");
        apr.put("issued", "2026.04.25");
        apr.put("due", "2026.05.05");
        apr.put("amount", 890000);
        apr.put("status", "미납");
        apr.put("tags", List.of("입원비", "식대"));
        apr.put("period", "2026.04.01 ~ 2026.04.25");
        apr.put("dept", "원무과");
        apr.put(
                "covered",
                List.of(
                        Map.of("name", "입원료", "amount", 420000),
                        Map.of("name", "진료비", "amount", 120000)));
        apr.put("nonCovered", List.of(Map.of("name", "비급여 검사", "amount", 350000)));
        list.add(apr);

        Map<String, Object> mar = new LinkedHashMap<>();
        mar.put("id", 100);
        mar.put("month", "2026.03");
        mar.put("title", "2026.03 청구서");
        mar.put("issued", "2026.03.25");
        mar.put("due", "2026.04.05");
        mar.put("amount", 520000);
        mar.put("status", "완납");
        mar.put("tags", List.of("진료비", "약제비"));
        mar.put("period", "2026.03.01 ~ 2026.03.25");
        mar.put("dept", "원무과");
        mar.put("covered", List.of(Map.of("name", "진료비", "amount", 300000)));
        mar.put("nonCovered", List.of(Map.of("name", "약제비", "amount", 220000)));
        list.add(mar);
        return list;
    }

    private static List<Map<String, Object>> defaultPayments() {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(
                paymentRow(
                        9001,
                        "2026-04-26T10:12:00",
                        "2026.03 청구 결제",
                        520000,
                        "완료",
                        "진료비",
                        100));
        list.add(
                paymentRow(
                        9002,
                        "2026-04-20T09:05:00",
                        "약제비 결제",
                        120000,
                        "완료",
                        "약제비",
                        100));
        list.add(
                paymentRow(
                        9003,
                        "2026-04-28T14:30:00",
                        "2026.04 청구(부분납)",
                        300000,
                        "부분납",
                        "입원비",
                        101));
        list.add(
                paymentRow(
                        9004,
                        "2026-04-28T15:00:00",
                        "2026.04 청구(미납)",
                        590000,
                        "미납",
                        "입원비",
                        101));
        return list;
    }

    private static Map<String, Object> paymentRow(
            int id,
            String paidAt,
            String title,
            int amount,
            String status,
            String category,
            int invoiceId) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", id);
        row.put("paidAt", paidAt);
        row.put("title", title);
        row.put("amount", amount);
        row.put("status", status);
        row.put("category", category);
        row.put("invoiceId", invoiceId);
        return row;
    }
}
