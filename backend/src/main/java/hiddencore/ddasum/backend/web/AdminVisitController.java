package hiddencore.ddasum.backend.web;

import java.security.Guard;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.service.GuardianVisitService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin-visits")
@RequiredArgsConstructor
public class AdminVisitController {

    private final GuardianVisitService guardianVisitService;
    
    // 신청 목록 조회 API
    @GetMapping("/applications")
    public String getVisitApplications() {
        // 신청 목록 조회 로직 구현
        return "방문 신청 목록";
    }

    // 신청 상세 조회 API
    @GetMapping("/applications/detail")
    public String getVisitApplicationDetail(@RequestParam Long visitId) {
        // 신청 상세 조회 로직 구현
        return "방문 신청 상세 정보";
    }

    // 신청 승인 API
    @PostMapping("/applications/approve")
    public String approveVisitApplication(@RequestParam Long visitId) {
        // 승인 로직 구현
        return "방문 신청이 승인되었습니다.";
    }
    // 신청 반려 API
    @PostMapping("/applications/reject")
    public String rejectVisitApplication(@RequestParam Long visitId) {
        // 반려 로직 구현
        return "방문 신청이 반려되었습니다.";
    }

}
