package hiddencore.ddasum.backend.web;

import hiddencore.ddasum.backend.service.LocationService;
import hiddencore.ddasum.backend.web.dto.LocationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@Tag(name = "Location", description = "병실 API")
@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @Operation(summary = "층별 병실 환자 수 목록", description = "선택한 병동/층의 각 병실별 환자 수를 조회합니다.")
    @GetMapping("/rooms/summary")
    public ResponseEntity<List<LocationDto.RoomSummaryDto>> getRoomSummary(
            @Parameter(description = "건물(병동)", example = "A") @RequestParam String building,
            @Parameter(description = "층", example = "1") @RequestParam Integer floor) {
        return ResponseEntity.ok(locationService.getRoomSummary(building, floor));
    }

    @Operation(summary = "병실 환자 수 조회", description = "지정한 병실에 현재 입원 중인 환자 수를 조회합니다.")
    @GetMapping("/room/count")
    public ResponseEntity<LocationDto.RoomSummaryDto> getRoomPatientCount(
            @Parameter(description = "건물") @RequestParam String building,
            @Parameter(description = "층") @RequestParam Integer floor,
            @Parameter(description = "병실 번호") @RequestParam String room) {
        LocationDto.RoomSummaryDto response = locationService.getRoomPatientCount(building, floor, room);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "시설 전체 병상 조회")
    @GetMapping("/all")
    public ResponseEntity<List<LocationDto.LocationCardDto>> getAllLocations(
            @RequestParam Long facilityId) {
        return ResponseEntity.ok(locationService.getAllLocations(facilityId));
    }
}
