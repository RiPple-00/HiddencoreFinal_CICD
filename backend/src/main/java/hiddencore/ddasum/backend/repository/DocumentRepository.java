package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.Document;
import hiddencore.ddasum.backend.domain.Document.DocumentType;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {

     // 같은 보호자가 같은 프로그램을 이미 신청했는지 확인
    boolean existsByRequesterUserId_UserIdAndPostId_PostIdAndType(
            Long requesterUserId,
            Long postId,
            DocumentType type
    );

    // 보호자의 프로그램 신청 내역 조회
    List<Document> findByRequesterUserId_UserIdAndTypeOrderByRequestedAtDesc(
            Long requesterUserId,
            DocumentType type
    );


}
