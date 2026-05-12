package hiddencore.ddasum.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentStatus;
import hiddencore.ddasum.backend.domain.Document.DocumentType;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findTop5ByPatientId_PatientIdAndTypeOrderByCreatedAtDesc(Long patientId, DocumentType type);

    /** 동일 프로그램에 이미 진행 중인 신청이 있는지(반려 후 재신청은 허용) */
    boolean existsByRequesterUserId_UserIdAndPostId_PostIdAndTypeAndStatusIn(
            Long requesterUserId,
            Long postId,
            DocumentType type,
            Collection<DocumentStatus> statuses);

    List<Document> findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
            Long requesterUserId,
            DocumentType type);

    Optional<Document> findByDocumentIdAndRequesterUserId_UserIdAndType(
            Long documentId,
            Long requesterUserId,
            DocumentType type);
}
