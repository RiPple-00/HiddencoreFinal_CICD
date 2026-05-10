package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.service.caregiver.CaregiverCareCheckService;
import hiddencore.ddasum.backend.web.dto.caregiver.CaregiverCareCheckDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 간병인 일일 업무 체크리스트 (Document.type=CARE_CHECK) REST 컨트롤러.
 *
 * <p>저장 시 화면 입력값이 JSON 으로 직렬화되어 Document.content 에 그대로 적재되고,
 * 조회 시에는 다시 JSON 을 풀어서 객체로 돌려준다 ⇒ 추후 "정보를 빼낼때는 document에 저장된 것을 json으로 바꿔서 빼낼 수 있도록".
 */
@Tag(name = "CaregiverCareCheck", description = "간병인 일일 업무 체크리스트 - 자동 저장 / 제출 / 조회")
@RestController
@RequestMapping("/api/caregiver/care-checks")
@RequiredArgsConstructor
public class CaregiverCareCheckController {

    private final CaregiverCareCheckService careCheckService;

    @Operation(summary = "자동 저장(임시저장)",
            description = "프론트가 디바운스해 호출. 동일 (환자, 날짜) 가 있으면 갱신, 없으면 생성한다.")
    @ApiResponse(responseCode = "200", description = "저장 성공")
    @PostMapping("/auto-save")
    public ResponseEntity<CaregiverCareCheckDto.Response> autoSave(
            @RequestBody CaregiverCareCheckDto.SaveRequest request) {
        return ResponseEntity.ok(careCheckService.autoSave(request));
    }

    @Operation(summary = "제출하기",
            description = "체크리스트를 제출 상태(PENDING_APPROVAL)로 승격한다. 본문은 자동 저장과 동일.")
    @ApiResponse(responseCode = "200", description = "제출 성공")
    @PostMapping("/submit")
    public ResponseEntity<CaregiverCareCheckDto.Response> submit(
            @RequestBody CaregiverCareCheckDto.SaveRequest request) {
        return ResponseEntity.ok(careCheckService.submit(request));
    }

    @Operation(summary = "단건 조회",
            description = "특정 환자의 특정 일자 체크리스트를 가져온다. 데이터가 없으면 빈 응답을 반환한다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<CaregiverCareCheckDto.Response> getOne(
            @Parameter(description = "환자 ID", example = "1")
            @RequestParam Long patientId,
            @Parameter(description = "기록 일자(yyyy-MM-dd). 미지정 시 오늘.", example = "2026-05-11")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(careCheckService.getOne(patientId, date));
    }

    @Operation(summary = "환자별 이력 목록", description = "환자의 CARE_CHECK 문서 이력을 최신순으로 반환한다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/history")
    public ResponseEntity<List<CaregiverCareCheckDto.Response>> getHistory(
            @Parameter(description = "환자 ID", example = "1") @RequestParam Long patientId) {
        return ResponseEntity.ok(careCheckService.getHistory(patientId));
    }
}
