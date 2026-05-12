package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByFacilityId_FacilityId(Long facilityId);

    Optional<Patient> findByLocationId_LocationId(Long locationId);

    List<Patient> findByNameContainingIgnoreCase(String name);

    @Query("""
        SELECT DISTINCT p
        FROM Patient p
        LEFT JOIN FETCH p.locationId
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Patient> searchByNameContaining(@Param("keyword") String keyword);

    @Query("""
        SELECT COUNT(p)
        FROM Patient p
        WHERE p.locationId.building = :building
          AND p.locationId.floor = :floor
          AND p.locationId.room = :room
          AND (p.dischargeDate IS NULL OR p.dischargeDate > CURRENT_DATE)
    """)
    long countActiveByRoom(String building, Integer floor, String room);
    
}
