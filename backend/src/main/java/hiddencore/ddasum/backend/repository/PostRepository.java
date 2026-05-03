package hiddencore.ddasum.backend.repository;

import hiddencore.ddasum.backend.domain.Post;
import hiddencore.ddasum.backend.domain.Post.PostType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Pageable;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
        // JpaRepository가 기본 제공: save, findById, findAll, deleteById 등

        /* 게시글 페이지에서 사용할 조회 */
        // 전체 게시글 조회 (= 시설별로 검색 후 전체 공개)
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId JOIN FETCH p.authorUserId " +
                        "WHERE p.facilityId.facilityId = :facilityId AND p.status = 'ACTIVE'")
        List<Post> findAllByFacility(@Param("facilityId") Long facilityId, Pageable pageable);

        // 시설 + 타입 조회
        // 시설 내 ACTIVE + 타입 필터
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId JOIN FETCH p.authorUserId " +
                        "WHERE p.facilityId.facilityId = :facilityId AND p.status = 'ACTIVE' AND p.type = :type")
        List<Post> findAllByFacilityAndType(@Param("facilityId") Long facilityId,
                        @Param("type") PostType type,
                        Pageable pageable);

        // 시설 내 단건 조회 (목록·상세 공개용: ACTIVE만)
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE p.postId = :postId AND f.facilityId = :facilityId AND p.status = 'ACTIVE'")
        Optional<Post> findByIdInFacility(@Param("postId") Long postId,
                        @Param("facilityId") Long facilityId);

        /** 시설 + 글 ID (상세 조회: 임시저장 INACTIVE·예약 RESERVE 포함) */
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE p.postId = :postId AND f.facilityId = :facilityId")
        Optional<Post> findByPostIdAndFacilityId(@Param("postId") Long postId,
                        @Param("facilityId") Long facilityId);

        /* 유저 마이 페이지 조회 */

        // 1. 작성 기록 페이지 (ACTIVE 글 전체)
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE a.userId = :userId AND p.status = 'ACTIVE'")
        List<Post> findActiveByUser(@Param("userId") Long userId, Pageable pageable);

        // 1-1. 작성 기록 + 타입 필터 (NOTICE, BOARD, PROGRAM)
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE a.userId = :userId AND p.status = 'ACTIVE' AND p.type = :type")
        List<Post> findActiveByUserAndType(@Param("userId") Long userId,
                        @Param("type") PostType type,
                        Pageable pageable);

        // 2. 임시 저장 페이지 (INACTIVE 글 전체)
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE a.userId = :userId AND p.status = 'INACTIVE'")
        List<Post> findInactiveByUser(@Param("userId") Long userId, Pageable pageable);

        // 2-1. 임시 저장 + 타입 필터
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE a.userId = :userId AND p.status = 'INACTIVE' AND p.type = :type")
        List<Post> findInactiveByUserAndType(@Param("userId") Long userId,
                        @Param("type") PostType type,
                        Pageable pageable);

        // 검색 기능

        // 시설 내 검색 (타입 + 검색 범위 선택)
        @Query("SELECT p FROM Post p JOIN FETCH p.facilityId f JOIN FETCH p.authorUserId a " +
                        "WHERE f.facilityId = :facilityId AND p.status = 'ACTIVE' AND p.type = :type " +
                        "AND (" +
                        "  (:searchType = 'title'   AND p.title LIKE %:keyword%) OR " +
                        "  (:searchType = 'content' AND p.content LIKE %:keyword%) OR " +
                        "  (:searchType = 'all'     AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%))" +
                        ")")
        List<Post> searchInFacility(@Param("facilityId") Long facilityId,
                        @Param("type") PostType type,
                        @Param("searchType") String searchType,
                        @Param("keyword") String keyword,
                        Pageable pageable);
}