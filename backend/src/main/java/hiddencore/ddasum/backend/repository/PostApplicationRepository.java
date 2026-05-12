package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.PostApplication;
import hiddencore.ddasum.backend.domain.PostApplication.PostApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostApplicationRepository extends JpaRepository<PostApplication, Long> {

    @Query("""
        SELECT pa
        FROM PostApplication pa
        JOIN FETCH pa.postId p
        JOIN FETCH pa.patientId patient
        LEFT JOIN FETCH pa.guardianUserId guardian
        LEFT JOIN FETCH pa.document document
        WHERE p.facilityId.facilityId = :facilityId
          AND p.postId = :postId
        ORDER BY pa.appliedAt ASC, pa.applicationId ASC
    """)
    List<PostApplication> findManagementApplications(
            @Param("facilityId") Long facilityId,
            @Param("postId") Long postId);

    @Query("""
        SELECT pa
        FROM PostApplication pa
        JOIN FETCH pa.postId p
        JOIN FETCH pa.patientId patient
        LEFT JOIN FETCH pa.guardianUserId guardian
        LEFT JOIN FETCH pa.processedBy processor
        LEFT JOIN FETCH pa.document document
        WHERE p.facilityId.facilityId = :facilityId
          AND p.postId = :postId
          AND pa.applicationId = :applicationId
    """)
    Optional<PostApplication> findManagementApplication(
            @Param("facilityId") Long facilityId,
            @Param("postId") Long postId,
            @Param("applicationId") Long applicationId);

    int countByPostId_PostIdAndStatus(Long postId, PostApplicationStatus status);

    Optional<PostApplication> findByDocument_DocumentId(Long documentId);
}
