package hiddencore.ddasum.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import hiddencore.ddasum.backend.domain.MedicationDetail;

public interface MedicationDetailRepository extends JpaRepository<MedicationDetail, Long> {

    List<MedicationDetail> findByMedication_MedicationIdOrderByMedicationDetailIdAsc(Long medicationId);

    void deleteByMedication_MedicationId(Long medicationId);
}