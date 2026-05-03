package hiddencore.ddasum.backend.web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;

import hiddencore.ddasum.backend.domain.Schedule.ScheduleType;
import hiddencore.ddasum.backend.security.AuthenticatedUser;
import hiddencore.ddasum.backend.service.ScheduleService;
import hiddencore.ddasum.backend.web.dto.ScheduleResponse;
import hiddencore.ddasum.backend.web.dto.ScheduleCreateRequest;
import hiddencore.ddasum.backend.web.dto.ScheduleUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 월별 일정 조회
    @Operation(summary = "월별 일정 조회", description = "시설 ID와 날짜를 기준으로 해당 월의 일정을 조회합니다.")
    @GetMapping("/month")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesByMonth(
            @RequestParam Long facilityId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam(required = false) String filter) {
        // filter: ALL | PROGRAM | PERSONAL ...
        if (filter == null || filter.isBlank() || "ALL".equalsIgnoreCase(filter)) {
            return ResponseEntity.ok(scheduleService.getSchedulesByMonth(facilityId, date));
        }

        return ResponseEntity.ok(
                scheduleService.getSchedulesByTypeAndMonth(
                        facilityId,
                        hiddencore.ddasum.backend.domain.Schedule.ScheduleType.valueOf(filter.toUpperCase()),
                        date));
    }

    // 오늘 일정 조회
    @Operation(summary = "오늘 일정 조회", description = "시설 ID를 기준으로 오늘의 일정을 조회합니다.")
    @GetMapping("/today")
    public ResponseEntity<List<ScheduleResponse>> getSchedulesForToday(
            @RequestParam Long facilityId) {
        List<ScheduleResponse> schedules = scheduleService.getSchedulesForToday(facilityId);
        return ResponseEntity.ok(schedules);
    }

    // 개인 일정 등록
    @Operation(summary = "개인 일정 등록", description = "개인 일정을 등록합니다.")
    @PostMapping("/personal")
    public ResponseEntity<ScheduleResponse> createPersonalSchedule(@RequestBody ScheduleCreateRequest request) {
        ScheduleResponse created = scheduleService.createPersonalSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 일정 상세 조회
    @Operation(summary = "일정 상세 조회", description = "일정 ID를 기준으로 일정 상세 정보를 조회합니다.")
    @GetMapping("/{scheduleId}")
    public ResponseEntity<ScheduleResponse> getScheduleById(@PathVariable Long scheduleId) {
        ScheduleResponse schedule = scheduleService.getScheduleById(scheduleId);
        return ResponseEntity.ok(schedule);
    }

    // 개인 일정 수정
    @Operation(summary = "개인 일정 수정", description = "개인 일정을 수정합니다.")
    @PutMapping("/personal/{scheduleId}")
    public ResponseEntity<ScheduleResponse> updatePersonalSchedule(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleUpdateRequest request) {
        ScheduleResponse updated = scheduleService.updatePersonalSchedule(scheduleId, request);
        return ResponseEntity.ok(updated);
    }

    // 개인 일정 삭제
    @Operation(summary = "개인 일정 삭제", description = "개인 일정을 삭제합니다.")
    @DeleteMapping("/personal/{scheduleId}")
    public ResponseEntity<Void> deletePersonalSchedule(@PathVariable Long scheduleId) {
        scheduleService.deletePersonalSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }

    // 시설 일정 등록
    @Operation(summary = "시설 일정 등록")
    @PostMapping("/facility")
    public ResponseEntity<ScheduleResponse> createFacilitySchedule(
            @RequestBody ScheduleCreateRequest request,
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        ScheduleResponse created = scheduleService.createFacilitySchedule(request, authenticatedUser.userId(),  ScheduleType.FACILITY);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
