package hiddencore.ddasum.backend.web;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.StorageDemoService;
import lombok.RequiredArgsConstructor;

/** 보호자 앱 수납 API — /api/storage (로컬 storageApi MOCK 과 동일) */
@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
public class StorageController {

    private final StorageDemoService storageDemoService;

    @GetMapping("/patients")
    public ResponseEntity<Map<String, Object>> getPatients(@RequestParam(required = false) Long id) {
        return ok(storageDemoService.listPatients(id));
    }

    @GetMapping("/invoices")
    public ResponseEntity<Map<String, Object>> getInvoices(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) Long patientId) {
        Long pid = id != null ? id : patientId;
        return ok(storageDemoService.listInvoices(pid));
    }

    @GetMapping("/payments")
    public ResponseEntity<Map<String, Object>> getPayments(
            @RequestParam(required = false) Long patientId) {
        return ok(storageDemoService.listPayments(patientId));
    }

    @GetMapping("/overdue")
    public ResponseEntity<Map<String, Object>> getOverdue(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Integer limit) {
        return ok(storageDemoService.listOverdue(patientId, limit));
    }

    @PostMapping("/payments")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> body) {
        return ok(Map.of("accepted", true, "payload", body));
    }

    @PutMapping("/outstanding-balance")
    public ResponseEntity<Map<String, Object>> updateOutstandingBalance(
            @RequestBody Map<String, Object> body) {
        return ok(Map.of("accepted", true, "payload", body));
    }

    @PostMapping("/payments/cancel")
    public ResponseEntity<Map<String, Object>> cancelPayment(@RequestBody Map<String, Object> body) {
        return ok(Map.of("accepted", true, "payload", body));
    }

    @PostMapping("/receipts/print")
    public ResponseEntity<Map<String, Object>> printReceipt(@RequestBody Map<String, Object> body) {
        return ok(Map.of("url", null));
    }

    @PostMapping("/alarms")
    public ResponseEntity<Map<String, Object>> sendAlarm(@RequestBody Map<String, Object> body) {
        return ok(Map.of("accepted", true));
    }

    private static ResponseEntity<Map<String, Object>> ok(Object data) {
        return ResponseEntity.ok(Map.of("data", data));
    }
}
