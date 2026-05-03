package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.repository.LocationRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import hiddencore.ddasum.backend.web.dto.LocationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<LocationDto.RoomSummaryDto> getRoomSummary(String building, Integer floor) {
        List<Location> locations = locationRepository.findByBuildingAndFloorOrderByRoomAscBedAsc(building, floor);

        Map<String, List<Location>> roomMap = new LinkedHashMap<>();

        for (Location location : locations) {
            roomMap.computeIfAbsent(location.getRoom(), key -> new ArrayList<>()).add(location);
        }

        List<LocationDto.RoomSummaryDto> result = new ArrayList<>();

        for (Map.Entry<String, List<Location>> entry : roomMap.entrySet()) {
            List<Location> roomLocations = entry.getValue();
            Location first = roomLocations.get(0);

            long locationCount = roomLocations.size();
            long patientCount = patientRepository.countActiveByRoom(
                    first.getBuilding(),
                    first.getFloor(),
                    first.getRoom());

            Integer roomCapacity = first.getRoomCapacity();

            result.add(LocationDto.RoomSummaryDto.builder()
                    .building(first.getBuilding())
                    .floor(first.getFloor())
                    .room(first.getRoom())
                    .roomType(first.getRoomType())
                    .roomGenderType(first.getRoomGenderType())
                    .locationCount(locationCount)
                    .patientCount(patientCount)
                    .roomCapacity(roomCapacity)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public LocationDto.RoomSummaryDto getRoomPatientCount(String building, Integer floor, String room) {
        List<Location> roomLocations = locationRepository.findByBuildingAndFloorAndRoomOrderByBedAsc(building, floor,
                room);

        if (roomLocations.isEmpty()) {
            throw new IllegalArgumentException("해당 병실이 존재하지 않습니다.");
        }

        Location first = roomLocations.get(0);
        long patientCount = patientRepository.countActiveByRoom(building, floor, room);

        return LocationDto.RoomSummaryDto.builder()
                .building(first.getBuilding())
                .floor(first.getFloor())
                .room(first.getRoom())
                .roomType(first.getRoomType())
                .roomGenderType(first.getRoomGenderType())
                .locationCount((long) roomLocations.size())
                .patientCount(patientCount)
                .roomCapacity(first.getRoomCapacity())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LocationDto.LocationCardDto> getAllLocations(Long facilityId) {
        return locationRepository.findByFacilityId_FacilityId(facilityId)
                .stream()
                .map(LocationDto.LocationCardDto::from)
                .toList();
    }

}
