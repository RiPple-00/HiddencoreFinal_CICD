package hiddencore.ddasum.backend.web;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.GuardianVisitService;
import hiddencore.ddasum.backend.service.VisitAvailabilityService;
import hiddencore.ddasum.backend.web.dto.VisitRequestDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/guardian-visits")
@RequiredArgsConstructor
public class GuardianVisitController {

    private final VisitAvailabilityService visitAvailabilityService;
    private final GuardianVisitService guardianVisitService;

    /** 면회 신청 저장 (DB insert) */
    @PostMapping
    public ResponseEntity<VisitRequestDto.CreateResponse> createVisit(
            @Valid @RequestBody VisitRequestDto.CreateRequest body) {
        VisitRequestDto.CreateResponse res = guardianVisitService.createVisit(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // 가능 시간 조회 API
    @GetMapping("/available-times")
    public List<LocalTime> getAvailableTimes(@RequestParam LocalDate date) {
        return visitAvailabilityService.getAvailableTimes(date);
    }

    // 신청 등록 API (레거시·간단 조회용)
    @GetMapping("/apply")
    public String applyForVisit(@RequestParam LocalDate date, @RequestParam LocalTime time) {
        boolean success = visitAvailabilityService.applyForVisit(date, time);
        return success ? "방문 신청이 성공적으로 등록되었습니다." : "선택한 시간은 이미 예약되어 있습니다.";
    }

    // 내 목록 조회 API
    @GetMapping("/my-visits")
    public List<String> getMyVisits() {
        return visitAvailabilityService.getMyVisits();
    }

    // 내 상세 조회 API
    @GetMapping("/my-visits/detail")
    public String getVisitDetail(@RequestParam Long visitId) {
        return visitAvailabilityService.getVisitDetail(visitId);
    }
}
