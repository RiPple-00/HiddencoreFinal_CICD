package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.web.dto.BedResponseDto;
import hiddencore.ddasum.backend.web.dto.PatientAssignSearchResponseDto;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import hiddencore.ddasum.backend.domain.Location;
import hiddencore.ddasum.backend.domain.Patient;
import hiddencore.ddasum.backend.repository.LocationRepository;
import hiddencore.ddasum.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BedRoomService {

    private final LocationRepository locationRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<BedResponseDto> getBedsByRoom(String room, String building, Integer floor) {
        String normalizedRoom = normalizeRoom(room);
        List<Location> locations;

        if (building != null && !building.isBlank() && floor != null) {
            locations =
                    locationRepository.findByBuildingAndFloorAndRoomOrderByBedAsc(
                            building, floor, normalizedRoom);
        } else if (building != null && !building.isBlank()) {
            locations =
                    locationRepository.findByBuildingAndRoomOrderByBedAsc(building, normalizedRoom);
        } else {
            locations = locationRepository.findByRoomOrderByBedAsc(normalizedRoom);
        }

        List<Location> deduped = deduplicateByBed(locations);
        int capacity =
                deduped.stream()
                        .map(Location::getRoomCapacity)
                        .filter(Objects::nonNull)
                        .filter(c -> c > 0)
                        .findFirst()
                        .orElse(Math.max(deduped.size(), 1));

        Map<Integer, Location> byBed = new LinkedHashMap<>();
        for (Location loc : deduped) {
            if (loc.getBed() != null) {
                byBed.putIfAbsent(loc.getBed(), loc);
            }
        }

        List<BedResponseDto> result = new ArrayList<>();
        for (int bedNo = 1; bedNo <= capacity; bedNo++) {
            Location loc = byBed.get(bedNo);
            if (loc != null) {
                result.add(toDto(loc));
            }
        }
        return result;
    }

    private static String normalizeRoom(String room) {
        if (room == null) {
            return "";
        }
        return room.replaceAll("호$", "").trim();
    }

    /** 동일 병실·침상 번호 중복 LOCATION 행 제거 (원무 4인실 = 침상 1~4 각 1건) */
    private static List<Location> deduplicateByBed(List<Location> locations) {
        Map<Integer, Location> best = new LinkedHashMap<>();
        for (Location loc : locations) {
            if (loc.getBed() == null) {
                continue;
            }
            Location prev = best.get(loc.getBed());
            if (prev == null || preferLocation(loc, prev)) {
                best.put(loc.getBed(), loc);
            }
        }
        return best.values().stream()
                .sorted(Comparator.comparing(Location::getBed))
                .toList();
    }

    /** 양방향 배정(location↔patient)이 맞는 행을 우선 — 점유만 있고 역참조가 어긋난 중복 행 제외 */
    private static boolean preferLocation(Location candidate, Location current) {
        int cScore = locationTrustScore(candidate);
        int pScore = locationTrustScore(current);
        if (cScore != pScore) {
            return cScore > pScore;
        }
        return candidate.getLocationId() < current.getLocationId();
    }

    private static int locationTrustScore(Location loc) {
        if (loc == null) {
            return 0;
        }
        Patient patient = loc.getPatientId();
        if (patient == null) {
            return Boolean.TRUE.equals(loc.getIsOccupied()) ? 1 : 0;
        }
        Location patientLoc = patient.getLocationId();
        if (patientLoc != null
                && Objects.equals(patientLoc.getLocationId(), loc.getLocationId())) {
            return 10;
        }
        return 2;
    }

    @Transactional(readOnly = true)
    public List<PatientAssignSearchResponseDto> getSearchPatientsForAssign(String keyword) {
        String safeKeyword = keyword == null ? "" : keyword.trim();
        if (safeKeyword.isEmpty()) {
            return List.of();
        }

        return patientRepository.searchByNameContaining(safeKeyword).stream()
                .map(PatientAssignSearchResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PatientAssignSearchResponseDto> getUnassignedPatientsForAssign() {
        return patientRepository.findUnassignedForAssign().stream()
                .map(PatientAssignSearchResponseDto::from)
                .toList();
    }

    @Transactional
    public void assignPatientToBed(Long locationId, Long patientId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("병상을 찾을 수 없습니다."));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("환자를 찾을 수 없습니다."));

        Location previousLocation = patient.getLocationId();
        if (previousLocation != null && !previousLocation.getLocationId().equals(locationId)) {
            previousLocation.setPatientId(null);
            previousLocation.setIsOccupied(false);
            locationRepository.save(previousLocation);
        }

        Patient previousPatient = location.getPatientId();
        if (previousPatient != null && !previousPatient.getPatientId().equals(patientId)) {
            previousPatient.setLocationId(null);
            patientRepository.save(previousPatient);
        }

        location.setPatientId(patient);
        location.setIsOccupied(true);
        patient.setLocationId(location);
        locationRepository.save(location);
        patientRepository.save(patient);
    }

    private BedResponseDto toDto(Location location) {
        Patient patient = location.getPatientId();
        if (patient != null) {
            Location patientLoc = patient.getLocationId();
            if (patientLoc != null
                    && !Objects.equals(patientLoc.getLocationId(), location.getLocationId())) {
                patient = null;
            }
        }
        return BedResponseDto.from(location, patient);
    }

    @Transactional
    public void deletePatientFromBed(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("병상을 찾을 수 없습니다."));
        Patient patient = location.getPatientId();
        if (patient == null) {
            patient = patientRepository.findByLocationId_LocationId(locationId).orElse(null);
        }
        if (patient != null) {
            patient.setLocationId(null);
            patientRepository.save(patient);
        }
        location.setPatientId(null);
        location.setIsOccupied(false);
        locationRepository.save(location);
    }

}