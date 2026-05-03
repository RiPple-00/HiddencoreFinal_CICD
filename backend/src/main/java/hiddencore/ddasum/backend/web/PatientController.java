package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.service.BedRoomService;
import hiddencore.ddasum.backend.service.PatientService;
import hiddencore.ddasum.backend.web.dto.PatientAssignSearchResponseDto;
import hiddencore.ddasum.backend.web.dto.PatientDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Patients", description = "환자 등록·조회·수정 및 병상 배정용 검색")
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final BedRoomService bedRoomService;

    @Operation(summary = "환자 전체 목록", description = "시설 소속 환자 목록을 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public ResponseEntity<List<PatientDto.ListResponse>> getPatients() {
        return ResponseEntity.ok(patientService.getPatients());
    }

    /** 병상 배정 모달용 이름 검색 ({patientId} 보다 먼저 매칭되도록 위에 둠) */
    @Operation(summary = "병상 배정용 환자 검색", description = "이름 키워드로 환자를 검색합니다. 키워드가 비면 빈 목록을 반환합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/search")
    public ResponseEntity<List<PatientAssignSearchResponseDto>> searchPatientsForAssign(
            @Parameter(description = "검색 키워드(이름 일부)", example = "김") @RequestParam(defaultValue = "") String keyword) {
        return ResponseEntity.ok(bedRoomService.getSearchPatientsForAssign(keyword));
    }

    @Operation(summary = "환자 상세 조회", description = "patient_id로 환자 상세 정보를 조회합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "400", description = "환자 없음 등")
    @GetMapping("/{patientId}")
    public ResponseEntity<PatientDto.DetailResponse> getPatient(
            @Parameter(description = "환자 ID", example = "260401001") @PathVariable Long patientId) {
        return ResponseEntity.ok(patientService.getPatient(patientId));
    }

    @Operation(summary = "환자 등록", description = "신규 환자를 등록합니다.")
    @ApiResponse(responseCode = "201", description = "등록 성공")
    @PostMapping
    public ResponseEntity<PatientDto.DetailResponse> createPatient(
            @RequestBody PatientDto.CreateRequest request) {
        return new ResponseEntity<>(patientService.createPatient(request), HttpStatus.CREATED);
    }

    @Operation(summary = "환자 정보 수정", description = "기존 환자 정보를 수정합니다.")
    @ApiResponse(responseCode = "200", description = "수정 성공")
    @ApiResponse(responseCode = "400", description = "환자 없음 등")
    @PutMapping("/{patientId}")
    public ResponseEntity<PatientDto.DetailResponse> updatePatient(
            @Parameter(description = "환자 ID", example = "260401001") @PathVariable Long patientId,
            @RequestBody PatientDto.UpdateRequest request) {
        return ResponseEntity.ok(patientService.updatePatient(patientId, request));
    }
}
