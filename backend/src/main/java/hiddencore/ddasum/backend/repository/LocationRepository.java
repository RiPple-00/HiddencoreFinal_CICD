package hiddencore.ddasum.backend.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hiddencore.ddasum.backend.domain.Location;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByRoomOrderByBedAsc(String room);
    List<Location> findByBuildingAndRoomOrderByBedAsc(String building, String room);

    Optional<Location> findByBuildingAndRoomAndBed(String building, String room, Integer bed);

    List<Location> findByBuildingAndFloorOrderByRoomAscBedAsc(String building, Integer floor);

    List<Location> findByBuildingAndFloorAndRoomOrderByBedAsc(String building, Integer floor, String room);

    List<Location> findByFacilityId_FacilityId(Long facilityId);
}