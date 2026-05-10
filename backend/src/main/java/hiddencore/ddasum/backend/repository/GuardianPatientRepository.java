package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.GuardianPatient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuardianPatientRepository extends JpaRepository<GuardianPatient, Long> {

    List<GuardianPatient> findByGuardianUserId_UserId(Long guardianUserId);

    /** 주 보호자(isPrimary) 우선 */
    List<GuardianPatient> findByPatientId_PatientIdOrderByIsPrimaryDesc(Long patientId);

    Optional<GuardianPatient> findByGuardianUserId_UserIdAndPatientId_PatientId(
            Long guardianUserId,
            Long patientId);
}
