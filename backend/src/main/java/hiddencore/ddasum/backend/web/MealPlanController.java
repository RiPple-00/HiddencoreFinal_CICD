package hiddencore.ddasum.backend.web;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.service.MealPlanService;
import hiddencore.ddasum.backend.web.dto.MealPlanDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Meal", description = "식단 API")
@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 🔥 프론트 연결 필수 (CORS)
public class MealPlanController {

    private final MealPlanService mealPlanService;

    /**
     * 📌 1. 엑셀 업로드 (bulk 저장)
     */
    @Operation(summary = "식단 일괄 등록/수정", description = "날짜별 식단을 여러 건 업데이트합니다.")
    @PostMapping("/bulk")
    public ResponseEntity<MealPlanDto.BulkUpsertResponse> bulkUpsert(
            @Valid @RequestBody MealPlanDto.BulkUpsertRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser
    ) {
        Long adminId = authenticatedUser.userId();
        return ResponseEntity.ok(mealPlanService.bulkUpsert(request, adminId));
    }

    /**
     * 📌 2. 날짜별 조회 (캘린더용)
     * GET /api/meals/by-date?date=2026-04-01
     */
    @Operation(summary = "날짜별 식단 조회", description = "특정 날짜 식단 목록을 조회합니다.")
    @GetMapping("/by-date")
    public ResponseEntity<List<MealPlanDto.MealPlanResponse>> getByDate(
            @RequestParam LocalDate date,
            @RequestParam(required = false) Long facilityId
    ) {
        return ResponseEntity.ok(mealPlanService.getByDate(date, facilityId));
    }

    /**
     * 📌 2-1. 월별 식단 조회 (캘린더용)
     */
    @Operation(summary = "범위별 식단 조회", description = "특정 기간 내 식단 목록을 조회합니다.")
    @GetMapping("/by-range")
    public ResponseEntity<List<MealPlanDto.MealPlanResponse>> getByRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            @RequestParam(required = false) Long facilityId
    ) {
        return ResponseEntity.ok(mealPlanService.getByRange(startDate, endDate, facilityId));
    }

    /**
     * 📌 3. 메뉴 수정
     */
    @Operation(summary = "식단 수정", description = "특정 식단 메뉴를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateMeal(
            @PathVariable Long id,
            @Valid @RequestBody MealPlanDto.UpdateRequest request
    ) {
        mealPlanService.update(id, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 📌 4. 메뉴 삭제
     */
    @Operation(summary = "식단 삭제", description = "특정 식단을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeal(
            @PathVariable Long id
    ) {
        mealPlanService.delete(id);
        return ResponseEntity.ok().build();
    }
}