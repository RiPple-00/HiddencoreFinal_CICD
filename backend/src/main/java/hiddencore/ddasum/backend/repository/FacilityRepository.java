package hiddencore.ddasum.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import hiddencore.ddasum.backend.domain.Facility;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    Optional<Facility> findByFacilityCode(String facilityCode);

    boolean existsByFacilityCode(String facilityCode);
}
