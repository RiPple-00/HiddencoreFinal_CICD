package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Long> {

    List<Medication> findByPatientId_PatientIdOrderByPrescriptionDateDesc(Long patientId);

    List<Medication> findByPatientId_PatientIdAndGuardianId_UserIdOrderByPrescriptionDateDescMedicationIdDesc(
            Long patientId,
            Long guardianId
    );
}