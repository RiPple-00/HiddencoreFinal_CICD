package hiddencore.ddasum.backend.service;

import hiddencore.ddasum.backend.web.dto.BedResponseDto;
import hiddencore.ddasum.backend.web.dto.PatientAssignSearchResponseDto;

import java.util.List;

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
    public List<BedResponseDto> getBedsByRoom(String room, String building) {
        List<Location> locations = (building != null && !building.isBlank())
                ? locationRepository.findByBuildingAndRoomOrderByBedAsc(building, room)
                : locationRepository.findByRoomOrderByBedAsc(room);
        return locations.stream()
                .map(this::toDto)
                .toList();
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
        if (patient == null) {
            patient = patientRepository.findByLocationId_LocationId(location.getLocationId())
                    .orElse(null);
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