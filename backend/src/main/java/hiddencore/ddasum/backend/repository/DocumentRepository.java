package hiddencore.ddasum.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentType;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(Long patientId, DocumentType type);

    boolean existsByRequesterUserId_UserIdAndPostId_PostIdAndType(
            Long requesterUserId,
            Long postId,
            DocumentType type);

    List<Document> findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
            Long requesterUserId,
            DocumentType type);

    Optional<Document> findByDocumentIdAndRequesterUserId_UserIdAndType(
            Long documentId,
            Long requesterUserId,
            DocumentType type);
}
