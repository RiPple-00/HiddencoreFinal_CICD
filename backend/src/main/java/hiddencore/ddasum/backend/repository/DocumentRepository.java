package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {
}
