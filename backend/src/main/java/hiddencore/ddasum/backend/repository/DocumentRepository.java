package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(Long patientId, DocumentType type);
}
