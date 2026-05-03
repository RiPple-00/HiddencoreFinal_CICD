package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.service.BedRoomService;
import hiddencore.ddasum.backend.web.dto.AssignPatientToBedRequest;
import hiddencore.ddasum.backend.web.dto.BedResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Rooms", description = "병실별 병상 조회 및 환자 침상 배정")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class BedRoomController {

    private final BedRoomService bedRoomService;

    @Operation(summary = "병실별 병상 목록", description = "path의 room은 DB LOCATION.room 컬럼과 동일한 문자열입니다. (예: 303, 301호)")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping("/{room}/beds")
    public ResponseEntity<List<BedResponseDto>> getBedsByRoom(
            @Parameter(description = "병실 식별자 (LOCATION.room)", example = "303") @PathVariable String room,
            @RequestParam(required = false) String building) {
        List<BedResponseDto> beds = bedRoomService.getBedsByRoom(room, building);
        return ResponseEntity.ok(beds);
    }

    @Operation(summary = "침상에 환자 배정", description = "지정한 location(침상)에 환자를 배정합니다. 본문에 patientId가 필요합니다.")
    @ApiResponse(responseCode = "204", description = "배정 완료 (응답 본문 없음)")
    @ApiResponse(responseCode = "400", description = "patientId 누락, 병상/환자 없음 등")
    @PutMapping("/beds/{locationId}/assign")
    public ResponseEntity<Void> assignPatientToBed(
            @Parameter(description = "침상(LOCATION) ID", example = "101") @PathVariable Long locationId,
            @RequestBody AssignPatientToBedRequest body) {
        if (body == null || body.getPatientId() == null) {
            throw new IllegalArgumentException("patientId가 필요합니다.");
        }
        bedRoomService.assignPatientToBed(locationId, body.getPatientId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "침상 환자 배정 해제", description = "해당 침상에서 환자 연결을 끊어 빈 병상으로 만듭니다.")
    @ApiResponse(responseCode = "204", description = "해제 완료")
    @DeleteMapping("/beds/{locationId}/assign")
    public ResponseEntity<Void> unassignPatientFromBed(
            @Parameter(description = "침상(LOCATION) ID") @PathVariable Long locationId) {
        bedRoomService.deletePatientFromBed(locationId);
        return ResponseEntity.noContent().build();
    }

}
